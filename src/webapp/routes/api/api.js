var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchMany, parseQueryOptions } = require('../middleware/db-api');

router.get('/brands', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+name_en','+id'], ['name_en','+name_zh','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Brand(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

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

router.get('/filter_option_views', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+filter_id','+filter_option_id'], ['category_id','filter_id','filter_option_id','filter_en','filter_zh','option_en','option_zh'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FilterOptionView(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/filters', function (req, res, next) {
  let  q = parseQueryOptions(req, ['+name_en','+category_id','+id'], ['category_id','name_en','name_zh','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Filter(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/filters/options', function (req, res, next) {
  let  q = parseQueryOptions(req, ['filter_id','+option_en','+id'], ['filter_id','option_en','option_zh','id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FilterOption(),
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
