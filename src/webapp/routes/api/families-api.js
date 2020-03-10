var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchMany, parseQueryOptions, fetchCount } = require('../middleware/db-api');
const FAMILY_QUERY_FIELDS = [
  'id', 'family_connector_code', 'family_code', 'image_link_connector_distal', 'created', 'updated',
  'brand_id', 'brand_en', 'brand_zh',
  'group_id', 'group_code',
  'technology_id', 'technology'
];

/** Query for families */
router.get('/', function (req, res, next) {

  let q = parseQueryOptions(req, 
    FAMILY_QUERY_FIELDS, 
    ['+family_code', '+id'], 1000);
     
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FamilyView(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

/** Count all families matching the query. */
router.get('/count', function (req, res, next) {
  let q = parseQueryOptions(req, 
    FAMILY_QUERY_FIELDS, 
    ['+family_code', '+id'], 1000);

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FamilyView(),
    query: q.query
  }
  next();
}, fetchCount);

/** Get a single family. */
router.get('/:family_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FamilyView(),
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
