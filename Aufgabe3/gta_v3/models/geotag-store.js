// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
const GeoTag = require('./geotag'); 
const GeoTagExamples = require('./geotag-examples');

class InMemoryGeoTagStore{

    // TODO: ... your code here ...
    
    #geotagList=[];
   
    addGeoTag(name, latitude, longitude, hashtag) {
        const newGeoTag = new GeoTag(name, latitude, longitude, hashtag);
        this.#geotagList.push(newGeoTag);
    }

   removeGeoTag(name){
        for(let i=0;i<geotagList.length;i++){
            if(name===geotagList[i].name) {
                geotagList.splice(i,1);
                break;
            }
        };
    }

    getNearbyGeoTags(latitude,longitude){
        const radius=5;

        function haversineDistanceFormula(lat1, lon1, lat2, lon2){
            
            // distance between latitudes and longitudes
            let distanceLat = (lat2 - lat1) * Math.PI / 180.0;
            let distanceLon = (lon2 - lon1) * Math.PI / 180.0;
           
            // convert to radians
            lat1 = (lat1) * Math.PI / 180.0;
            lat2 = (lat2) * Math.PI / 180.0;
         
            //formula
            let a = Math.pow(Math.sin(distanceLat / 2), 2) + 
                   Math.pow(Math.sin( distanceLon / 2), 2) * 
                   Math.cos(lat1) * 
                   Math.cos(lat2);

            let earthRad = 6371; //earth radius in km
            let c = 2 * Math.asin(Math.sqrt(a));
            return earthRad * c;
        }

        
         return this.#geotagList.filter(tag=>//returns filtered array for set radius
            haversineDistanceFormula(latitude,longitude,tag.latitude,tag.longitude)<=radius
            );
        
    }
    
    searchNearbyGeoTags(latitude,longitude,keyword){
        
        const nearbyTags = this.getNearbyGeoTags(latitude,longitude);
        
        const lowerKeyword = keyword.toLowerCase();
        
        const matching= nearbyTags.filter(tag =>
            tag.name.toLowerCase().includes(lowerKeyword) || tag.hashtag.toLowerCase().includes(lowerKeyword)
            );
        
            return matching;
    }
    
    getStore(){
        return this.#geotagList;
    }

    populate(){
        const exampleList = GeoTagExamples.tagList;

        
        exampleList.forEach(tag => {
            const [name, latitude, longitude, hashtag] = tag;
            
            this.addGeoTag(name, latitude, longitude, hashtag);
        });
    console.log('GeoTags populated:', this.#geotagList); 

    }
}

module.exports = InMemoryGeoTagStore
