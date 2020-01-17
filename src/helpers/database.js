/**
  This is a factory for all data model objects.
  @param {object} pool a mysql database connection pool object is required.

*/
module.exports = function (pool) {
  var _ = require('lodash');
  var Dao = require('@apigrate/mysqlutils');
  var factory = {};

  var standard_opts = {
    created_timestamp_column: 'created',
    updated_timestamp_column: 'updated',
    version_number_column: 'version'
  };

  /*
    Step 1. Add your DAOs here as functions as denoted below.
    Step 2. Make sure this factory is conveniently available on your globals.
    Step 3. With a reference to this factory, you can easy access your database tables

    var db = require('./services/database');
    db.Account().find({name: 'Acme'})...

  */
  factory.Equipment = function () { return create_dao('t_equipment', 'equipment', standard_opts, null); };
  factory.Product = function () { return create_dao('t_family', 'family', standard_opts, null); };
  factory.Product = function () { return create_dao('t_product', 'product', standard_opts, null); };

  function create_dao(table, entity, options, extension) {
    var dao = new Dao(table, entity, options, pool);
    if (_.isNil(extension)) return dao;
    return extension(dao);
  }

  //Provides a reference to the pool. Be careful. Other resources are sharing it.
  factory.pool = function () {
    return pool;
  }

  return factory;
}
