/*
  Delta script that adds the equipment region tables.

  Created 8/3/2020
  Author: Derek Gau
*/

-- add table, fks
CREATE TABLE `t_available_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `t_equipment_available_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) unsigned DEFAULT NULL,
  `available_region_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `t_equipment_available_region` 
  ADD CONSTRAINT `fk_equip_avail_region_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `t_equipment` (`id`);

ALTER TABLE `t_equipment_available_region` 
  ADD CONSTRAINT `fk_equip_avail_region_region` FOREIGN KEY (`available_region_id`) REFERENCES `t_available_region` (`id`);
