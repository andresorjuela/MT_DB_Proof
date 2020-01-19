require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql');


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
var Database = require('./src/helpers/database')(connPool);
app.locals.Database = Database;

// Other Global App Config .....................................................

// view engine setup
app.set('views', path.join(__dirname, 'src', 'webapp', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'webapp', 'public')));


// Routing .....................................................................
var indexRouter = require('./src/webapp/routes/index');
var productsApiRouter = require('./src/webapp/routes/api/product');

app.use('/', indexRouter);
app.use('/v1/api/products', productsApiRouter);

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
