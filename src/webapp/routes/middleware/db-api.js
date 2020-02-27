// Middleware functions that provide consistent handling of API CRUD handling.
const _ = require('lodash');

/**
  Handles a GET by ID request to query an entity by id from the database.
  @returns response handled as follows
    - HTTP 400 if no dbInstructions or id is set
    - HTTP 404 if the entity is not found 
    - HTTP 200 with the entity when found.
*/
async function fetchById(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || _.isEmpty(dbi.id)) {
      res.status(400).end();
      return;
    }
    let singleEntity = await dbi.dao.get(dbi.id);

    if (_.isEmpty(singleEntity)) {
      res.status(404).end();
      return;
    }
    res.status(200).json(singleEntity);
    return;
  } catch (ex) {
    next(ex);
  }
}

/**
  Handles a request to query an entity by a criteria
  and return a single matching entity. 
  @returns response handled as follows
    - HTTP 400 if no dbInstructions or no query
    - HTTP 404 if the entity is not found
    - HTTP 200 with the entity when found.
*/
async function fetchOne(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || _.isEmpty(dbi.query)) {
      res.status(400).end();
      return;
    }
    let singleEntity = await dbi.dao.one(dbi.query);
    if (_.isEmpty(singleEntity)) {
      res.status(404).end();
      return;
    }
    res.status(200).json(singleEntity);
    return;
  } catch (ex) {
    next(ex);
  }
}

/**
  Handles a request to query entities by a criteria
  where many entities can be returned.
  @returns response handled as follows
    - HTTP 400 if no dbInstructions or no query, query_options, or query_options.limit, or 
    an invalid query_options.limit (i.e > 10000 entities or <= 0).
    - HTTP 200 with the array of results (or an empty array if no matches).
*/
async function fetchMany(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi)) {
      res.status(400).end();
      return;
    }
    if (_.isEmpty(dbi.query) &&
      (_.isEmpty(dbi.query_options)
        || _.isEmpty(dbi.query_options.limit)
        || (dbi.query_options.limit * 1 <= 0 || dbi.query_options.limit * 1 > 10000))) {
      res.status(400).json({ message: "If no query criteria are provided, a valid limit parameter must be provided." });
      return;
    }
    let multipleEntities = await dbi.dao.find(dbi.query, dbi.query_options);
    let result = {};
    result[dbi.dao.plural] = multipleEntities;
    res.status(200).json(result);
    return;
  } catch (ex) {
    next(ex);
  }
}

/**
  Handles a request to create an entity.
  @returns response handled as follows
    - HTTP 400 if no dbInstructions or no toSave entity
    - HTTP 200 with the created entity.
*/
async function create(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || _.isEmpty(dbi.toSave)) {
      res.status(400).end();
      return;
    }
    let result = await dbi.dao.create(dbi.toSave);
    res.status(200).json(result);
    return;
  } catch (ex) {
    next(ex);
  }
}

/**
  Handles a request to upsert (create or update) an entity.
  @returns response handled as follows
    - HTTP 400 if no dbInstructions or no toSave entity
    - HTTP 200 with the created/updated entity.
*/
async function save(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || _.isEmpty(dbi.toSave)) {
      res.status(400).end();
      return;
    }
    let result = await dbi.dao.save(dbi.toSave);
    res.status(200).json(result);
    return;
  } catch (ex) {
    next(ex);
  }
}


/**
  Handle a request to update an entity. (The entity must include its db identifier).

  @returns response handled as follows
    - HTTP 400 if no dbInstructions or no toUpdate entity
    - HTTP 410 if there no entity was found to update (nothing is returned).
    - HTTP 200 with the updated entity.
*/
async function updateById(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || _.isEmpty(dbi.toUpdate)) {
      res.status(400).end();
      return;
    }
    let result = await dbi.dao.update(dbi.toUpdate);
    if (result && result._affectedRows === 0) {
      res.status(410).end();
      return;
    }
    res.status(200).json(result);
    return;
  } catch (ex) {
    next(ex);
  }
}


/**
  Handle a request to delete an entity by id. 

  @returns response handled as follows
    - HTTP 400 if no dbInstructions or no id was given
    - HTTP 410 if there no entity was found to delete (nothing is returned).
    - HTTP 200 with an object indicating _affectedRows.
*/
async function deleteById(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || _.isEmpty(dbi.id)) {
      res.status(400).end();
      return;
    }
    let result = await dbi.dao.delete(dbi.id);
    if (result && result._affectedRows === 0) {
      res.status(410).end();
      return;
    }
    res.status(200).json(result);
    return;
  } catch (ex) {
    next(ex);
  }
}

/**
  Handle a request to delete many entities that match criteria matching the
  toDelete template entity.

  @returns response handled as follows
    - HTTP 400 if no dbInstructions or no toDelete template was given
    - HTTP 410 if there no entities were found to delete (nothing is returned).
    - HTTP 200 with an object indicating _affectedRows.
*/
async function deleteMatching(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || _.isEmpty(dbi.toDelete)) {
      res.status(400).end();
      return;
    }
    let result = await dbi.dao.deleteMatching(dbi.toDelete);
    if (result && result._affectedRows === 0) {
      res.status(410).end();
      return;
    }
    res.status(200).json(result);
    return;
  } catch (ex) {
    next(ex);
  }
}

/**
 * Parses the query instructions for a query from the request.
 * @param {object} req the request
 * @param {array} allowed_query_fields allowable query fields
 * @param {array} default_orderby order by these fields by default (default ['+id'])
 * @param {number} default_limit max records returned (default: 10000)
 * @returns {object}
 * @example {
 *  query: { name: 'platypus', type: 'mammal'}
 *  query_options: {limit: 10000, order_by: [...]}
 * }
 */
function parseQueryOptions(req, allowed_query_fields, default_orderby, default_limit){
  let query = req.query;
  let query_options = {
    limit: default_limit || 10000,
    order_by: default_orderby || ['+id']
  };
  for (key in query) {
    //Valid search fields
    if (allowed_query_fields.indexOf(key) >= 0) continue;

    if (key === 'limit') {
      query_options.limit = query[key];
    }
    if (key === 'order_by') {
      query_options.order_by = query[key].split(',');
    }

    delete query[key];
  }
  return { query, query_options };
}


module.exports.fetchById = fetchById;
module.exports.fetchOne = fetchOne;
module.exports.fetchMany = fetchMany;
module.exports.create = create;
module.exports.updateById = updateById;
module.exports.save = save;
module.exports.deleteById = deleteById;
module.exports.deleteMatching = deleteMatching;

module.exports.parseQueryOptions = parseQueryOptions;