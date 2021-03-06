const express = require('express');
const router = express.Router({ mergeParams: true });
const _ = require('lodash');
const { deleteById, fetchById, fetchCount, fetchMany, parseQueryOptions, parseQueryOptionsFromObject, updateById, create, saveAll } = require('@apigrate/mysqlutils/lib/express/db-api');
const { CriteriaHelper } = require('@apigrate/mysqlutils');
const { fetchManySqlAnd, resultToCsv, resultToJsonDownload, resultToAccept} = require('./db-api-ext');
const debug = require('debug')('medten:routes');
const {parseAdvancedSearchRequest} = require('./common');

const ALLOWED_SEARCH_PARAMETERS = [ 
  'id', 
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
  'family_name_en',
  'category_id',
  'category_en',
  'category_zh',
  'certificate_id',
  'search_term',
  'search_term_fields',
  'created',
  'updated'
];

const SEARCH_FILTERS = {
  "brand": {
    where_column: "oem_brand_id",
  },
  "certificate": {
    join_table: "t_product_certificate",
    join_column: "product_id",
    where_column: "certificate_id",
  },
  "custom_attribute": {
    join_table: "t_product_custom_attribute",
    join_column: "product_id",
    where_column: "custom_attribute_id",
  },
  "image_type": {
    join_table: "t_product_image",
    join_column: "product_id",
    where_column: "image_type_id",
  },
  "lifecycle": {
    where_column: "lifecycle_id",
  },
  "marketing_region": {
    join_table: "t_product_marketing_region",
    join_column: "product_id",
    where_column: "marketing_region_id",
  },
  "packaging_factor": {
    where_column: "packaging_factor_id",
  },
  "supplier": {
    join_table: "t_product_supplier",
    join_column: "product_id",
    where_column: "supplier_id",
  },
  "oem_reference": {
    join_table: "t_product_oem_reference",
    join_column: "product_id",
    where_column: "brand_id",
  },
  "product_type": {
    where_column: "product_type_id",
  },
};

/** Query for products using a simple parametric search. Array values not supported. */
router.get('/', async function (req, res, next) {
  let q = parseQueryOptions(req, ALLOWED_SEARCH_PARAMETERS, ['+name_en', '+id'], 1000);
  
  let dbInstructions = {
    dao: req.app.locals.Database.ProductView(),
    query_options: q.query_options,
    with_total: true,
  };

  dbInstructions.query = q.query;
  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchMany);

/** 
 * Query for products using an advanced search.
 * 
 * Expected body:
 * @example 
 * {
 *   search_term: "SA-024",
 *   search_term_fields: ["oem", "model"],
 *   category_id: [5, 7],
 *   oem_brand_id: 3,
 *   order_by: ["sku"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the oem and model fields will be wildcard searched for "SA-024", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: SEARCH_FILTERS,
    exclude_columns_on_output: ['product_name_formula', 'product_description_formula'],
    search_payload: payload,
    dao: req.app.locals.Database.ProductView(),
    sql: null,
    sql_count: null
  };
  
  next();
  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToAccept);


router.get('/search/download', async function (req, res, next) {
  if(!req.query.token){
    //TODO: handle in authorizer.
    res.status(403).end();
  }
  if(!req.query.payload){
    res.status(400).json({message: "Unable to download.", error: "Invalid parameters."});
  }
  try{
    let payload = {};
    Object.assign(payload, JSON.parse(req.query.payload));
    
    res.locals.dbInstructions = {
      searchable_columns: ALLOWED_SEARCH_PARAMETERS,
      filter_definitions: SEARCH_FILTERS,
      exclude_columns_on_output: ['product_name_formula', 'product_description_formula'],
      search_payload: payload,
      dao: req.app.locals.Database.ProductView(),
      sql: null,
      sql_count: null
    };
   
    next();
  }catch(ex){
    console.error(ex);
    res.status(400).json({message: "Download failed.", error: ex.message});
  }

  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToCsv);

/** @deprecated */
router.post('/search/download', async function (req, res, next) {
 
  try{
    let payload = {};
    Object.assign(payload, req.body);
    
    res.locals.dbInstructions = {
      searchable_columns: ALLOWED_SEARCH_PARAMETERS,
      filter_definitions: SEARCH_FILTERS,
      exclude_columns_on_output: ['product_name_formula', 'product_description_formula'],
      search_payload: payload,
      dao: req.app.locals.Database.ProductView(),
      sql: null,
      sql_count: null
    };
   
    next();
  }catch(ex){
    console.error(ex);
    res.status(400).json({message: "Download failed.", error: ex.message});
  }

  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToJsonDownload);


/** Gets an array of all distinct SKUs across all products. Used for validation. A SKU should be globally unique. */
router.get('/skus', async function (req, res, next) {
  debug(`Getting distinct SKUs...`);
  let ProductView = req.app.locals.Database.ProductView();
  let qresult = await ProductView.callDb(`SELECT DISTINCT(sku) as sku FROM ${ProductView.table} WHERE sku <> '' and sku is not null ORDER BY sku ASC`);
  res.status(200).json(qresult.map(r=>{return r.sku;}));
});

/** Gets an array of all distinct OEMs across all products. Used for validation. A SKU should be globally unique. */
router.get('/oems', async function (req, res, next) {
  debug(`Getting distinct SKUs...`);
  let Product = req.app.locals.Database.Product();
  let qresult = await Product.callDb(`SELECT id, oem FROM ${Product.table} WHERE oem <> '' and oem is not null GROUP BY id, oem ORDER BY oem ASC`);
  res.status(200).json({total: qresult.length, product_oems: qresult});
});



/** Gets a product by id. (The extended view of the product is returned.) */
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
router.put('/:product_id', async function (req, res, next) {

  let entity = req.body;
  let productDao = req.app.locals.Database.Product();
  
  let existing = await productDao.get(entity.id);

  //If new category is or is underneath one of the major categories, err.
  if(entity.category_id && entity.category_id != existing.category_id){
    debug(`A product category change has been detected...`);
    let categoryDao = req.app.locals.Database.Category();

    let sourceCategory = await topCategoryFor(categoryDao, existing.category_id);
    let targetCategory = await topCategoryFor(categoryDao, entity.category_id);
    
    if(sourceCategory.id !== targetCategory.id){
      res.status(400).json({message: "Unable to save product.", error: "Changing categories to another top level category hierarchy is not allowed."});
      return;
    }

    //Delete category-dependent data.
    //Filter Options
    debug(`...deleting old filter options.`)
    await req.app.locals.Database.ProductFilterOption().deleteMatching({product_id: existing.product_id});
    //Custom attributes
    debug(`...deleting old custom attributes.`)
    await req.app.locals.Database.ProductCustomAttribute().deleteMatching({product_id: existing.product_id});

  }

  res.locals.dbInstructions = {
    dao: productDao,
    toUpdate: entity
  }
  next();

}, updateById);

/**
 * Returns the top-level category for a given subcategory id.
 * @param {object} categoryDao @apigrate/mysql category dao
 * @param {integer} categoryId category id
 * @return the category entity
 * @throws error if category ids refer to nonexistent categories in the database.
 */
async function topCategoryFor(categoryDao, categoryId){
  let current = await categoryDao.get(categoryId);
  if(!current) throw new Error(`No category for id=${categoryId}`);
  if(current.parent_id === 0){
    return current;
  }

  let maxDepth = 7;
  let count = 1;
  let category = current;
  
  do{
    category = await categoryDao.get(category.parent_id);
    if(!category) throw new Error(`No category for id=${categoryId}`);
    if(category.parent_id === 0){
      return category;
    }
    count++;
  }while(count <= maxDepth)

  debug(`Max depth reached, returning highest ancestor found.`);
  return category;
}


/** Delete a product (database cascades related entities) */
router.delete('/:product_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Product(),
    id: req.params.product_id
  }
  next();

}, deleteById);


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
    comparison: function(obj){ return `${obj.filter_option_id}|${obj.product_id}|${obj.priority_order}`; }
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
    comparison: function(obj){ return `${obj.image_link}|${obj.image_type_id}|${obj.priority_order}`; }
  };
  next();
}, saveAll);


// Get all product marketing regions
router.get('/:product_id/marketing_regions', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductMarketingRegionView(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

/** Save all product marketing regions. */
router.post('/:product_id/marketing_regions', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductMarketingRegion(),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.marketing_region_id}`; }
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
router.post('/:product_id/sets', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductSet(),
    toSave: req.body, //assuming an array of objects
    query: {parent_product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.child_product_id}|${obj.quantity}`; }
  };
  next();
}, saveAll);


/** Get product supplier values. */
router.get('/:product_id/suppliers', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductSupplier(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);


/** Save all product supplier values. */
router.post('/:product_id/suppliers', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductSupplier(),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.supplier_id}|${obj.supplier_price}`; }
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
