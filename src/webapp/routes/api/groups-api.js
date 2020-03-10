var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchById, fetchMany, parseQueryOptions, fetchCount, create, updateById, saveAll } = require('../middleware/db-api');
const GROUP_QUERY_FIELDS = [
  'id', 'group_code','created', 'updated'
];

/** Query for group */
router.get('/', function (req, res, next) {

  let q = parseQueryOptions(req, 
    GROUP_QUERY_FIELDS, 
    ['+group_code', '+id'], 1000);
     
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Group(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

/** Count all group matching the query. */
router.get('/count', function (req, res, next) {
  let q = parseQueryOptions(req, 
    GROUP_QUERY_FIELDS, 
    ['+group_code', '+id'], 1000);

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Group(),
    query: q.query
  }
  next();
}, fetchCount);

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
