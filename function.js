// function aLocation(lat, lng){
//     this.lat = lat;
//     this.lng = lng;
// }
//getting the data from dataset
import { result } from 'lodash';
import {getHouseData} from './getData';
import { getSchoolData } from "./getData";

//An InfoWindow class item
const infowindow = new google.maps.InfoWindow({
    content: "",
  });

var list = null;

var closest = null;

//Icon image for house and school
const houseMarker = {
    path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillColor: "red",
    fillOpacity: 0.6,
    strokeWeight: 0,
    rotation: 0,
    scale: 2,
    anchor: new google.maps.Point(15, 30),
};
const schoolMarker = {
    path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillColor: "blue",
    fillOpacity: 0.6,
    strokeWeight: 0,
    rotation: 0,
    scale: 2,
    anchor: new google.maps.Point(15, 30),
};


// main function
export function search(geocoder, map, type, schoolType, num, dDuration, dDistance) {
    var data = null;
    //load data and convert it to two class
    if(type == "house"){
        let lowPrice = document.getElementById("priceLow").value;
        let highPrice = document.getElementById("priceHigh").value;
        if(!lowPrice) lowPrice = 0;
        if(!highPrice) highPrice = 0;
        if(isNaN(lowPrice) || isNaN(highPrice)){
            alert("Please input numbers in the price part!");
            return;
        }
        else if(Number(lowPrice) > Number(highPrice)){
            alert("Lowest price cannot be higher than highest price!");
            return;
        }
        if(lowPrice == 0 && highPrice == 0) {
            data = getHouseData(1, 0, 0);
        }
        else {
            data = getHouseData(2, lowPrice, highPrice);
        }
    }
    else if(type == "school"){
        data = getSchoolData(schoolType);
    }

    if(data.length == 0) {
        alert("There are no compliant results!");
        return;
    }

    //get location of user's input
    var center = document.getElementById('addressInput').value;
    if(!center) {
        alert("You must input your address!");
        return;
    }
    
    geocoder.geocode({
        'address' : center
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            
            //refresh the map
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: new google.maps.LatLng(results[0].geometry.location),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            //point user's location
            var marker = new google.maps.Marker({
                map: map,
                title: "Your search point",
                position: results[0].geometry.location
            });

            //sort the data, find closest points
            findClosestN(results[0].geometry.location, 20, data);
            calculateDistances(results[0].geometry.location, num, type, map, dDuration, dDistance);
        } else {
            alert("Search was not successful, please check your input format");
        }
    })
}

// calculate distance and sort by the distance
function findClosestN(center, numberOfResults, data) {
    closest = [];
    for (var i = 0; i < data.length; i++) {
      data[i].distance = google.maps.geometry.spherical.computeDistanceBetween(center, {lat: data[i].lat, lng: data[i].lng});
      closest.push(data[i]);
    }
    closest.sort(sortByDist);
    closest = closest.splice(0, numberOfResults);
}
// the rule of sorting
function sortByDist(a, b) {
    return (a.distance - b.distance)
}


// calculate drive hour and sort by the drive hours
function calculateDistances(center, numberOfResults, type, map, dDuration, dDistance) {
    var service = new google.maps.DistanceMatrixService();
    var results = null;
    var request = {
      origins: [center],
      destinations: [],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };
    for (var i = 0; i < closest.length; i++) {
      request.destinations.push({lat: closest[i].lat, lng: closest[i].lng});
    }
    service.getDistanceMatrix(request, function(response, status) {
      if (status != google.maps.DistanceMatrixStatus.OK) {
        alert('Error was: ' + status);
      } else {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;;
        results = response.rows[0].elements;
        // save title and address in record for sorting
        for (var i = 0; i < closest.length; i++) {
            closest[i].distance = results[i].distance.value;
            closest[i].duration = results[i].duration.value;
          }
        closest.sort(sortByDistDM);
        closest = closest.splice(0, numberOfResults);
        document.getElementById("infoArea").innerHTML = "";
        const infoList = document.createElement("ul");
        infoList.id = "infoList"
        document.getElementById("infoArea").appendChild(infoList);

        //mark the points.
        for(let i = 0; i < closest.length; i++) {
            if(dDistance == 0 && dDuration == 0) {
                markNow(map, type, closest[i]);
            }
            else if(dDistance == 0 && Math.floor(closest[i].duration/60) <= dDuration){
                markNow(map, type, closest[i]);
            }
            else if(dDuration == 0 && (closest[i].distance/1000.0).toFixed(2) <= dDistance){
                markNow(map, type, closest[i]);
            }
            else if(Math.floor(closest[i].duration/60) <= dDuration && (closest[i].distance/1000.0).toFixed(2) <= dDistance){
                markNow(map, type, closest[i]);
            }
        }

        list = document.getElementById("infoList");
      }
      
    });
  }

// the rule of sorting
function sortByDistDM(a, b) {
    return (a.duration - b.duration)
}

// add markers on the map
function markNow(map, type, data) { 
    if(type == "school") {
        var marker = new google.maps.Marker({
            map: map,
            title: "Nearest points",
            position: {lat: data.lat, lng: data.lng},
            icon: schoolMarker
        });
    }
    else {
        var marker = new google.maps.Marker({
            map: map,
            title: "Nearest points",
            position: {lat: data.lat, lng: data.lng},
            icon: houseMarker
        });
    }
    addClickerEvent(type, data, marker, map);
}

// add clicker event for maker and li in the ul
function addClickerEvent(type, data, marker, map) {
    marker.addListener("click", () => {
        map.setCenter({lat: data.lat, lng: data.lng});
        let mainContent = document.createElement("div");
        let title = document.createElement("h6");
        title.innerHTML = data.name;
        let p = document.createElement("p");
        if(type == "house") p.innerHTML += data.price + " £<br/>";
        else p.innerHTML += data.type + "<br/>";
        p.innerHTML += data.street + "<br/> Southampton <br/>" + data.postcode;
        let a = document.createElement("a");
        a.href = "#";
        a.innerHTML = "View Details";
        a.onclick = function(){
            viewDetail(type, data);
        }
        mainContent.appendChild(title);
        mainContent.appendChild(p);
        mainContent.appendChild(a);
        infowindow.setContent(mainContent);
        infowindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
        });
    });
    var infoItem = document.createElement("li");
    infoItem.innerHTML = data.name;
    infoItem.onclick = function(){
        map.setCenter({lat: data.lat, lng: data.lng});
        let mainContent = document.createElement("div");
        let title = document.createElement("h6");
        title.innerHTML = data.name;
        let p = document.createElement("p");
        if(type == "house") p.innerHTML += data.price + " £<br/>";
        else p.innerHTML += data.type + "<br/>";
        p.innerHTML += data.street + "<br/> Southampton <br/>" + data.postcode;
        let a = document.createElement("a");
        a.href = "#";
        a.innerHTML = "View Details";
        a.onclick = function(){
            viewDetail(type, data);
        }
        mainContent.appendChild(title);
        mainContent.appendChild(p);
        mainContent.appendChild(a);
        infowindow.setContent(mainContent);
        infowindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
        });
    }
    document.getElementById("infoList").appendChild(infoItem);
}


function viewDetail(type, data){
    let area = document.getElementById("infoArea");
    let back = document.createElement("a");
    back.innerHTML = "< Back to list";
    back.onclick = function(){
        area.innerHTML = "";
        area.appendChild(list);
    }
    area.innerHTML = "";
    let title = document.createElement("h1");
    title.innerHTML = data.name;
    title.style.textAlign = "center";
    let p = document.createElement("p");
    p.id = "infoView";
    p.appendChild(title);
    if(type == "school"){  
        if(data.stage != "Not applicable"){
            p.innerHTML += "<b>Phase of Education: </b>" + data.stage + "<br/>";
        } 
        p.innerHTML += "<b>Type of school: </b>" + data.type + "<br/>";
        p.innerHTML += "<b>Required Range of Age: </b>";
        if(data.lowAge) {
            p.innerHTML += data.lowAge + " - " + data.highAge + "<br/>";
        }
        else {
            p.innerHTML += "There is no requirement for age <br/>"
        }
        if(data.website) {
            p.innerHTML += "<b>Website: </b>" + data.website + "<br/>";
        }
        p.innerHTML += "<b>Telephone: </b>" + data.telephone + "<br/>";
        if(data.rating) {
            p.innerHTML += "<b>Rating: </b>" + data.rating + "<br/>";
        }
        p.innerHTML += "<b>Driving distance: </b>" + (data.distance/1000.0).toFixed(2) + "km<br/>";
        p.innerHTML += "<b>Driving duration: </b>" + Math.floor(data.duration/60) + "mins<br/>";
        p.innerHTML += "<b>Street: </b>" + data.street + "<br/><b>City: </b>Southampton<br/>";
        p.innerHTML += "<b>Postcode: </b>" + data.postcode + "<br/>";
    }
    else{
        p.innerHTML += "<b>Price: </b>" + data.price + " £<br/>";
        p.innerHTML += "<b>Updated date: </b>" + data.date + "<br/>";
        p.innerHTML += "<b>Driving distance: </b>" + (data.distance/1000.0).toFixed(2) + "km<br/>";
        p.innerHTML += "<b>Driving duration: </b>" + Math.floor(data.duration/60) + "mins<br/>";
        p.innerHTML += "<b>Street: </b>" + data.street + "<br/>";
        p.innerHTML += "<b>Postcode: </b>" + data.postcode + "<br/>";
        if(data.newBuild){
            p.innerHTML += "<b>Good news!</b> It is a new built house!<br/>";
        }
    }
    var btn = document.createElement("button");
    btn.innerHTML = "Set this point's coordinates as the center";
    btn.onclick = function(){
        document.getElementById("addressInput").value = data.postcode;
    }
    p.appendChild(back);
    p.appendChild(btn);
    area.appendChild(p);
    

}
