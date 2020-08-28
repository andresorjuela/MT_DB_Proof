var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchById, fetchMany, parseQueryOptions, parseQueryOptionsFromObject, fetchCount, create, updateById, saveAll } = require('@apigrate/mysqlutils/lib/express/db-api');
const { fetchManyAnd, resultToCsv} = require('./db-api-ext');
const {parseSearchTermCriteria} = require('./common');


const ALLOWED_SEARCH_PARAMETERS = [
  'id', 
  'model', 
  'equipment_type_id',
  'type_en',
  'type_zh',
  'brand_id', 
  'brand_en', 
  'brand_zh',
  'is_oem',
  'created', 
  'updated',
  'search_term',
  'search_term_fields'
];

/** Query for equipment */
router.get('/', async function (req, res, next) {

  let q = parseQueryOptions(req, ALLOWED_SEARCH_PARAMETERS, ['+model', '+id'], 1000);
  
  let dbInstructions = {
    dao: req.app.locals.Database.EquipmentView(),
    query_options: q.query_options,
    with_total: true,
  };

  dbInstructions.query = q.query;
  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchMany);


/** 
 * Query for equipment using an advanced search.
 * 
 * Expected body:
 * @example 
 * {
 *   search_term: "X3",
 *   search_term_fields: ["type_en", "model"],
 *   brand_id: 3,
 *   order_by: ["model"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the type_en and model fields will be wildcard searched for "X3", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', async function (req, res, next) {
  let qopts = parseQueryOptionsFromObject(req.body, ALLOWED_SEARCH_PARAMETERS, ['+model', '+id'], 1000);
  
  let dbInstructions = {
    dao: req.app.locals.Database.EquipmentView(),
    query_options: qopts.query_options,
    with_total: true,
    criteria: parseSearchTermCriteria(ALLOWED_SEARCH_PARAMETERS, qopts)
  };

  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchMany);


/**
 * Similar to search endpoint, except all search results are downloaded (up to 100,000 records).
 */
router.post('/search/download', async function (req, res, next) {
  let qopts = parseQueryOptionsFromObject(req.body, ALLOWED_SEARCH_PARAMETERS, ['+id'], 100000);
  
  let dao = req.app.locals.Database.EquipmentView();
  await dao.fetchMetadata();

  //Which columns are output...
  qopts.query_options.columns = [];
  dao.metadata.forEach(m=>{
    qopts.query_options.columns.push(m.column);
  }); 

  let dbInstructions = {
    dao: dao,
    query_options: qopts.query_options,
    with_total: true,
    criteria: parseSearchTermCriteria(ALLOWED_SEARCH_PARAMETERS, qopts),
  };

  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchManyAnd, resultToCsv);


/** Get a single equipment. */
router.get('/:equipment_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentView(),
    id: req.params.equipment_id
  }
  next();

}, fetchById);


/** Create equipment */
router.post('/', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Equipment(),
    toSave: entity
  }
  next();

}, create);


/** Update equipment */
router.put('/:equipment_id', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Equipment(),
    toUpdate: entity
  }
  next();

}, updateById);


// Get all equipment available regions
router.get('/:equipment_id/available_regions', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentAvailableRegionView(),
    query: {equipment_id: req.params.equipment_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);


/** Save all equipment available regions. */
router.post('/:equipment_id/available_regions', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentAvailableRegion(),
    toSave: req.body, //assuming an array of objects
    query: {equipment_id: req.params.equipment_id},
    comparison: function(obj){ return `${obj.available_region_id}`; }
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
