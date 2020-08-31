const express = require('express');
const router = express.Router({ mergeParams: true });
const _ = require('lodash');
const { deleteById, fetchById, fetchCount, fetchMany, parseQueryOptions, parseQueryOptionsFromObject, updateById, create, saveAll } = require('@apigrate/mysqlutils/lib/express/db-api');
const { CriteriaHelper } = require('@apigrate/mysqlutils');
const { fetchManySqlAnd, resultToCsv, resultToJson} = require('./db-api-ext');
const debug = require('debug')('medten:routes');
const {parseSearchTermCriteria} = require('./common');
const { result } = require('lodash');

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
    table: "t_product_certificate",
    join_column: "product_id",
    where_column: "certificate_id",
  },
  "custom attribute": {
    table: "t_product_custom_attribute",
    join_column: "product_id",
    where_column: "custom_attribute_id",
  },
  "image type": {
    table: "t_product_image",
    join_column: "product_id",
    where_column: "image_type_id",
  },
  "lifecycle": {
    where_column: "lifecycle_id",
  },
  "marketing region": {
    table: "t_product_marketing_region",
    join_column: "product_id",
    where_column: "marketing_region_id",
  },
  "packaging factor": {
    where_column: "packaging_factor_id",
  },
  "supplier": {
    table: "t_product_supplier",
    join_column: "product_id",
    where_column: "supplier_id",
  },
  "oem reference": {
    table: "t_product_oem_reference",
    join_column: "product_id",
    where_column: "name",
  },
  "product type": {
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
  // let qopts = parseQueryOptionsFromObject(req.body, ALLOWED_SEARCH_PARAMETERS, ['+name_en', '+id'], 1000);

  let payload = {};
  Object.assign(payload, req.body);
  let dao = req.app.locals.Database.ProductView();

  let queries = await parseProductSearchRequest(dao, payload);
  
  let dbInstructions = {
    dao: dao,
    sql: queries.sql,
    sql_count: queries.sql_count,
  };

  res.locals.dbInstructions = dbInstructions;
  next();
  
}, fetchManySqlAnd, resultToJson);


/**
 * Similar to search endpoint, except all search results are downloaded (up to 100,000 records).
 */
router.post('/search/download', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  let dao = req.app.locals.Database.ProductView();

  let queries = await parseProductSearchRequest(dao, payload);
  
  let dbInstructions = {
    dao: dao,
    sql: queries.sql,
    sql_count: queries.sql_count,
  };

  res.locals.dbInstructions = dbInstructions;
  
  next();
  
}, fetchManySqlAnd, resultToCsv);

/**
 * Parses a search and search count query for use with complex product searches.
 * @param {object} payload typically the req.body
 */
async function parseProductSearchRequest(dao, payload){
  // parse search term fields
  // parse category search fields
  // parse filter fields
  // parse standard query options (offset, limit, order_by)
  

  let result = {sql:{statement:null, parms:null}, sql_count:{statement:null, parms:null}};

  await dao.fetchMetadata();

  //Which columns are output...
  let columns = [];
  dao.metadata.forEach(m=>{
    if(['product_name_formula', 'product_description_formula'].includes(m.column)){
      return;//exclude the formulas from download
    } else {
      columns.push(`v.${m.column}`);
    }
  }); 


  let qs =  `select ${columns.join(',')} from ${dao.table} v `;
  let count_qs = `select count(*) as count from ${dao.table} v `;
  let join = ``; 
  let optsclause = ``;
  let criteria = new CriteriaHelper();
  
  // parse search term fields.
  if(payload.search_term_fields){
    criteria.andGroup();
    for(let field_name of payload.search_term_fields){
      if(ALLOWED_SEARCH_PARAMETERS.includes(field_name)){
        criteria.or(field_name, 'LIKE', `%${payload.search_term}%`);
      }
      //just ignore anything not searchable.
    }
    criteria.groupEnd();
    
    delete payload.search_term_fields;
    delete payload.search_term;
  }

  // parse category search fields
  if(payload.category_id){
    criteria.andGroup();
    if( _.isArray(payload.category_id) ){
      criteria.and('category_id', 'IN', payload.category_id);
    } else {
      criteria.and('category_id', '=', `${payload.category_id}`);
    }
    criteria.groupEnd();
  }

  // parse search filters
  if(payload.search_filter){
    let filter = SEARCH_FILTERS[payload.search_filter];
    if(filter){
      criteria.andGroup();
      if(filter.table){
        //Need to do a join.
        join = `JOIN ${filter.table} J on J.product_id = v.id`; //CUSTOMIZE THIS
        criteria.and(`J.${filter.where_column}`, '=', payload.search_filter_value);
      } else {
        criteria.and(filter.where_column, '=', payload.search_filter_value);
      }
      criteria.groupEnd();
    }
    delete payload.search_filter;
    delete payload.search_filter_value;
  }

  //Done building the where.
  where = criteria.whereClause;

  // parse options clause
  if(payload.order_by && ALLOWED_SEARCH_PARAMETERS.includes(payload.order_by)){
    optsclause += ` ORDER BY`;
    let tmp = ``;
    payload.order_by.forEach(col=>{
      if(tmp) tmp += `,`;
      if(col.startsWith('+')){
        tmp += ` ${col.substring(1)} ASC`;
      } else if (col.startsWith('-')){
        tmp += ` ${col.substring(1)} DESC`;
      } else {
        tmp += ` ${col} ASC`;
      }
    });
    optsclause += tmp;
  }
  if(payload.limit && _.isFinite(payload.limit)){
    if(payload.limit < 0 || payload.limit > 100000){
      payload.limit = 100000;
    }
    optsclause += ` LIMIT ${payload.limit}`;
  }
  if(payload.offset && _.isFinite(payload.offset)){
    if(payload.offset < 0 || payload.offset > 100000){
      payload.offset = 100000;
    }
    optsclause += ` OFFSET ${payload.offset}`;
  }

  let fullQuery = `${qs} ${join} WHERE ${criteria.whereClause} ${optsclause}`;
  let fullCountQuery = `${count_qs} ${join} WHERE ${criteria.whereClause}`;
  debug(fullQuery);
  debug(fullCountQuery);

  result.sql = {
    statement: fullQuery,
    parms: criteria.parms,
  }
  result.sql_count = {
    statement: fullCountQuery,
    parms: criteria.parms,
  }
  return result;
}





/** Gets an array of all distinct SKUs across all products. Used for validation. A SKU should be globally unique. */
router.get('/skus', async function (req, res, next) {
  debug(`Getting distinct SKUs...`);
  let ProductView = req.app.locals.Database.ProductView();
  let qresult = await ProductView.callDb(`SELECT DISTINCT(sku) as sku FROM ${ProductView.table} WHERE sku <> '' and sku is not null ORDER BY sku ASC`);
  res.status(200).json(qresult.map(r=>{return r.sku;}));
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
router.put('/:product_id', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Product(),
    toUpdate: entity
  }
  next();

}, updateById);


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
    dao: req.app.locals.Database.ProductOemReference(),
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
