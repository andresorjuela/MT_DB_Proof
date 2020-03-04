/**
 * Generates the client-side env.js file that carries environment-specific 
 * variables exposed to the client-side scripts.
 * 
 * All variables should be configured in your [environment].env file, and
 * used here as appropriate.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const pug = require('pug');

try{

  generateIndexFile();
  generateEnvFile();
  process.exit(0);

} catch(ex){
  console.error(ex);
  process.exit(1);
}


function generateEnvFile(){
  //Should NEVER contain sensitive info.
  let allowed_vars = [
    "NODE_ENV",
    "API_BASE_URL",
    "STATIC_ASSETS_PATH"
  ];

  let outfile = path.join( path.dirname("."), "src", "assets", "javascripts", `env.js`);

  let varcontent = ``;
  allowed_vars.forEach(vname=>{
    varcontent += `\t\t${vname}: "${process.env[vname]}",\n`
  });
  
  let content =`
/** Environment-specific global settings (generated) **/
export default function(){
\treturn { 
${varcontent} 
\t}
}`;
  fs.writeFileSync(outfile,content);
}

function generateIndexFile(){
  let templatefile = path.join( path.dirname("."), "src", "assets", "views", `index.pug`);
  
  let compiledFunction = pug.compileFile(templatefile);
  
  let context = {};
  
  let outfile = path.join( path.dirname("."), "src", "assets", `index.html`);

  fs.writeFileSync(outfile, compiledFunction(context) ); 
}