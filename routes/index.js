var express = require('express');
var router = express.Router();

const port = process.env.PORT || 3000;
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
