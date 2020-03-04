var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchMany, deleteMatching, parseQueryOptions, updateById, create, saveAll } = require('../middleware/db-api');

/* GET checks if service is online */
router.get('/', function (req, res, next) {
  let q = parseQueryOptions(req, ['product_id', 'name_en', 'name_zh'], ['+name_en', '+id'], 1000);

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Product(),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/:product_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Product(),
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

router.get('/:product_id/custom_attributes', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductCustomAttribute(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

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
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/:product_id/filter_options', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductFilterOptionView(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);


// Get all product family connections
router.get('/:product_id/images', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductImage(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

// Get all product oem references
router.get('/:product_id/oem_references', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductOemReference(),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/view/:product_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.ProductView(),
    id: req.params.product_id
  }
  next();

}, fetchById);


router.post('/:product_id/properties/', async function (req, res, next) {
  if (!req.body.name || ("" !== req.body.value && !req.body.value)) {
    //If a name/value is not provided, it is an invalid request.
    res.status(400).end();
    return;
  }
  let dao = req.app.locals.Database.AccountProperty();
  let toSave = {
    product_id: req.params.product_id * 1,
    name: req.body.name,
    value: req.body.value
  };

  if (_.isEmpty(toSave.name)) {
    res.status(400).end();
    return;
  }

  try {
    let exists = await dao.one({ product_id: toSave.product_id, name: toSave.name });
    if (_.isEmpty(exists)) {
      toSave = await dao.create(toSave);
      res.status(201).json(toSave);
    } else {
      toSave = await dao.update(toSave);
      res.status(200).json(toSave);
    }
  } catch (ex) {
    next(ex);
  }

});


router.get('/:product_id/properties/:name', async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.AccountProperty(),
    query: {
      product_id: req.params.product_id,
      name: req.params.name
    }
  }
  next();

}, fetchOne);


router.delete('/:product_id/properties/:name', async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.AccountProperty(),
    toDelete: {
      product_id: req.params.product_id,
      name: req.params.name
    }
  }
  next();

}, deleteMatching);


router.get('/:product_id/properties', async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.AccountProperty(),
    query: {
      product_id: req.params.product_id
    }
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
