require('dotenv').config();

const path = require('path');
var envslug = process.env.NODE_ENV;
if(envslug==='production'){
  envslug = '';
} else {
  envslug = '-'+envslug;
}
let outfile = path.join( path.dirname("."), "src", "webapp", "public", "javascripts", `env.js`);
//TODO write an env.js file.