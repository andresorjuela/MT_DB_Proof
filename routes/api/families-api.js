var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchMany, parseQueryOptions, parseQueryOptionsFromObject, fetchCount, create, updateById } = require('@apigrate/mysqlutils/lib/express/db-api');
const {parseSearchTermCriteria} = require('./common');

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
  'search_term_fields'
];

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
  let qopts = parseQueryOptionsFromObject(req.body, ALLOWED_SEARCH_PARAMETERS, ['+family_code', '+id'], 1000);
  
  let dbInstructions = {
    dao: req.app.locals.Database.FamilyView(),
    query_options: qopts.query_options,
    with_total: true,
    criteria: parseSearchTermCriteria(ALLOWED_SEARCH_PARAMETERS, qopts)
  };

  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchMany);


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
