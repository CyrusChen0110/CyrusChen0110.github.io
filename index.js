import { search } from "./function";
import Logo from "./logo.png";
import './reset.css';
import './index.css';



var map = null;
var geocoder = null;

var result = [];



function initialize() {
    // alert("init");
    document.getElementById('logo').setAttribute('src',Logo);
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: new google.maps.LatLng(50.9105468, -1.4049018),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}


// function loadingData() {
//     if(i < 157) {
//         makePointer(posData[i].postcode, geocoder);
//         setTimeout(loadingData, 1000);
//         i = i + 1;
//         console.log(i);
//     }
//     else {
//         result = JSON.stringify(result, undefined, 4)
//         console.log(result);
//         var blob = new Blob([result], {type: 'text/json'}),
//         e = document.createEvent('MouseEvents'),
//         a = document.createElement('a')
//         a.download = "school2.json"
//         a.href = window.URL.createObjectURL(blob)
//         a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
//         e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
//         a.dispatchEvent(e)
//     }
// }




initialize();
var houseBox = document.getElementById('houseBox');
var schoolBox = document.getElementById('schoolBox');
var schoolTypePrimary = document.getElementById('primary');
var schoolTypeSecondary = document.getElementById('secondary');
var schoolTypeOther = document.getElementById('other');
var priceLow = document.getElementById("priceLow");
var priceHigh = document.getElementById("priceHigh");
var schoolType = 0;
houseBox.style.color = "#fff";
houseBox.style.backgroundColor = "#e74747";

schoolTypePrimary.onclick = function(){
    if(schoolTypePrimary.style.backgroundColor == "rgb(136, 90, 97)"){
        schoolTypePrimary.style.backgroundColor = "rgb(228, 153, 165)";
        schoolType -= 1;
    }
    else {
        schoolTypePrimary.style.backgroundColor = "rgb(136, 90, 97)";
        schoolType += 1;
    }
}

schoolTypeSecondary.onclick = function(){
    if(schoolTypeSecondary.style.backgroundColor == "rgb(136, 90, 97)"){
        schoolTypeSecondary.style.backgroundColor = "rgb(228, 153, 165)";
        schoolType -= 2;
    }
    else {
        schoolTypeSecondary.style.backgroundColor = "rgb(136, 90, 97)";
        schoolType += 2;
    }
}

schoolTypeOther.onclick = function(){
    if(schoolTypeOther.style.backgroundColor == "rgb(136, 90, 97)"){
        schoolTypeOther.style.backgroundColor = "rgb(228, 153, 165)";
        schoolType -= 4;
    }
    else {
        schoolTypeOther.style.backgroundColor = "rgb(136, 90, 97)";
        schoolType += 4;
    }
}

houseBox.onclick = function(){
    houseBox.style.color = "#fff";
    houseBox.style.backgroundColor = "#e74747";
    schoolBox.style.color = "rgb(170, 170, 170)";
    schoolBox.style.backgroundColor = "#476ca0";
    schoolTypePrimary.style.display = "none";
    schoolTypeSecondary.style.display = "none";
    schoolTypeOther.style.display = "none";
    priceLow.style.display = "block";
    priceHigh.style.display = "block";
}

schoolBox.onclick = function(){
    schoolBox.style.color = "#fff";
    schoolBox.style.backgroundColor = "#6ca3f1";
    houseBox.style.color = "rgb(170, 170, 170)";
    houseBox.style.backgroundColor = "#8a2b2b";
    schoolTypePrimary.style.display = "block";
    schoolTypeSecondary.style.display = "block";
    schoolTypeOther.style.display = "block";
    priceLow.style.display = "none";
    priceHigh.style.display = "none";
}

document.getElementById('submitBox').onclick = function(){
    var sType = null;
    if(houseBox.style.color == "rgb(255, 255, 255)"){
        sType = "house";
    }
    else if(schoolBox.style.color == "rgb(255, 255, 255)"){
        sType = "school";
    }
    else {
        alert("You must choose a type to search!");
    }
    var resultNum = document.getElementById('searchNum').value;
    var maxDuration = document.getElementById('duration').value;
    var maxDistance = document.getElementById('distance').value;
    if(!resultNum) resultNum = 10;
    if(!maxDuration) maxDuration = 0;
    if(!maxDistance) maxDistance = 0;
    if(isNaN(resultNum) || isNaN(maxDuration) || isNaN(maxDistance)){
        alert("You should input number in the Driving time, Driving distance and Number of result parts!");
        return;
    }
    if(resultNum <= 0 || resultNum > 20){
        alert('Maximum number of search results should be positive and less than or equal to 20');
        return;
    }
    if(sType == "school" && schoolType == 0){
        alert('You need to choose a least one type of school!');
        return;
    }
    search(geocoder, map, sType, schoolType, resultNum, maxDuration, maxDistance);
}















