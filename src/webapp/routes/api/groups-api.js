var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchById, fetchMany, parseQueryOptions, fetchCount, create, updateById, saveAll } = require('../middleware/db-api');
let CriteriaHelper = require('@apigrate/mysqlutils/helpers/criteria');

const GROUP_QUERY_FIELDS = [
  'id', 'group_code','created', 'updated', 'search_term'
];

/** Query for group */
router.get('/', async function (req, res, next) {

  let q = parseQueryOptions(req, 
    GROUP_QUERY_FIELDS, 
    ['+group_code', '+id'], 1000);
  
  let Group = req.app.locals.Database.Group();
  if(q.query.search_term){
    let criteria = parseSearchTermCriteria(q);

    let qresult = await Group.selectWhere(criteria.whereClause, criteria.parms);
    
    let result = {};
    result[Group.plural] = qresult;
    res.status(200).json(result);

  } else {
    res.locals.dbInstructions = {
      dao: Group,
      query: q.query,
      query_options: q.query_options
    }
    next();
  }
  
}, fetchMany);

/** Count all group matching the query. */
router.get('/count', async function (req, res, next) {
  let q = parseQueryOptions(req, 
    GROUP_QUERY_FIELDS, 
    ['+group_code', '+id'], 1000);
  
  let Group = req.app.locals.Database.Group();
  if(q.query.search_term){
    let criteria = parseSearchTermCriteria(q);

    let qresult = await Group.callDb(`SELECT count(*) as count FROM ${Group.table} WHERE ${criteria.whereClause}`, criteria.parms);

    res.status(200).json(qresult[0].count);
  } else {
    res.locals.dbInstructions = {
      dao: Group,
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
    criteria.or('group_code', 'LIKE', `%${q.query.search_term}%`);
  return criteria;
}

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
