import schoolData from './soton_schools.json'
import houseData from './soton_houses_21.json'
import schoolLatLng from './schoolLatlng.json'
import houseLatLng from './houseLatlng.json'

function houseAddressData(price, date, postcode, type, newBuild, name, street, lat, lng) {
    this.price = price;
    this.date = date;
    this.postcode = postcode;
    this.type = type;
    this.newBuild = newBuild;
    this.name = name;
    this.street = street;
    this.lat = lat;
    this.lng = lng;
    this.distance = 0;
    this.duration = 0;
}

function schoolAddressData(name, type, stage, lowAge, highAge, postcode, website, telephone, rating, lat, lng, street) {
    this.name = name;
    this.type = type;
    this.stage = stage;
    this.lowAge = lowAge;
    this.highAge = highAge;
    this.postcode = postcode;
    this.website = website;
    this.telephone = telephone;
    this.rating = rating;
    this.lat = lat;
    this.lng = lng;
    this.street = street;
    this.distance = 0;
    this.duration = 0;
}

export function getHouseData(num, lowPrice, highPrice) {
    var result = [];
    for(let i = 0; i < 3359; i++){
        if(houseLatLng[i].lat != 0 && houseLatLng[i].lng != 0 && (num == 1 || (num && 2 && houseData[i].Price >= lowPrice && houseData[i].Price <= highPrice))){
            let name = "";
            if(houseData[i].Primary_name){
                name += houseData[i].Primary_name;
            }
            if(houseData[i].Secondary_name){
                name += " " + houseData[i].Secondary_name;
            }
            result.push(new houseAddressData(
                houseData[i].Price, 
                houseData[i].Date, 
                houseData[i].Postcode,
                houseData[i].Type,
                houseData[i].New_build,
                name,
                houseData[i].Street,
                houseLatLng[i].lat,
                houseLatLng[i].lng
            ));
        }
    }
    return result;
}

export function getSchoolData(schoolTypeFlag) {
    var result = [];
    for(let i = 0; i < 157; i++){
        if(
            schoolLatLng[i].lat != 0 && schoolLatLng[i].lng != 0 
            && ((schoolTypeFlag % 2 == 1 && schoolData[i].PhaseOfEducation == "Primary")
            || (Math.floor(schoolTypeFlag / 2) % 2 == 1 && schoolData[i].PhaseOfEducation == "Secondary")
            || ((Math.floor(Math.floor(schoolTypeFlag / 2) / 2) % 2) == 1 && (schoolData[i].PhaseOfEducation != "Primary" && schoolData[i].PhaseOfEducation != "Secondary")))
            ){
            result.push(new schoolAddressData(
                schoolData[i].Name,
                schoolData[i].TypeOfEstablishment,
                schoolData[i].PhaseOfEducation,
                schoolData[i].LowAge,
                schoolData[i].HighAge,
                schoolData[i].Postcode,
                schoolData[i].SchoolWebsite,
                schoolData[i].TelephoneNum,
                schoolData[i].OfstedRating,
                schoolLatLng[i].lat,
                schoolLatLng[i].lng,
                schoolData[i].Street
            ));
        }
        
    }
    return result;
}