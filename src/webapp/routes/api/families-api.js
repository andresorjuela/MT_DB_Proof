var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchMany, parseQueryOptions } = require('../middleware/db-api');


router.get('/', function (req, res, next) {
  let q = parseQueryOptions(req, ['id', 'brand_id', 'technology_id', 'family_connector_code', 'family_code'], ['+family_code', '+id'], 1000);
     
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Family(),
    query: q.query,
    query_options: q.query_options
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
