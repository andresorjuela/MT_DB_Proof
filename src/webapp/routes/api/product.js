var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchOne, fetchById, fetchMany, deleteMatching } = require('../middleware/db-api');

/* GET checks if service is online */
router.get('/', function (req, res, next) {
  let query = req.query;
  let query_options = {
    limit: 10000,
    order_by: ['+en_title', '+id']
  };
  for (key in query) {
    //Valid search fields
    if (['product_id', 'name', 'en_title', 'ch_title'].indexOf(key) >= 0) continue;

    if (key === 'limit') {
      query_options.limit = query[key];
    }
    if (key === 'order_by') {
      query_options.order_by = query[key].split(',');
    }

    delete query[key];
  }

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Product(),
    query: query,
    query_options: query_options
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


router.get('/:product_id/instances', async function (req, res, next) {
  let query = req.query;
  let query_options = {
    limit: 10000,
    order_by: ['+app_id', '+id']
  };
  for (key in query) {
    //Valid search fields
    if (['app_id', 'status', 'subscription_status', 'created', 'updated'].indexOf(key) >= 0) continue;

    if (key === 'limit') {
      query_options.limit = query[key];
    }
    if (key === 'order_by') {
      query_options.order_by = query[key].split(',');
    }

    delete query[key];
  }
  query.product_id = req.params.product_id;//always

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Inst(),
    query: query,
    query_options: query_options
  }
  next();

}, fetchMany);


router.get('/:product_id/instances/:inst_id', async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.Inst(),
    id: req.params.inst_id
  }
  next();

}, fetchById);


router.get('/:product_id/instances/:inst_id/connections', async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.InstConnection(),
    query: {
      inst_id: req.params.inst_id
    }
  }
  next();

}, fetchMany);


router.get('/:product_id/instances/:inst_id/xrefs', async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.InstXref(),
    query: {
      inst_id: req.params.inst_id
    }
  }
  next();

}, fetchMany);


router.get('/:product_id/instances/:inst_id/properties', async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.Database.InstProperty(),
    query: {
      inst_id: req.params.inst_id
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
