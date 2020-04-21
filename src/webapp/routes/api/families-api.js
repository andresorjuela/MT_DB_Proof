var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchMany, parseQueryOptions, fetchCount, create, updateById } = require('@apigrate/mysqlutils/lib/express/db-api');
let CriteriaHelper = require('@apigrate/mysqlutils/helpers/criteria');

const FAMILY_QUERY_FIELDS = [
  'id', 'family_connector_code', 'family_code', 'image_link_connector_distal', 'created', 'updated',
  'brand_id', 'brand_en', 'brand_zh',
  'group_id', 'group_code',
  'technology_id', 'technology_en', 'search_term'
];

/** Query for families */
router.get('/', async function (req, res, next) {

  let q = parseQueryOptions(req, FAMILY_QUERY_FIELDS, ['+family_code', '+id'], 1000);
  
  let FamilyView = req.app.locals.Database.FamilyView();
  if(q.query.search_term){
    let criteria = parseSearchTermCriteria(q);

    // let qresult = await FamilyView.selectWhere(criteria.whereClause, criteria.parms);
    
    // let result = {};
    // result[FamilyView.plural] = qresult;
    // res.status(200).json(result);
    res.locals.dbInstructions = {
      dao: FamilyView,
      criteria: criteria,
      query_options: q.query_options,
      with_total: true,
    }
    next();

  } else {
    res.locals.dbInstructions = {
      dao: FamilyView,
      query: q.query,
      query_options: q.query_options,
      with_total: true,
    }
    next();
  }
  
}, fetchMany);

/** Count all families matching the query. */
router.get('/count', async function (req, res, next) {
  let q = parseQueryOptions(req, FAMILY_QUERY_FIELDS);

  let FamilyView = req.app.locals.Database.FamilyView();
  if(q.query.search_term){
    let criteria = parseSearchTermCriteria(q);

    let qresult = await FamilyView.callDb(`SELECT count(*) as count FROM ${FamilyView.table} WHERE ${criteria.whereClause}`, criteria.parms);

    res.status(200).json(qresult[0].count);
  } else {
    res.locals.dbInstructions = {
      dao: FamilyView,
      query: q.query
    }
    next();
  }
  
}, fetchCount);

/**
 * Provide consistent search term queries.
 * @param {object} q a parsed query options object.
 * @returns a criteria helper object containing a whereClause and parms property
 * that can be used for queries
 */
function parseSearchTermCriteria(q){
  let criteria = new CriteriaHelper();
    criteria.or('family_code', 'LIKE', `%${q.query.search_term}%`)
    .or('family_connector_code', 'LIKE', `%${q.query.search_term}%`)
    .or('technology_en', 'LIKE', `%${q.query.search_term}%`)
    .or('technology_zh', 'LIKE', `%${q.query.search_term}%`)
    .or('brand_en', 'LIKE', `%${q.query.search_term}%`)
    .or('brand_zh', 'LIKE', `%${q.query.search_term}%`);
  return criteria;
}


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
