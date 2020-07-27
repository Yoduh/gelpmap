const express = require('express'),
      router  = express.Router(),
      yelp    = require('yelp-fusion');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const client = yelp.client(process.env.REACT_APP_YELP_API_KEY);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/yelp/:id', function(req, res) {
  client.business(req.params.id).then(response => {
    res.send(response.jsonBody);
  }).catch(e => {
    console.log(e);
  });
});

router.post('/yelp', function(req, res) {
  const yelpReq = req.body.yelpRequest;
  client.search({
    latitude: yelpReq.latitude,
    longitude: yelpReq.longitude,
    radius: yelpReq.radius,
    term: yelpReq.term
  }).then(response => {
    res.send(response.jsonBody);
  }).catch(e => {
    console.log(e);
  });
});

module.exports = router;
