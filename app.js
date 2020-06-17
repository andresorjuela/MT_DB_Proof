require('dotenv').config();

var createError = require('http-errors');
// var compression = require('compression');
var express = require('express');
// var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql');
const cors = require('cors');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')


var app = express();

// Database ....................................................................

var connPool = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTION_LIMIT||5,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dateStrings: true
});

//Makes a DAO factory, named 'Database' available globally.
var Database = require('./database')(connPool);
app.locals.Database = Database;

// Other Global App Config .....................................................
console.log("Environment initialized to: " + process.env.NODE_ENV);

//Note, allow cross origin access to S3 static assets bucket cors config.
/*
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
*/
app.use(cors());

if(process.env.NODE_ENV==="dbpoc" || process.env.NODE_ENV==="production"){
  app.use(awsServerlessExpressMiddleware.eventContext())
}
// app.use(compression());

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text({ limit: "1024kb", defaultCharset: "utf-8" }));
app.use(cookieParser());

// Routing .....................................................................
var productsApiRouter = require('./routes/api/products-api');
var familiesApiRouter = require('./routes/api/families-api');
var equipmentApiRouter = require('./routes/api/equipment-api');
var groupsApiRouter = require('./routes/api/groups-api');
var apiRouter = require('./routes/api/api');
var dataloadApiRouter = require('./routes/api/dataload-api');


// api related
app.use('/api/v1/products', productsApiRouter);
app.use('/api/v1/families', familiesApiRouter);
app.use('/api/v1/equipment', equipmentApiRouter);
app.use('/api/v1/groups', groupsApiRouter);
app.use('/api/v1', apiRouter);
app.use('/api/v1/dataload', dataloadApiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
