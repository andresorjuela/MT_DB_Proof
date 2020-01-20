/**
  Table creation script for the Medten Product database.

  Authors: Andres Orjuela, Derek Gau
*/

/*
  Leave the following DROP TABLE statements commented unless you
  want to overwrite the entire database.
*/
/*
DROP TABLE IF EXISTS `t_product` ;
DROP TABLE IF EXISTS `t_equipment` ;
DROP TABLE IF EXISTS `t_group` ;

DROP TABLE IF EXISTS `t_custom_attribute` ;
DROP TABLE IF EXISTS `t_category` ;
DROP TABLE IF EXISTS `t_family` ;

DROP TABLE IF EXISTS `t_brand` ;
DROP TABLE IF EXISTS `t_image_type` ;
DROP TABLE IF EXISTS `t_certificate` ;
DROP TABLE IF EXISTS `t_warranty` ;
DROP TABLE IF EXISTS `t_lifecycle` ;
DROP TABLE IF EXISTS `t_group` ;
DROP TABLE IF EXISTS `t_product_type` ;
DROP TABLE IF EXISTS `t_equipment_type` ;
DROP TABLE IF EXISTS `t_technology` ;
*/

--
-- Base "valid-value" tables...
--

/**
  table: t_technology

  Indicates the type of technology used by a family of products.
*/
CREATE TABLE `t_technology` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_equipment_type
*/
CREATE TABLE `t_equipment_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_product_type
*/
CREATE TABLE `t_product_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_group

  Contains the equipment group code, a Medten internal ID starting with E and 
  followed by other digits giving information about the category, brand, etc. 
*/
CREATE TABLE `t_group` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_supplier
*/
CREATE TABLE `t_supplier` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_warranty
*/
/* MAY NOT BE NEEDED
CREATE TABLE `t_warranty` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `duration_months` smallint NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/

/**
  table: t_lifecycle
*/
CREATE TABLE `t_lifecycle` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_certificate
*/
CREATE TABLE `t_certificate` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_image_type
*/
CREATE TABLE `t_image_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_category
*/
CREATE TABLE `t_category` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `inheritance` int(11) NOT NULL DEFAULT '0',
  `product_name_formula` varchar(255) NOT NULL DEFAULT '',
  `product_description_formula` varchar(255) NOT NULL DEFAULT '',
  `valid_image_types` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_brand
*/
CREATE TABLE `t_brand` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `parent_id` int(11) NULL,                                   -- FK t_brand (self)
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Tables with FK relationships with the above.
--

CREATE TABLE `t_family` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `brand_id` int(11) DEFAULT NULL,                            -- FK t_brand
  `technology_id` int(11) DEFAULT NULL,
  `family_connector_id` varchar(255) DEFAULT NULL,
  `image_link_connector_distal` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_custom_attribute

  Defines custom attributes that can be assigned to a product in a given category.
*/
CREATE TABLE `t_custom_attribute` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `category_id` int(11) DEFAULT NULL,                        -- FK t_category
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_equipment

  Brand and model-specific information
*/
CREATE TABLE `t_equipment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `brand_id` int(11) NOT NULL,                                -- FK t_brand
  `equipment_type_id` int(11) NOT NULL,                       -- FK t_equipment_type
  `model` varchar(255) DEFAULT NULL,
  `image_1` varchar(255) DEFAULT NULL,
  `image_2` varchar(255) DEFAULT NULL,
  `image_3` varchar(255) DEFAULT NULL,
  `image_4` varchar(255) DEFAULT NULL,
  `image_5` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_equipment_group

  Assigns equipment to a group.
*/
CREATE TABLE `t_equipment_group` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) NOT NULL,                           -- FK t_equipment
  `group_id` int(11) NOT NULL,                               -- FK t_group
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_product

  The product table.
*/
CREATE TABLE `t_product` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `product_type_id` int(11) DEFAULT NULL,
  `oem` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `name_en` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `category_id` int(11) DEFAULT NULL,
  `family_id` int(11) DEFAULT NULL,
  `lifecycle_id` int(11) DEFAULT NULL,
  `manufacturer_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `warranty_duration_months` smallint(6) DEFAULT '0',
  `packaging_factor` varchar(10) DEFAULT '1',
  `price` decimal(9,2) DEFAULT NULL,
  `weight` decimal(9,2) DEFAULT NULL,
  `description_zh` varchar(500) DEFAULT NULL,
  `description_en` varchar(500) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/**
  table: t_custom_attribute_value

  The custom attributes values for a product. 
*/
CREATE TABLE `t_custom_attribute_value` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `custom_attribute_id` int(11) NOT NULL,                    -- FK t_custom_attribute
  `product_id` int(11) NOT NULL,                             -- FK t_product
  `value` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


