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


/**
 * Middleware that Parses a search and search count query for use with complex searches.
 * This is typically used for searches on products, families, equipment, and groups.
 * 
 * An advanced search is composed of three parts:
 * 
 * 1. a wildcard search_term that can be applied to many text fields on the main entity (see dao) being searched.
 * 2. an category search if the main entity has a category_id column that will search for the presence of entities 
 * overlapping the category id list.
 * 3. a search_filter_value that will be used to further narrow the aforementioned search results. The search_filter
 * parameter names a configuration for how the search_filter_value will be applied to the main entity or joined 
 * entity tables.
 * 
 * A `res.locals.dbInstructions` object must be present and set with the following:
 * @example
 * {
 *   dao: {},                       // @apigrate/mysqlutils data access object (required)
 *   search_payload: {},            // typically from the request body (required, may be blank for a full search)
 *   searchable_columns: [],        // array of searchable column names (required)
 *   exclude_columns_on_output: [], // columns you want excluded from output (optional)
 *   filter_definitions: [          // array of objects defining filters
 *     {
 *        join_table: "",    // the join table off of the main DAO being joined for the filter (optional)
 *        join_column: ""    // the column on the join table for the ON clause to be joined to the DAO id column. (optional)
 *        where_column: "",  // the column to which the search_filter_value criterion will be applied. 
 *                           //   Assumed to be on the DAO if no join table is provided. (required)
 *     },...
 *   ], 
 * }
 * 
 * @return Upon completion it places res.local.dbInstructions with a `sql` and `sql_count` object as appropriate.
 */
let parseAdvancedSearchRequest = async function (req, res, next){
  
  try {
    // parse search term fields
    // parse category search fields
    // parse filter fields
    // parse standard query options (offset, limit, order_by)
    let dao = res.locals.dbInstructions.dao;
    let payload = res.locals.dbInstructions.search_payload;
    let searchable_columns = res.locals.dbInstructions.searchable_columns;
    if(!searchable_columns){
      res.status(500).json({
        message: "Invalid search.",
        error: "A list of searchable columns must be provided."
      });
      return;
    }
    let filter_definitions = res.locals.dbInstructions.filter_definitions;
    let exclude_columns_on_output = res.locals.exclude_columns_on_output || [];

    await dao.fetchMetadata();

    //Which columns are output...
    let columns = [];
    dao.metadata.forEach(m=>{
      if(exclude_columns_on_output && exclude_columns_on_output.includes(m.column)){
        return;//exclude the formulas from download
      } else {
        columns.push(`v.${m.column}`);
      }
    }); 


    let qs =  `select DISTINCT ${columns.join(',')} from ${dao.table} v `;
    let count_qs = `select count(DISTINCT(v.id)) as count from ${dao.table} v `;
    let join = ``; 
    let optsclause = ``;
    let criteria = new CriteriaHelper({omitIfEmpty: false});
    
    //
    // parse search term fields.
    //
    if(payload.search_term_fields && payload.search_term_fields.length > 0 && dao.table !== 'v_family' ){
      criteria.andGroup();
      for(let field_name of payload.search_term_fields){
        if(searchable_columns.includes(field_name)){
          criteria.or(`v.${field_name}`, 'LIKE', `%${payload.search_term}%`);
        }
        //just ignore anything not searchable.
      }
      criteria.groupEnd();
      
      delete payload.search_term_fields;
      delete payload.search_term;
    } else if(payload.search_term_fields && payload.search_term_fields.length > 0 && dao.table === 'v_family' ){
      //Ugly hack for family searches
      criteria.andGroup();
      for(let field_name of payload.search_term_fields){
        if(field_name === 'oem_brand_en' || field_name === 'category_en'){
          if( !join.includes("v_product")){
            join += ` JOIN v_product J on J.family_id = v.id`; 
          }
          criteria.or(`J.${field_name}`, 'LIKE', `%${payload.search_term}%`);

        } else if(searchable_columns.includes(field_name)){
          criteria.or(`v.${field_name}`, 'LIKE', `%${payload.search_term}%`);
        }
        //just ignore anything not searchable.
      }
      criteria.groupEnd();
      
      delete payload.search_term_fields;
      delete payload.search_term;
    }

    //
    // parse category search fields if a category_id was provided
    //   (could be an array or a single value)
    //
    if(payload.category_id && dao.table === 'v_product'){
      criteria.andGroup();
      if( _.isArray(payload.category_id) ){
        criteria.and('v.category_id', 'IN', payload.category_id);
      } else {
        criteria.and('v.category_id', '=', `${payload.category_id}`);
      }
      criteria.groupEnd();
    } else if (payload.category_id && dao.table === 'v_family') {
      // Ugly hack for family category query
      if( !join.includes("v_product")){
        join += ` JOIN v_product J on J.family_id = v.id`; //ALWAYS ASSUMING A JOIN on the id column.
      }
      criteria.andGroup();
      if( _.isArray(payload.category_id) ){
        criteria.and('J.category_id', 'IN', payload.category_id);
      } else {
        criteria.and('J.category_id', '=', `${payload.category_id}`);
      }
      criteria.groupEnd();
    }

    //
    // parse search filters
    //
    if(payload.search_filter && payload.search_filter_value && filter_definitions){
      let filter = filter_definitions[payload.search_filter];
      // if(!payload.search_filter_value){
      //   res.status(400).json({
      //     message:`Missing search_filter_value.`,
      //     error: `When using the search_filter parameter, the search_filter_value is parameter is required and may not be empty.`
      //   });
      // }
      if(filter){
        criteria.andGroup();
        if(filter.join_table){
          //Need to do a join, if one was not created by the category
          if( join.indexOf(filter.join_table) < 0){
            join += ` JOIN ${filter.join_table} J on J.${filter.join_column} = v.id`; //ALWAYS ASSUMING A JOIN on the id column.
          }
          criteria.and(`J.${filter.where_column}`, '=', payload.search_filter_value);
        } else {
          criteria.and(filter.where_column, '=', payload.search_filter_value);
        }
        criteria.groupEnd();
      } else {
        let allowed = [];
        for(let f in filter_definitions){
          allowed.push(f);
        }
        res.status(400).json({
          message:`Invalid search_filter "${payload.search_filter}".`,
          error: `When using the search_filter parameter, you may use any of: [${allowed.join(", ")}].`
        });
        return;
      }
      delete payload.search_filter;
      delete payload.search_filter_value;
    }

    //Done building the where.

    // parse options clause
    if(payload.order_by){
      optsclause += ` ORDER BY`;
      let tmp = ``;
      payload.order_by.forEach(col=>{
        let order = 'ASC';
        if(col.startsWith('+')){
          col = col.substring(1);
        } else if (col.startsWith('-')){
          col = col.substring(1);
          order = 'DESC';
        }
        if( searchable_columns.includes(col) ){
          if(tmp) tmp += ',';
          tmp += ` ${col} ${order}`;
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

    let where = '';
    if(criteria.whereClause){
      where = `WHERE ${criteria.whereClause}`;
    }
    let fullQuery = `${qs} ${join} ${where} ${optsclause}`;
    let fullCountQuery = `${count_qs} ${join} ${where}`;

    res.locals.dbInstructions.sql = {
      statement: fullQuery,
      parms: criteria.parms,
    }
    res.locals.dbInstructions.sql_count = {
      statement: fullCountQuery,
      parms: criteria.parms,
    }

    next(); 
  } catch (ex){
    console.error(ex);
    res.status(400).json({
      message:`Unable to parse search.`,
      error: ex.message
    });
  }
}
exports.parseAdvancedSearchRequest = parseAdvancedSearchRequest;