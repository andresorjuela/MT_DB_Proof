var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchMany, parseQueryOptions } = require('@apigrate/mysqlutils/lib/express/db-api');

router.get('/available_regions', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.AvailableRegion(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/brands', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','name_zh','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Brand(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/categories', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ["+parent_id","+id"], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.CategoryView(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/certificates', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Certificate(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/custom_attributes', function (req, res, next) {
  let  q = parseQueryOptions(req, ['category_id','name_en','name_zh'], ['+category_id','+name_en'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.CustomAttribute(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/equipment_groups', function (req, res, next) {
  let  q = parseQueryOptions(req, ['id','equipment_id','model','group_id','group_code', 'created','updated'], ['+model','+group_code'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentGroupView(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/equipment_types', function (req, res, next) {
  let  q = parseQueryOptions(req, ['id','name_en','name_zh'], ['+name_en','+name_zh'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.EquipmentType(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/filter_option_views', function (req, res, next) {
  let  q = parseQueryOptions(req, ['category_id','filter_id','filter_option_id','filter_en','filter_zh','option_en','option_zh'], ['+filter_id','+filter_option_id'],  1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FilterOptionView(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/filters', function (req, res, next) {
  let  q = parseQueryOptions(req, ['category_id','name_en','name_zh','id'], ['+name_en','+category_id','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Filter(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/filters/options', function (req, res, next) {
  let  q = parseQueryOptions(req, ['filter_id','option_en','option_zh','id'], ['filter_id','+option_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.FilterOption(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/groups', function (req, res, next) {
  let  q = parseQueryOptions(req, ['id','group_code','created','updated'], ['+group_code','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Group(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/image_types', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name','id'], ['+name','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ImageType(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/lifecycles', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Lifecycle(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/marketing_regions', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.MarketingRegion(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/packaging_factors', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name','value','id'], ['+name','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.PackagingFactor(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/product-types', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductType(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/suppliers', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','name_zh','id'], ['+name_en','+id'], 1000);
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
