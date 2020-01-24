/**
  This is a factory for all data model objects.
  @param {object} pool a mysql database connection pool object is required.
*/
module.exports = function (pool) {
  var _ = require('lodash');
  var Dao = require('@apigrate/mysqlutils');
  
  var standard_opts = {
    created_timestamp_column: 'created',
    updated_timestamp_column: 'updated',
    version_number_column: 'version'
  };

  function create_dao(table, entity, options, extension) {
    var dao = new Dao(table, entity, options, pool);
    if (_.isNil(extension)) return dao;
    return extension(dao);
  }

  var factory = {};

  factory.Brand                  = ()=>{ return create_dao('t_brand', 'brand', standard_opts, null); };
  factory.Category               = ()=>{ return create_dao('t_category', 'category', standard_opts, null); };
  factory.Certificate            = ()=>{ return create_dao('t_certificate', 'certificate', standard_opts, null); };
  factory.CustomAttribute        = ()=>{ return create_dao('t_custom_attribute', 'custom-attribute', standard_opts, null); };
  factory.CustomAttributeOption  = ()=>{ return create_dao('t_custom_attribute_option', 'custom-attribute-option', standard_opts, null); };
  factory.Equipment              = ()=>{ return create_dao('t_equipment', 'equipment', standard_opts, null); };
  factory.EquipmentGroup         = ()=>{ return create_dao('t_equipment_group', 'equipment-group', standard_opts, null); };
  factory.EquipmentImage         = ()=>{ return create_dao('t_equipment_image', 'equipment-image', standard_opts, null); };
  factory.EquipmentType          = ()=>{ return create_dao('t_equipment_type', 'equipment-type', standard_opts, null); };
  factory.Family                 = ()=>{ return create_dao('t_family', 'family', standard_opts, null); };
  factory.FamilyGroup            = ()=>{ return create_dao('t_family_group', 'family-group', standard_opts, null); };
  factory.Filter                 = ()=>{ return create_dao('t_filter', 'filter', standard_opts, null); };
  factory.FilterOption           = ()=>{ return create_dao('t_filter_option', 'filter-option', standard_opts, null); };
  factory.Group                  = ()=>{ return create_dao('t_group', 'group', standard_opts, null); };
  factory.ImageType              = ()=>{ return create_dao('t_image_type', 'image-type', standard_opts, null); };
  factory.Lifecycle              = ()=>{ return create_dao('t_lifecycle', 'lifecycle', standard_opts, null); };
  factory.Product                = ()=>{ return create_dao('t_product', 'product', standard_opts, null); };
  factory.ProductCertificate     = ()=>{ return create_dao('t_product_certificate', 'product-certificate', standard_opts, null); };
  factory.ProductFamily          = ()=>{ return create_dao('t_product_family', 'product-family', standard_opts, null); };
  factory.ProductFilter          = ()=>{ return create_dao('t_product_filter', 'product-filter', standard_opts, null); };
  factory.ProductImage           = ()=>{ return create_dao('t_product_image', 'product-image', standard_opts, null); };
  factory.ProductOemReference    = ()=>{ return create_dao('t_product_oem_reference', 'product-oem-reference', standard_opts, null); };
  factory.ProductSet             = ()=>{ return create_dao('t_product_set', 'product-set', standard_opts, null); };
  factory.ProductType            = ()=>{ return create_dao('t_product_type', 'product-type', standard_opts, null); };
  factory.Supplier               = ()=>{ return create_dao('t_supplier', 'supplier', standard_opts, null); };
  factory.Technology             = ()=>{ return create_dao('t_technology', 'technology', standard_opts, null); };

  /**
   * Provides a reference to the pool. Be careful. Other resources are sharing it.
   * To close all connections on the pool, invoke pool.end();
   */
  factory.pool = ()=> { return pool; }

  return factory;
}
