var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchMany, parseQueryOptions } = require('../middleware/db-api');


router.get('/categories', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+name_en','+id'], ['name_en','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Category(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/certificates', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+name_en','+id'], ['name_en','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Certificate(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/lifecycles', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+name_en','+id'], ['name_en','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Lifecycle(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/product-types', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+name_en','+id'], ['name_en','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductType(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/suppliers', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+name_en','+id'], ['name_en','name_zh','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Supplier(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

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
