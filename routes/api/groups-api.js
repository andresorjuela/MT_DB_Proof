var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchById, fetchMany, parseQueryOptions, create, updateById, saveAll } = require('@apigrate/mysqlutils/lib/express/db-api');
const { fetchManySqlAnd, resultToAccept, resultToJsonDownload} = require('./db-api-ext');
const {parseAdvancedSearchRequest} = require('./common');

const ALLOWED_SEARCH_PARAMETERS = [
  'id', 
  'group_code',
  'created', 
  'updated', 
  'search_term',
  'search_term_fields'
];

/** Query for group */
router.get('/', async function (req, res, next) {

  let q = parseQueryOptions(req, ALLOWED_SEARCH_PARAMETERS, ['+group_code', '+id'], 1000);
  
  let dbInstructions = {
    dao: req.app.locals.Database.Group(),
    query_options: q.query_options,
    with_total: true,
  };
  
  dbInstructions.query = q.query;
  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchMany);


/** 
 * Query for groups using an advanced search.
 * 
 * Expected body:
 * @example 
 * {
 *   search_term: "028",
 *   search_term_fields: ["group_code"],
 *   order_by: ["group_code"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the group_code field will be wildcard searched for "028", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: null,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.Database.Group(),
    sql: null,
    sql_count: null
  };
  
  next();
  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToAccept);


/** @deprecated */
router.post('/search/download', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: null,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.Database.Group(),
    sql: null,
    sql_count: null
  };
  
  next();

}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToJsonDownload);


/** Get a single group. */
router.get('/:group_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Group(),
    id: req.params.group_id
  }
  next();

}, fetchById);


/** Create group */
router.post('/', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Group(),
    toSave: entity
  }
  next();

}, create);


/** Update group */
router.put('/:group_id', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Group(),
    toUpdate: entity
  }
  next();

}, updateById);


// Get all group equipment
router.get('/:group_id/equipment', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentGroupView(),
    query: {group_id: req.params.group_id},
    //query_options: {limit: 100, orderBy: ["+"]}
  }
  next();
}, fetchMany);

/** Saves group equipment */
router.post('/:group_id/equipment', function (req, res, next) {
  
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentGroup(),
    toSave: req.body, //assuming an array
    query: {group_id: req.params.group_id},
    comparison: function(v){ return v.equipment_id; }
  };
  next();
}, saveAll);


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
