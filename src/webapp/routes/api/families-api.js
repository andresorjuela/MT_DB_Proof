var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchMany, deleteMatching } = require('../middleware/db-api');


router.get('/', function (req, res, next) {
  let query = req.query;
  let query_options = {
    limit: 10000,
    order_by: ['+family_code', '+id']
  };
  for (key in query) {
    //Valid search fields
    if (['id', 'brand_id', 'technology_id', 'family_connector_code', 'family_code'].indexOf(key) >= 0) continue;

    if (key === 'limit') {
      query_options.limit = query[key];
    }
    if (key === 'order_by') {
      query_options.order_by = query[key].split(',');
    }

    delete query[key];
  }

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Family(),
    query: query,
    query_options: query_options
  }
  next();
}, fetchMany);

router.get('/:family_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Family(),
    id: req.params.family_id
  }
  next();

}, fetchById);



//Default error handling
router.use(function (err, req, res, next) {
  console.error(err);
  let errMessage = err.message;
  if (err.sqlState) {
    errMessage = 'Invalid data or invalid data relationship.';
  }
  res.status(500).json({
    message: "Unexpected error.",
    error: errMessage
  })
})


module.exports = router;
