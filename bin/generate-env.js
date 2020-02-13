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
var envslug = process.env.NODE_ENV;
if(envslug==='production'){
  envslug = '';
} else {
  envslug = '-'+envslug;
}
let outfile = path.join( path.dirname("."), "src", "assets", "javascripts", `env.js`);

//Should NEVER contain sensitive info.
let these_vars = ["NODE_ENV","API_BASE_URL","STATIC_ASSETS_PATH"];
let varcontent = ``;
these_vars.forEach(vname=>{
  varcontent += `${vname}: "${process.env[vname]}", `
});

let content =`
/** Generated environment file **/
export default function(){
return {
${varcontent}
}
}
`;

console.log(content);
fs.writeFileSync(outfile,content);
process.exit(0);