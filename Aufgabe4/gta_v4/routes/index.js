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

geoTagStoreObject.populate(); //populate with given examples



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

// 4.1 GET: return list of all geotags matching query
router.get('/api/geotags', (req, res) => {
  const { latitude, longitude, search } = req.query;
  let results;

  if (latitude && longitude) {
    if (search) {
      results = geoTagStoreObject.searchNearbyGeoTags(latitude, longitude, search); 
    } else {
      results = geoTagStoreObject.getNearbyGeoTags(latitude, longitude);
    }
  } else if (search) {
    results = geoTagStoreObject.searchGeoTags(search);
  }
  else {
    results = geoTagStoreObject.getStore();
  }
  res.json(results);
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

// 4.2 POST: create a new geotag and return it
router.post('/api/geotags', (req, res) => {
  const { name, latitude, longitude, hashtag } = req.body;
  const id = geoTagStoreObject.getNextUniqueId(); 
  geoTagStoreObject.addGeoTag(name, latitude, longitude, hashtag, id);
  // find geotag to return as json object
  const newTag = geoTagStoreObject.getStore().find(tag => 
    tag.id === id
  );
  res.status(201)
     .location(`/api/geotags/${encodeURIComponent(newTag.id)}`)
     .json(newTag);
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

// 4.1 GET: search geotag by id and return it
router.get('/api/geotags/:id', (req, res) => {
  const id = parseInt(req.params.id); 
  const tag = geoTagStoreObject.getStore().find(tag => tag.id === id);
  if (tag) {
    res.json(tag);
  } else {
    res.status(404).json({ error: 'GeoTag mit Id nicht gefunden' });
  }
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

// 4.1 PUT: looks for geotag with id, deletes it, adds geotag with same id and return it
router.put('/api/geotags/:id', (req, res) => {
  const { name, latitude, longitude, hashtag } = req.body;
  const id = parseInt(req.params.id); 
  const oldTag = geoTagStoreObject.getStore().find(tag => tag.id === id);
  if (oldTag) {
    geoTagStoreObject.removeGeoTagById(id);
    geoTagStoreObject.addGeoTag(name, latitude, longitude, hashtag, id);
    const updatedTag = geoTagStoreObject.getStore().find(tag => tag.id === id);
    res.json(updatedTag);
  } else {
    res.status(404).json({ error: 'GeoTag mit Id nicht gefunden' });
  }
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

// 4.1 DELETE: delete geotag by id and returns it
router.delete('/api/geotags/:id', (req, res) => {
  const id = parseInt(req.params.id); 
  const deletedTag = geoTagStoreObject.getStore().find(tag => tag.id === id);
  if (deletedTag) {
    geoTagStoreObject.removeGeoTagById(id);
    res.json(deletedTag);
  } else {
    res.status(404).json({ error: 'GeoTag mit Id nicht gefunden' });
  }
});

module.exports = router;
