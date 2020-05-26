require('dotenv').config();
const {program} = require('commander');
const mysql = require('mysql');
// const cliProgress = require('cli-progress');
const {ProductNameGenerator} = require('../services/product-name-generator');

function commaSeparatedList(value, dummyPrevious) {
  return value.split(',');
}

program.version('0.0.1');
program
  .option('-b --beginId <number>', 'Beginning product id.', parseInt)
  .option('-e --endId <number>', 'Ending product id.', parseInt)
  .option('-i --ids <id list>', 'Comma-separated list of ids.', commaSeparatedList)
  .option('-N --withName', 'Generate product names')
  .option('-D --withDescription', 'Generate product descriptions');

program.parse(process.argv);

if(!program.beginId && !program.ids){
  console.error("Either the 'beginId' or 'ids' parameter are required.")
  process.exit(-1);
}
if(program.beginId && program.endId && program.endId <= program.beginId){
  console.error("The 'endId' must be greater than the 'beginId'.")
  process.exit(-1);
}
if(!program.withName && !program.withDescription){
  console.error("One of either the 'withName' or 'withDescription' parameters are required.")
  process.exit(-1);
}
if(program.beginId && program.ids){
  console.warn("Either the 'ids' parameter overrides 'beginId' and 'endId' parameters.")
  program.beginId = null;
  program.endId = null;
}

var connPool = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTION_LIMIT||5,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dateStrings: true
});

//Makes a DAO factory, named 'Database' available globally.
var database = require('../database')(connPool);

console.log(`Generating product names...
  beginning id: ${program.beginId}
  ending id: ${program.endId}
  id list: ${program.ids}
  generate name? ${program.withName}
  generate description? ${program.withDescription}
`);

(async ()=>{
  //let bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  let generator = new ProductNameGenerator(database, {debug: true});

  try{
    let ids = [];
    if(program.ids){
      ids = program.ids;
    } else {
      for(let i=program.beginId; i<= program.endId; ids.push(i++));
    }
    //bar.start(ids.length, 0, {message: "Processing products..."});
    
    console.log(`Processing ${ids.length} products...`);
    for(let i=0; i<ids.length; i++){
      await generator.generate(ids[i], program.withName, program.withDescription);

      //bar.increment(1,{message: `Finished product ${ids[i]}`});
    }
    console.log(`...processing complete.`);

  }catch(ex){
    console.error(ex);
  } finally {
    //bar.stop();
    connPool.end();
  }

})()
  



