/**
  Table creation script for the Medten Product database.

  Authors: Andres Orjuela, Derek Gau
*/

-- Create syntax for TABLE 't_brand'
CREATE TABLE `t_brand` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `parent_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_category'
CREATE TABLE `t_category` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `parent_id` int(11) unsigned DEFAULT NULL,
  `product_name_formula` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `product_description_formula` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `valid_image_types` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_certificate'
CREATE TABLE `t_certificate` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_custom_attribute'
CREATE TABLE `t_custom_attribute` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned NOT NULL,
  `value_en` varchar(255) DEFAULT NULL,
  `value_zh` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_custom_attribute'
CREATE TABLE `t_product_custom_attribute` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `custom_attribute_id` int(11) unsigned NOT NULL,
  `product_id` int(11) NOT NULL,
  `name_en` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment'
CREATE TABLE `t_equipment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `brand_id` int(11) unsigned NOT NULL,
  `equipment_type_id` int(11) unsigned NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment_group'
CREATE TABLE `t_equipment_group` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) unsigned NOT NULL,
  `group_id` int(11) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment_image'
CREATE TABLE `t_equipment_image` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) unsigned NOT NULL,
  `image_link` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment_type'
CREATE TABLE `t_equipment_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_family'
CREATE TABLE `t_family` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `family_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `group_id` int(11) unsigned NOT NULL,
  `technology_id` int(11) unsigned DEFAULT NULL,
  `family_connector_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `image_link_connector_distal` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Create syntax for TABLE 't_filter'
CREATE TABLE `t_filter` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `name_zh` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_filter_option'
CREATE TABLE `t_filter_option` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `filter_id` int(11) unsigned NOT NULL,
  `option_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `option_zh` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_group'
CREATE TABLE `t_group` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `group_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_image_type'
CREATE TABLE `t_image_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_lifecycle'
CREATE TABLE `t_lifecycle` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product'
CREATE TABLE `t_product` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `product_type_id` int(11) unsigned DEFAULT NULL,
  `oem` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `oem_brand_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `category_id` int(11) unsigned DEFAULT NULL,
  `name_en` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `description_en` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `description_zh` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `packaging_factor` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '1',
  `price` decimal(9,2) DEFAULT NULL,
  `supplier_id` int(11) unsigned DEFAULT NULL,
  `weight` decimal(9,2) DEFAULT NULL,
  `warranty_duration_months` smallint(6) DEFAULT '0',
  `tags` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lifecycle_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_certificate'
CREATE TABLE `t_product_certificate` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `certificate_id` int(11) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_family_connect'
CREATE TABLE `t_product_family_connect` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Create syntax for TABLE 't_product_image'
CREATE TABLE `t_product_image` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `image_type_id` int(11) unsigned DEFAULT NULL,
  `image_link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_product_oem_reference'
CREATE TABLE `t_product_oem_reference` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `brand_id` int(11) unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_filter_option'
CREATE TABLE `t_product_filter_option` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `filter_option_id` int(11) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
);

-- Create syntax for TABLE 't_product_set'
CREATE TABLE `t_product_set` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_product_id` int(11) unsigned NOT NULL,
  `child_product_id` int(11) unsigned NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_product_type'
CREATE TABLE `t_product_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_supplier'
CREATE TABLE `t_supplier` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_technology'
CREATE TABLE `t_technology` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


/*
  Foreign Key relationships follow.
*/

ALTER TABLE `t_custom_attribute` 
  ADD CONSTRAINT `fk_custom_attribute_category` FOREIGN KEY (`category_id`) REFERENCES `t_category` (`id`);


ALTER TABLE `t_product_custom_attribute` 
  ADD CONSTRAINT `fk_custom_attribute_option` FOREIGN KEY (`custom_attribute_id`) REFERENCES `t_custom_attribute` (`id`);

ALTER TABLE `t_product_custom_attribute` 
  ADD CONSTRAINT `fk_custom_attribute_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);


ALTER TABLE `t_equipment` 
  ADD CONSTRAINT `fk_equipment_brand` FOREIGN KEY (`brand_id`) REFERENCES `t_brand` (`id`);
  
ALTER TABLE `t_equipment` 
  ADD CONSTRAINT `fk_equipment_type` FOREIGN KEY (`equipment_type_id`) REFERENCES `t_equipment_type` (`id`);


ALTER TABLE `t_equipment_group` 
  ADD CONSTRAINT `fk_equipment_group_equip` FOREIGN KEY (`equipment_id`) REFERENCES `t_equipment` (`id`);
  
ALTER TABLE `t_equipment_group` 
  ADD CONSTRAINT `fk_equipment_group_group` FOREIGN KEY (`group_id`) REFERENCES `t_group` (`id`);


ALTER TABLE `t_equipment_image` 
  ADD CONSTRAINT `fk_equipment_image_equip` FOREIGN KEY (`equipment_id`) REFERENCES `t_equipment` (`id`);

  
ALTER TABLE `t_family` 
  ADD CONSTRAINT `fk_family_technology` FOREIGN KEY (`technology_id`) REFERENCES `t_technology` (`id`);

ALTER TABLE `t_family` 
  ADD CONSTRAINT `fk_family_group` FOREIGN KEY (`group_id`) REFERENCES `t_group` (`id`);


ALTER TABLE `t_filter` 
  ADD CONSTRAINT `fk_filter_category` FOREIGN KEY (`category_id`) REFERENCES `t_category` (`id`);


ALTER TABLE `t_filter_option` 
  ADD CONSTRAINT `fk_filter_option_filter` FOREIGN KEY (`filter_id`) REFERENCES `t_filter` (`id`);


ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_type` FOREIGN KEY (`product_type_id`) REFERENCES `t_product_type` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_family` FOREIGN KEY (`family_id`) REFERENCES `t_family` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `t_category` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `t_supplier` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_lifecycle` FOREIGN KEY (`lifecycle_id`) REFERENCES `t_lifecycle` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_oem_brand` FOREIGN KEY (`oem_brand_id`) REFERENCES `t_brand` (`id`);


ALTER TABLE `t_product_certificate` 
  ADD CONSTRAINT `fk_product_certificate_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_certificate` 
  ADD CONSTRAINT `fk_product_certificate_cert` FOREIGN KEY (`certificate_id`) REFERENCES `t_certificate` (`id`);


ALTER TABLE `t_product_family_connect` 
  ADD CONSTRAINT `fk_product_family_connect_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_family_connect` 
  ADD CONSTRAINT `fk_product_family_connect_family` FOREIGN KEY (`family_id`) REFERENCES `t_family` (`id`);


ALTER TABLE `t_product_image` 
  ADD CONSTRAINT `fk_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_image` 
  ADD CONSTRAINT `fk_product_image_type` FOREIGN KEY (`image_type_id`) REFERENCES `t_image_type` (`id`);


ALTER TABLE `t_product_oem_reference` 
  ADD CONSTRAINT `fk_product_oem_reference_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_oem_reference` 
  ADD CONSTRAINT `fk_product_oem_reference_brand` FOREIGN KEY (`brand_id`) REFERENCES `t_brand` (`id`);


ALTER TABLE `t_product_filter_option` 
  ADD CONSTRAINT `fk_product_option_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_filter_option` 
  ADD CONSTRAINT `fk_product_option_option` FOREIGN KEY (`filter_option_id`) REFERENCES `t_filter_option` (`id`);


ALTER TABLE `t_product_set` 
  ADD CONSTRAINT `fk_product_set_parent_product` FOREIGN KEY (`parent_product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_set` 
  ADD CONSTRAINT `fk_product_set_child_product` FOREIGN KEY (`child_product_id`) REFERENCES `t_product` (`id`);
