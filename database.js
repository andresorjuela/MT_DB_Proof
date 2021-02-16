/**
  This is a factory for all data model objects.
  @param {object} pool a mysql database connection pool object is required.
*/
module.exports = function (pool) {
  var _ = require('lodash');
  var {Dao} = require('@apigrate/mysqlutils');
  
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
  factory.CustomAttribute        = ()=>{ return create_dao('t_custom_attribute', 'custom_attribute', standard_opts, null); };
  factory.Equipment              = ()=>{ return create_dao('t_equipment', 'equipment', standard_opts, null); };
  factory.EquipmentGroup         = ()=>{ return create_dao('t_equipment_group', 'equipment_group', standard_opts, null); };
  factory.EquipmentImage         = ()=>{ return create_dao('t_equipment_image', 'equipment_image', standard_opts, null); };
  factory.EquipmentType          = ()=>{ return create_dao('t_equipment_type', 'equipment_type', standard_opts, null); };
  factory.Family                 = ()=>{ return create_dao('t_family', 'family', standard_opts, null); };
  factory.Filter                 = ()=>{ return create_dao('t_filter', 'filter', standard_opts, null); };
  factory.FilterOption           = ()=>{ return create_dao('t_filter_option', 'filter_option', standard_opts, null); };
  factory.Formula                = ()=>{ return create_dao('t_formula', 'formula', standard_opts, null); };
  factory.Group                  = ()=>{ return create_dao('t_group', 'group', standard_opts, null); };
  factory.ImageType              = ()=>{ return create_dao('t_image_type', 'image_type', standard_opts, null); };
  factory.Lifecycle              = ()=>{ return create_dao('t_lifecycle', 'lifecycle', standard_opts, null); };
  factory.PackagingFactor        = ()=>{ return create_dao('t_packaging_factor', 'packaging_factor', standard_opts, null); };
  factory.Product                = ()=>{ return create_dao('t_product', 'product', standard_opts, null); };
  factory.ProductCertificate     = ()=>{ return create_dao('t_product_certificate', 'product_certificate', standard_opts, null); };
  factory.ProductCustomAttribute = ()=>{ return create_dao('t_product_custom_attribute', 'product_custom_attribute', standard_opts, null); };
  factory.ProductEquipment       = ()=>{ return create_dao('t_product_equipment_connect', 'product_equipment_connect', standard_opts, null); };
  factory.ProductFamily          = ()=>{ return create_dao('t_product_family_connect', 'product_family_connect', standard_opts, null); };
  factory.ProductFilterOption    = ()=>{ return create_dao('t_product_filter_option', 'product_filter_option', standard_opts, null); };
  factory.ProductImage           = ()=>{ return create_dao('t_product_image', 'product_image', standard_opts, null); };
  factory.ProductOemReference    = ()=>{ return create_dao('t_product_oem_reference', 'product_oem_reference', standard_opts, null); };
  factory.ProductSet             = ()=>{ return create_dao('t_product_set', 'product_set', standard_opts, null); };
  factory.ProductType            = ()=>{ return create_dao('t_product_type', 'product_type', standard_opts, null); };
  factory.Supplier               = ()=>{ return create_dao('t_supplier', 'supplier', standard_opts, null); };

  //views
  factory.CategoryView                  = ()=>{ return create_dao('v_category', 'category_view', null, null); };
  factory.EquipmentGroupView            = ()=>{ return create_dao('v_equipment_group', 'equipment_group_view', null, null); };
  factory.EquipmentView                 = ()=>{ return create_dao('v_equipment', 'equipment_view', null, null); };
  factory.FamilyView                    = ()=>{ return create_dao('v_family', 'family_view', null, null); };
  factory.FilterOptionView              = ()=>{ return create_dao('v_filter_option', 'filter_option_view', null, null); };
  factory.ProductCustomAttributeView    = ()=>{ return create_dao('v_product_custom_attribute', 'product_custom_attribute_view', null, null); };
  factory.ProductEquipmentView          = ()=>{ return create_dao('v_product_equipment_connect', 'product_equipment_connect_view', null, null); };
  factory.ProductFilterOptionView       = ()=>{ return create_dao('v_product_filter_option', 'product_filter_option_view', null, null); };
  factory.ProductImageView              = ()=>{ return create_dao('v_product_image', 'product_image_view', null, null); };
  factory.ProductOemReferenceView       = ()=>{ return create_dao('v_product_oem_reference', 'product_oem_reference_view', null, null); };
  factory.ProductSetView                = ()=>{ return create_dao('v_product_set', 'product_set_view', null, null); };
  factory.ProductView                   = ()=>{ return create_dao('v_product', 'product_view', null, null); };

  /**
   * Provides a reference to the pool. Be careful. Other resources are sharing it.
   * To close all connections on the pool, invoke pool.end();
   */
  factory.pool = ()=> { return pool; }

  /**
   * Gets a data access object (DAO) for the given name.
   * @returns a dao registered for the given name. If the name is not found, null is returned.
   */
  factory.getDao = (name)=>{
    switch(name){
      case 'brand':
        return factory.Brand();
      case 'category':
        return factory.Category();
      case 'certificate':
        return factory.Certificate();
      case 'custom_attribute':
        return factory.CustomAttribute();
      case 'product_custom_attribute':
        return factory.ProductCustomAttribute();
      case 'equipment':
        return factory.Equipment();
      case 'equipment_group':
        return factory.EquipmentGroup();
      case 'equipment_image':
        return factory.EquipmentImage();
      case 'equipment_type':
        return factory.EquipmentType();
      case 'family':
        return factory.Family();
      case 'family_group':
        return factory.FamilyGroup();
      case 'filter':
        return factory.Filter();
      case 'filter_option':
        return factory.FilterOption();
      case 'formula':
        return factory.Formula();
      case 'group':
        return factory.Group();
      case 'image_type':
        return factory.ImageType();
      case 'lifecycle':
        return factory.Lifecycle();
      case 'packaging_factor':
        return factory.PackagingFactor();
      case 'product':
        return factory.Product();
      case 'product_certificate':
        return factory.ProductCertificate();
      case 'product_equipment_connect':
        return factory.ProductEquipment();
      case 'product_family_connect':
        return factory.ProductFamily();
      case 'product_image':
        return factory.ProductImage();
      case 'product_oem_reference':
        return factory.ProductOemReference();
      case 'product_filter_option':
        return factory.ProductFilterOption();
      case 'product_set':
        return factory.ProductSet();
      case 'product_type':
        return factory.ProductType();
      case 'supplier':
        return factory.Supplier();

      default:
        return null;
    }
  }


  return factory;
}
