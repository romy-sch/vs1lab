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
let mapManager; 

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
    mapManager = new MapManager;
   
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

    // 4.2
    // references to required DOM elements
    const tagForm = document.getElementById('tag-form');
    const discoveryForm = document.getElementById('discoveryFilterForm');
    const discoveryResults = document.getElementById('discoveryResults');

    // Event Listener for tag form
    tagForm.addEventListener('submit', async (e) => {
        // prevent default submitting of form
        e.preventDefault();
        
        const formData = new FormData(tagForm);
        // convert to javascript object to easily use stringify for JSON format
        const tagData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/geotags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tagData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // debug info
            const result = await response.json();
            console.log('Neuer GeoTag erstellt:', result);

            // update results shown
            updateDiscoveryResults();
            
            // reset form
            // tagForm.reset();
        } catch (error) {
            console.error('Fehler beim Erstellen des GeoTags:', error);
        }
    });

    // Event Listener for discovery form
    discoveryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(discoveryForm);
        const searchParams = new URLSearchParams();

        // Iterate over entries
        for (let [key, value] of formData.entries()) {
            // Workaround for REST API: rename hiddenLat and hiddenLon
            if (key === 'hiddenLat') {
                searchParams.append('latitude', value);
            } else if (key === 'hiddenLon') {
                searchParams.append('longitude', value);
            } else {
                searchParams.append(key, value);
            }
        }

        try {
            const response = await fetch(`/api/geotags?${searchParams.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const results = await response.json();
            updateDiscoveryResults(results);
        } catch (error) {
            console.error('Fehler bei der Suche:', error);
        }
    });

    // update result list
    async function updateDiscoveryResults(results) {
        if (!results) {
            const latitude = document.getElementById('hidden_latitude').value;
            const longitude = document.getElementById('hidden_longitude').value;
            const response = await fetch(`/api/geotags?latitude=${latitude}&longitude=${longitude}`);
            results = await response.json();
        }

        discoveryResults.innerHTML = '';
        results.forEach(tag => {
            const li = document.createElement('li');
            li.textContent = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`;
            discoveryResults.appendChild(li);
        });

        // Update map
        // const encodedResults = JSON.stringify(results);
        // console.log('Encoded results:', encodedResults);
        // const map = document.getElementById('map'); 
        // map.setAttribute('data-tags', encodedResults);
        const latitude = document.getElementById('hidden_latitude').value;
        const longitude = document.getElementById('hidden_longitude').value;
        if(latitude && longitude) {
            mapManager.updateMarkers(parseFloat(latitude), parseFloat(longitude), results);  
        } 
    }

    // Initial die Ergebnisse laden
    updateDiscoveryResults();
});

