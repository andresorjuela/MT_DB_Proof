var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchById, fetchMany, parseQueryOptions, fetchCount, create, updateById } = require('../middleware/db-api');
const EQUIPMENT_QUERY_FIELDS = [
  'id', 'model','created', 'updated',
  'brand_id', 'brand_en', 'brand_zh'
];

/** Query for equipment */
router.get('/', function (req, res, next) {

  let q = parseQueryOptions(req, 
    EQUIPMENT_QUERY_FIELDS, 
    ['+equipment_code', '+id'], 1000);
     
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentView(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

/** Count all equipment matching the query. */
router.get('/count', function (req, res, next) {
  let q = parseQueryOptions(req, 
    EQUIPMENT_QUERY_FIELDS, 
    ['+equipment_code', '+id'], 1000);

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentView(),
    query: q.query
  }
  next();
}, fetchCount);

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
