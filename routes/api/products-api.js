var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchCount, fetchMany, deleteMatching, parseQueryOptions, updateById, create, saveAll } = require('@apigrate/mysqlutils/lib/express/db-api');
let debug = require('debug')('medten:routes');

let CriteriaHelper = require('@apigrate/mysqlutils/helpers/criteria');

let SEARCHABLE_PRODUCT_COLUMNS = [ 
  'product_id', 
  'sku',
  'oem',
  'name_en', 
  'name_zh',
  'oem_brand_id',
  'oem_brand_en',
  'oem_brand_zh',
  'description_en',
  'description_zh',
  'product_type_en',
  'product_type_zh',
  'family_id',
  'family_code',
  'category_id',
  'category_en',
  'category_zh',
  'search_term'
];

/** Query for products. */
router.get('/', async function (req, res, next) {
  let q = parseQueryOptions(req, SEARCHABLE_PRODUCT_COLUMNS, ['+name_en', '+id'], 1000);
  
  let dbInstructions = {
    dao: req.app.locals.Database.ProductView(),
    query_options: q.query_options,
    with_total: true,
  };

  if(q.query.search_term){
    dbInstructions.criteria = parseSearchTermCriteria(q);
  } else {
    dbInstructions.query = q.query;
  }
  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchMany);

/** @deprecated */
router.get('/count', async function (req, res, next) {
  debug(`Counting products for query...`);
  let q = parseQueryOptions(req, SEARCHABLE_PRODUCT_COLUMNS);

  let ProductView = req.app.locals.Database.ProductView();
  if(q.query.search_term){
    let criteria = parseSearchTermCriteria(q);

    let qresult = await ProductView.callDb(`SELECT count(*) as count FROM ${ProductView.table} WHERE ${criteria.whereClause}`, criteria.parms);

    res.status(200).json(qresult[0].count);

  } else {
    res.locals.dbInstructions = {
      dao: req.app.locals.Database.ProductView(),
      query: q.query
    }
    next();
  }
}, fetchCount);

/** Gets an array of all distinct SKUs across all products. Used for validation. A SKU should be globally unique. */
router.get('/skus', async function (req, res, next) {
  debug(`Getting distinct SKUs...`);
  let ProductView = req.app.locals.Database.ProductView();
  let qresult = await ProductView.callDb(`SELECT DISTINCT(sku) as sku FROM ${ProductView.table} WHERE sku <> '' and sku is not null ORDER BY sku ASC`);
  res.status(200).json(qresult.map(r=>{return r.sku;}));
});

/**
 * Provide consistent search term queries.
 * @param {object} q a parsed query options object.
 * @returns a criteria helper object containing a whereClause and parms property
 * that can be used for queries
 */
function parseSearchTermCriteria(q){
  let criteria = new CriteriaHelper();
    criteria.or('sku', '=', q.query.search_term)
    .or('oem', '=', q.query.search_term)
    .or('category_en', '=', q.query.search_term)
    .or('category_zh', '=', q.query.search_term);
  return criteria;
}

router.get('/:product_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductView(),
    id: req.params.product_id
  }
  next();

}, fetchById);


/** Create a product */
router.post('/', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Product(),
    toSave: entity
  }
  next();

}, create);


/** Update a product */
router.put('/:product_id', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Product(),
    toUpdate: entity
  }
  next();

}, updateById);


// Get all product certificates
router.get('/:product_id/certificates', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductCertificate(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Saves product certificates */
router.post('/:product_id/certificates', function (req, res, next) {
  
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductCertificate(),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(v){ return v.certificate_id; }
  };
  next();
}, saveAll);

/** Get all custom attribute values for a product. */
router.get('/:product_id/custom_attributes', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductCustomAttributeView(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product custom attributes. */
router.post('/:product_id/custom_attributes', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductCustomAttribute(),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.custom_attribute_id}|${obj.value_en}|${obj.value_zh}`; }
  };
  next();
}, saveAll);


// Get all product equipment connections
router.get('/:product_id/equipment', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductEquipmentView(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product equipment connections. */
router.post('/:product_id/equipment', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductEquipment(),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return obj.equipment_id; }
  };
  next();
}, saveAll);


// Get all product family connections
router.get('/:product_id/families', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductFamily(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product family connections. */
router.post('/:product_id/families', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductFamily(),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return obj.family_id; }
  };
  next();
}, saveAll);

router.get('/:product_id/filter_options', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductFilterOptionView(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product filter options. */
router.post('/:product_id/filter_options', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductFilterOption(),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return obj.filter_option_id; }
  };
  next();
}, saveAll);

// Get all product family connections
router.get('/:product_id/images', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductImageView(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product images. */
router.post('/:product_id/images', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductImage(),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.image_link}|${obj.image_type_id}`; }
  };
  next();
}, saveAll);


// Get all product oem references
router.get('/:product_id/oem_references', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductOemReferenceView(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product oem references */
router.post('/:product_id/oem_references', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductOemReference(),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.brand_id}|${obj.name}`; }
  };
  next();
}, saveAll);

router.get('/view/:product_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductView(),
    id: req.params.product_id
  }
  next();

}, fetchById);


/** Get all set values for a product. */
router.get('/:product_id/sets', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductSetView(),
    query: {parent_product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product sets values. */
router.post('/:product_id/set', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductSet(),
    toSave: req.body, //assuming an array of objects
    query: {parent_product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.child_product_id}|${obj.quantity}`; }
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
