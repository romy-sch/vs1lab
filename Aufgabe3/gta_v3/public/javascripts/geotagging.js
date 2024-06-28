// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...
function updateLocation(){
    if(!document.getElementById("latitude_input").value){
        
        LocationHelper.findLocation(function(location) {
   
        let longitude = location.longitude;
        let latitude = location.latitude; 
    
        document.getElementById("latitude_input").value = latitude;
        document.getElementById("longitude_input").value = longitude;

        document.getElementById("hidden_latitude").value = latitude;
        document.getElementById("hidden_longitude").value = longitude;
        mapUpdate(latitude, longitude);

        });
    
    }else{
        let exLatitude = document.getElementById("latitude_input").value;
        let exLongitude =  document.getElementById("longitude_input").value;
        mapUpdate(exLatitude, exLongitude);
    }
}

function mapUpdate(latitude, longitude){

    let mapManager = new MapManager;
   
    document.getElementById("mapView").remove();
    document.getElementById("resultMapText").remove();

    mapManager.initMap(latitude,longitude);
   
    let tagsAround= document.getElementById("map").getAttribute("data-tags");

    if(tagsAround==""){

        mapManager.updateMarkers(latitude,longitude);
    }else{
        
        tagsAround= JSON.parse(tagsAround);
        mapManager.updateMarkers(latitude,longitude,tagsAround);
        }
}  
   
 


// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    
    updateLocation();
    console.log("Location updated");
});