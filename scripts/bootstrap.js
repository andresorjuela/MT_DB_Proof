require('dotenv').config();
const mysql = require('mysql');

var connPool = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTION_LIMIT||5,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dateStrings: true
});

//Makes a DAO factory, named 'database' available
// Note: make sure to clean up the connections when done by calling `.pool().end();`
var database = require('../database')(connPool);
exports.database = database;