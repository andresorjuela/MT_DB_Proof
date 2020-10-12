/*
  This delta script provides cascading delete capabilities for the product table and its related tables.

  Created 8/27/2020
  Author: Derek Gau
*/

ALTER TABLE `t_product_custom_attribute` DROP FOREIGN KEY `fk_custom_attribute_product`;
ALTER TABLE `t_product_custom_attribute` 
  ADD CONSTRAINT `fk_custom_attribute_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_certificate` DROP FOREIGN KEY `fk_product_certificate_product`;
ALTER TABLE `t_product_certificate` 
  ADD CONSTRAINT `fk_product_certificate_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`)  ON DELETE CASCADE;

ALTER TABLE `t_product_equipment_connect` DROP FOREIGN KEY `fk_product_equipment_connect_product`;
ALTER TABLE `t_product_equipment_connect` 
  ADD CONSTRAINT `fk_product_equipment_connect_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`)  ON DELETE CASCADE;

ALTER TABLE `t_product_family_connect` DROP FOREIGN KEY `fk_product_family_connect_product`;
ALTER TABLE `t_product_family_connect` 
  ADD CONSTRAINT `fk_product_family_connect_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_image` DROP FOREIGN KEY `fk_product_image_product`;
ALTER TABLE `t_product_image` 
  ADD CONSTRAINT `fk_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_oem_reference` DROP FOREIGN KEY `fk_product_oem_reference_product`;
ALTER TABLE `t_product_oem_reference` 
  ADD CONSTRAINT `fk_product_oem_reference_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_filter_option` DROP FOREIGN KEY `fk_product_option_product`;
ALTER TABLE `t_product_filter_option` 
  ADD CONSTRAINT `fk_product_option_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_set` DROP FOREIGN KEY `fk_product_set_parent_product`;
ALTER TABLE `t_product_set` 
  ADD CONSTRAINT `fk_product_set_parent_product` FOREIGN KEY (`parent_product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_set` DROP FOREIGN KEY `fk_product_set_child_product`;
ALTER TABLE `t_product_set` 
  ADD CONSTRAINT `fk_product_set_child_product` FOREIGN KEY (`child_product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_supplier` DROP FOREIGN KEY `fk_product_supplier_product`;
ALTER TABLE `t_product_supplier` 
  ADD CONSTRAINT `fk_product_supplier_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_marketing_region` DROP FOREIGN KEY `fk_prod_mkt_reg_product`;
ALTER TABLE `t_product_marketing_region` 
  ADD CONSTRAINT `fk_prod_mkt_reg_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;
