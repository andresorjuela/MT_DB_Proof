var express = require('express');
var router = express.Router();
const debug = require('debug')('medten:routes');

/* Render the products app. */
router.get('/', function(req, res, next) {
  res.render('products', {});
});

module.exports = router;
