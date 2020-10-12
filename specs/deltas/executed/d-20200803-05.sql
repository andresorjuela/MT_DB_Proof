/*
  Delta script that adds the marketing region tables.

  Created 8/3/2020
  Author: Derek Gau
*/

-- add table, fks
CREATE TABLE `t_marketing_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_product_marketing_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `marketing_region_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `t_product_marketing_region` 
  ADD CONSTRAINT `fk_prod_mkt_reg_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_marketing_region` 
  ADD CONSTRAINT `fk_prod_mkt_reg_region` FOREIGN KEY (`marketing_region_id`) REFERENCES `t_marketing_region` (`id`);
