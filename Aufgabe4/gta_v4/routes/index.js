// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const InMemoryGeoTagStore = require('../models/geotag-store');

// App routes (A3)
const GeoTagExamples = require('../models/geotag-examples');
console.log("Instantiating GeoTagStore...");
let geoTagStoreObject = new InMemoryGeoTagStore();
let idCounter= 0;
idCounter = geoTagStoreObject.populate(idCounter); //populate with given examples + returns int idCounter



//POST
router.post('/tagging',function(req, res){
 
  geoTagStoreObject.addGeoTag(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);
  
  let nearbyGeoTags = geoTagStoreObject.getNearbyGeoTags(req.body.latitude, req.body.longitude);
  
  res.render("index", { 
      taglist: nearbyGeoTags,
      latvalue: req.body.latitude,
      lonvalue: req.body.longitude, 
      mapGeoTagList: JSON.stringify(nearbyGeoTags),
      search:""
    });   
})


router.post('/discovery', function(req,res){

  let result= geoTagStoreObject.searchNearbyGeoTags(req.body.hiddenLat,req.body.hiddenLon,req.body.search);
  
  res.render("index", { 
    search:req.body.search,
    taglist: result,
    latvalue: req.body.hiddenLat,
    lonvalue: req.body.hiddenLon,
    mapGeoTagList: JSON.stringify(result)
  }); 

})
/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */


//GET
router.get('/', (req, res) => {
  res.render('index', {  taglist: [],  latvalue: "", lonvalue:"", mapGeoTagList: "" , search:""})
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...
router.get('/api/geotags', (req, res) => {

  let longitude= req.query.longitude;
  let latitude= req.query.latitude;
  let searchterm= req.query.search;
  let result;

  // Logging input parameters
  console.log(`Query Parameters: longitude=${longitude}, latitude=${latitude}, searchterm=${searchterm}`);

  // Convert longitude and latitude to numbers if they are defined
  if (longitude !== undefined) longitude = parseFloat(longitude);
  if (latitude !== undefined) latitude = parseFloat(latitude);

  // set to null if undefined or empty
  if (longitude === undefined || isNaN(longitude)) longitude = null;
  if (latitude === undefined || isNaN(latitude)) latitude = null;
  if (searchterm === undefined || searchterm.trim() === '') searchterm = null;
  
  
  
  //no searchterm or location
  if( searchterm === null && (longitude === null && latitude === null)){
    result= geoTagStoreObject.getStore();

  }else if(searchterm !=null && (longitude === null && latitude === null)){ 
    // with searchterm
    result= geoTagStoreObject.searchGeoTags(searchterm);
  
  }else if((searchterm === null && (longitude != null && latitude != null))){
    //only location
    result = geoTagStoreObject.getNearbyGeoTags(latitude, longitude);
 

  }else{
    // loaction + searchterm
    result = geoTagStoreObject.searchNearbyGeoTags(latitude, longitude, searchterm);
  }
  return res.json(result);
  
  
  
  

});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.post('/api/geotags', (req, res) => {

  
  geoTagStoreObject.addGeoTag(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag, idCounter );
  
  let tag = geoTagStoreObject.searchById(String(idCounter));
  idCounter++;
   res.header("Location", `http://localhost:3000/api/geotags/${idCounter}`);
 
    return res.send(JSON.stringify(tag));
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.get('/api/geotags/:id', (req, res) => {

  let id= req.params.id;
  let searchedTag = geoTagStoreObject.searchById(id);
  
  return res.send(JSON.stringify(searchedTag));
});

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
router.put('/api/geotags/:id', (req, res) => {

  let id= req.params.id;
  geoTagStoreObject.removeGeoTagById(id);

  let newTag= geoTagStoreObject.addGeoTag(req.body.name,req.body.latitude,req.body.longitude,req.body.hashtag,id);
  
  return res.send(JSON.stringify(geoTagStoreObject.getStore()));
 
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...

router.delete('/api/geotags/:id', (req, res) => {
  let id = req.params.id;

  console.log(`Searching for geotag with id: ${id}`);
  
  let deletedTag = geoTagStoreObject.searchById(id);

  console.log(`Found geotag: ${JSON.stringify(deletedTag)}`);

  if (!deletedTag) {
      return res.status(404).json({ error: 'Geotag not found' });
  }

  geoTagStoreObject.removeGeoTagById(id);

  return res.json(deletedTag);
});
module.exports = router;


