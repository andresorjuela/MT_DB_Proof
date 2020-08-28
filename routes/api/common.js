/**
 * Mix-ins/functions used across various APIs.
 */

const {CriteriaHelper} = require('@apigrate/mysqlutils');
const _ = require('lodash');

/**
 * Provide consistent search term queries.
 * @param {array} allowed_fields an array of string field names that may be searched.
 * @param {object} q a **parsed query options** object.
 * 
 * @returns a criteria helper object containing a whereClause and parms property
 * that can be used for queries
 * 
 */
function parseSearchTermCriteria(allowed_fields, qopts){
  let criteria = new CriteriaHelper();
  if(qopts.query.search_term_fields){
    criteria.andGroup();
    for(let field_name of qopts.query.search_term_fields){
      if(allowed_fields.includes(field_name)){
        criteria.or(field_name, 'LIKE', `%${qopts.query.search_term}%`);
      }
      //just ignore anything not searchable.
    }
    criteria.groupEnd();
    
    delete qopts.query.search_term_fields;
    delete qopts.query.search_term;
  }
  

  let hasOtherFilters = false;
  for(let field_name in qopts.query){
    hasOtherFilters = true; break;
  }

  if(hasOtherFilters){
    criteria.andGroup();
    //The rest of the "filters" are ANDed on to the search term query.
    for(let field_name in qopts.query){
      if( _.isArray(qopts.query[field_name]) ){
        criteria.and(field_name, 'IN', qopts.query[field_name]);
      } else {
        criteria.and(field_name, '=', `${qopts.query[field_name]}`);
      }
      
    }
    criteria.groupEnd();
  }

  return criteria;
}

exports.parseSearchTermCriteria = parseSearchTermCriteria;