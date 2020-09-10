var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchById, fetchMany, parseQueryOptions, parseQueryOptionsFromObject, create, updateById } = require('@apigrate/mysqlutils/lib/express/db-api');
const { fetchManyAnd, fetchManySqlAnd, resultToCsv, resultToAccept, resultToJsonDownload} = require('./db-api-ext');
const {parseAdvancedSearchRequest} = require('./common');

const ALLOWED_SEARCH_PARAMETERS = [
  'id',
  'family_connector_code',
  'family_code',
  'group_id',
  'group_code',
  'image_link_connector_distal',
  'name_en',
  'created',
  'updated',
  'search_term',
  'search_term_fields',
];

const SEARCH_FILTERS = {
  "oem brand": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "oem_brand_id",
  },
  "product type": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "product_type_id",
  },
  /* These are special cases that are actually handled thru search term functionality
  "oem brand en": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "oem_brand_en",
  },
  "category en": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "category_en",
  },
  */
};

/** Query for families */
router.get('/', async function (req, res, next) {

  let q = parseQueryOptions(req, ALLOWED_SEARCH_PARAMETERS, ['+family_code', '+id'], 1000);

  let dbInstructions = {
    dao: req.app.locals.Database.FamilyView(),
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
 *   search_term: "140B",
 *   search_term_fields: ["family_code", "family_connector_code"],
 *   order_by: ["family_code"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the family_code and family_connector_code fields will be wildcard searched for "140B", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: SEARCH_FILTERS,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.Database.FamilyView(),
    sql: null,
    sql_count: null
  };
  
  next();
  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToAccept);


router.post('/search/download', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: SEARCH_FILTERS,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.Database.FamilyView(),
    sql: null,
    sql_count: null
  };
  
  next();
  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToJsonDownload);


/** Get a single family. */
router.get('/:family_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FamilyView(),
    id: req.params.family_id
  }
  next();

}, fetchById);


/** Create a family */
router.post('/', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Family(),
    toSave: entity
  }
  next();

}, create);


/** Update a family */
router.put('/:family_id', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Family(),
    toUpdate: entity
  }
  next();

}, updateById);


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
