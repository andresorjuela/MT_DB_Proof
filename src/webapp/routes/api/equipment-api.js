var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchById, fetchMany, parseQueryOptions, fetchCount, create, updateById } = require('@apigrate/mysqlutils/lib/express/db-api');
let CriteriaHelper = require('@apigrate/mysqlutils/helpers/criteria');

const EQUIPMENT_QUERY_FIELDS = [
  'id', 'model','type_en','type_zh','created', 'updated',
  'brand_id', 'brand_en', 'brand_zh', 'search_term'
];

/** Query for equipment */
router.get('/', async function (req, res, next) {

  let q = parseQueryOptions(req, EQUIPMENT_QUERY_FIELDS, ['+model', '+id'], 1000);

  let EquipmentView = req.app.locals.Database.EquipmentView();
  if(q.query.search_term){
    let criteria = parseSearchTermCriteria(q);

    let qresult = await EquipmentView.selectWhere(criteria.whereClause, criteria.parms);
    
    let result = {};
    result[EquipmentView.plural] = qresult;
    res.status(200).json(result);

  } else {
    res.locals.dbInstructions = {
      dao: EquipmentView,
      query: q.query,
      query_options: q.query_options
    }
    next();
  }

}, fetchMany);

/** Count all equipment matching the query. */
router.get('/count', async function (req, res, next) {
  let q = parseQueryOptions(req,  EQUIPMENT_QUERY_FIELDS);

  let EquipmentView = req.app.locals.Database.EquipmentView();
  if(q.query.search_term){
    let criteria = parseSearchTermCriteria(q);

    let qresult = await EquipmentView.callDb(`SELECT count(*) as count FROM ${EquipmentView.table} WHERE ${criteria.whereClause}`, criteria.parms);

    res.status(200).json(qresult[0].count);
  } else {
    res.locals.dbInstructions = {
      dao: EquipmentView,
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
    criteria.or('model', 'LIKE', `%${q.query.search_term}%`)
    .or('type_en', 'LIKE', `%${q.query.search_term}%`)
    .or('type_zh', 'LIKE', `%${q.query.search_term}%`)
    .or('brand_en', 'LIKE', `%${q.query.search_term}%`)
    .or('brand_zh', 'LIKE', `%${q.query.search_term}%`);
  return criteria;
}

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
