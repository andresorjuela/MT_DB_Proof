const express = require('express');
const _ = require('lodash');
const {parse} = require('fast-csv');

let router = express.Router({ mergeParams: true });
let { fetchOne, fetchById, fetchCount, fetchMany, deleteMatching, parseQueryOptions, updateById, create, saveAll } = require('@apigrate/mysqlutils/lib/express/db-api');
let debug = require('debug')('medten:routes');


/** Get all the fields for a given entity (table) */
router.get('/tables', async function (req, res, next) {
  
  res.status(200).json({
    tables: req.app.locals.Database.available_tables()
  });

});


/** Get all the fields for a given entity (table) */
router.get('/:entity/metadata', validateDao, async function (req, res, next) {
  let metadata = [];

  //remove audit columns, and add js type validation
  res.locals.dao.metadata.forEach((m,idx)=>{
    if(m.is_updated_timestamp || m.is_created_timestamp || m.is_updated_version ){
      return;
    }
    delete m.autoincrement;
    delete m.is_updated_timestamp;
    delete m.is_created_timestamp;
    delete m.is_updated_version;

    metadata.push(m);
  });

  res.status(200).json({
    name: res.locals.dao.entity,
    plural: res.locals.dao.plural,
    table: res.locals.dao.table,
    columns: metadata
  });
  
});


/** Perform a data load in insert mode. */
router.post('/:entity/bulkinsert', validateDao, async function (req, res, next) {
  try{
    let to_process = await parseData(req.body, null, res.locals.dao);

    let inserted = 0;
    let skipped = 0;
    let warnings = to_process.warnings;

    //Each row
    let promises = [];
    to_process.data.forEach(function(row, idx){
      try{
        
        promises.push( res.locals.dao.create(row,{explicit_pk: true}) );

      }catch(ex){
        console.error(ex);
        warnings.push(`Row ${idx+1}: ${ex.message}`);
      }

    });
    
    let resultant = await Promise.allSettled(promises);
    resultant.forEach((p,idx) => {
      if(p.status === 'fulfilled'){
        inserted++;
      } else if (p.status === 'rejected'){
        skipped++;
        warnings.push(`Row ${idx+1}: ${p.reason}`);
      }
    });

    res.status(200).json({
      total: to_process.data.length,
      inserted,
      skipped,
      warnings
    });
  } catch (err){
    console.error(err);
    res.status(500).json({message:"Error loading data.", error: err.message});
  }

  
});

/** Perform a data load in update mode */
router.post('/:entity/bulkupdate', validateDao, async function (req, res, next) {
  try{
    let to_process = await parseData(req.body, null, res.locals.dao);

    let updated = 0;
    let skipped = 0;
    let warnings = to_process.warnings;

    //Each row
    let promises = [];
    to_process.data.forEach(function(row, idx){
      try{
        
        promises.push( res.locals.dao.update(row,{explicit_pk: true}) );

      }catch(ex){
        console.error(ex);
        warnings.push(`Row ${idx+1}: ${ex.message}`);
      }

    });
    
    let resultant = await Promise.allSettled(promises);
    resultant.forEach((p,idx) => {
      if(p.status === 'fulfilled'){
        updated++;
      } else if (p.status === 'rejected'){
        skipped++;
        warnings.push(`Row ${idx+1}: ${p.reason}`);
      }
    });

    res.status(200).json({
      total: to_process.data.length,
      updated,
      skipped,
      warnings
    });
  } catch (err){
    console.error(err);
    res.status(500).json({message:"Error loading data.", error: err.message});
  }

  
});


/**
 * Middleware which loads a dao into the `res.locals.dao` property based on 
 * the entity name. The dao is initialized with database metadata.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function validateDao(req, res, next){
  let dao = req.app.locals.Database.getDao(req.params.entity);
  if(!dao){
    res.status(400).json({message: "There is no support for that type of data."});
    return;
  }
  await dao.fetchMetadata();

  res.locals.dao = dao;
  next();
}


/**
 * Parses tab-delimited data.
 * @param {string} raw raw tab-delimited data to parse
 * @param {string} delimiter (optional) defaults to tab
 * @returns {Promise<object>} an array of objects
 * @example {
 *  pk: string the primary key header name, if detected
 *  warnings: Array<string> warning messages associated with the parse.
 *  data: Array<object> parsed data
 * }
 */
async function parseData(raw, delimiter, dao){

  return new Promise(function(resolve, reject){
    let parseres = {
      pk: null,
      warnings: [],
      data: []
    }

    const stream = parse({delimiter: delimiter || '\t', headers: true})
    .on('headers', headers => {
      debug(headers);
      headers.forEach(h=>{
        let match = dao.metadata.find(c => {
          return c.column === h;
        });
        if(!match){
          parseres.warnings.push(`Header "${h}" not recognized. Associated data will be ignored.`);
        } else {
          if(match.pk){
            console.log(`Detected pk "${match.column}"`);
            parseres.pk = match.column;
          }
        }

      });
      

    })
    .on('data', row => { 
      parseres.data.push(row); 
    })
    .on('error', error => { 
      console.error(error); 
      reject(error); 
    })
    .on('end', rowCount => { 
      debug(`Parsed ${rowCount} rows.`);
      resolve(parseres);
    });

    stream.write(Buffer.from(raw,'utf-8'));
    stream.end();
    
  });
}


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
  });
})


module.exports = router;
