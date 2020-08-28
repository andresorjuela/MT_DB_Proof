// Additional middleware methods to provide API capabilities for interacting with the backend database and returning results.

const _ = require('lodash');
const { writeToStream } = require('@fast-csv/format');


/**
  Handles a request to query entities by a criteria where many entities can be returned, but instead of returning a JSON response, it 
  calls the next middleware method after query execution after placing the result on the `response.locals.result` property;

  Expects a `res.locals.dbInstructions` entity with the following properties:
  @property {object} dao the data access object 
  
  @property {object} query query object used to match criteria for a simple implied WHERE clause. Either `query` or `criteria` is required.
  
  @property {object} criteria a criteria helper object for complex queries. Either `query` or `criteria` is required.
  @property {string} criteria.whereClause a parameterized SQL where clause without the 'WHERE'.
  @property {string} criteria.parms the parameter array for the whereClause .
  
  @property {object} query_options the query options object
  @property {array}  query_options.columns (optional) columns to include in the response. If omitted, all are returned.
  @property {number} query_options.limit the number of rows to limit being returned
  @property {array}  query_options.orderBy the order by criteria as an array.
  
  @property {boolean} with_total (optional, default false) when true, an additional "total" property is added to the response payload
  representing the total number of entities in the database that matched the query-regardless of limit parameters.

  @returns calls the next middleware method, after placing the query result on the res.locals.result. 
*/
exports.fetchManyAnd = async function(req, res, next) {
  try {
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi)) {
      res.status(400).json({message:'Unable to get data.',error:'Missing payload.'});
      return;
    }
    if (_.isEmpty(dbi.query) && _.isEmpty(dbi.criteria) ){
      //A "select ALL" is allowed.
      // if( _.isEmpty(dbi.query_options)
      //   || !dbi.query_options.limit
      //   || (parseInt(dbi.query_options.limit) <= 0 || parseInt(dbi.query_options.limit) > 10000)){
      //   res.status(400).json({ message:'Unable to get data.',error: "If no query criteria are provided, a valid limit parameter must be provided." });
      //   return;
      // }
      dbi.query = {};
    }

    let result = {};
    if (dbi.query){
      if (dbi.with_total){
        result.total = await dbi.dao.count(dbi.query);
        if(result.total === 0){
          //Don't bother with the full query and return immediately.
          result[dbi.dao.plural] = [];
          
          res.locals.result = result;
          next();
          return;
        }
      }
      let multipleEntities = await dbi.dao.find(dbi.query, dbi.query_options);
      result[dbi.dao.plural] = multipleEntities;

      res.locals.result = result;
      next();
      return;

    } else if (dbi.criteria){
      if (dbi.with_total){
        let temp = await dbi.dao.sqlCommand(`SELECT count(*) AS count FROM ${dbi.dao.table} ${dbi.criteria.whereClause ? `WHERE ` + dbi.criteria.whereClause: ''}`, dbi.criteria.parms);
        result.total = temp[0].count;
        if(result.total === 0){
          //Don't bother with the full query and return immediately.
          result[dbi.dao.plural] = [];
          
          res.locals.result = result;
          next();
          return;
        }
      }
      let multipleEntities = await dbi.dao.selectWhere(dbi.criteria.whereClause, dbi.criteria.parms, dbi.query_options);
      result[dbi.dao.plural] = multipleEntities;
     
      res.locals.result = result;
      next();
      return;
    }
    
    res.status(400).json({ message:'Unable to get data.',error: "Insufficient query criteria were provided." });
    return;
  } catch (ex) {
    next(ex);
  }
}


exports.resultToCsv = async function(req, res, next){
  try{
    let dbi = res.locals.dbInstructions;
    if (_.isEmpty(dbi) || !res.locals.result){
      res.status(500).json({ message:'Invalid configuration.',error: "The expected parameters/query result were not available." });
      return;
    }

    //Format for CSV
    let fileOpts = {
      delimiter: ',',
      quote: '"',
      escape: '"',
      headers: dbi.dao.metadata.map( (meta) => {
        return meta.column;
      }),
      alwaysWriteHeaders: true,
    };

    res.status(200);
    res.type("csv");
    writeToStream(res, res.locals.result[dbi.dao.plural], fileOpts );

    return;    
    
  }catch(ex){
    next(ex);
  }
}