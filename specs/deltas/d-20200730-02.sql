/*
  Delta script that adds the is_oem column to the brand table.
  Created 7/30/2020.
  Author: Derek Gau
*/

-- drop affected views
drop view v_equipment;

-- column removal
alter table `t_brand` add column `is_oem` tinyint(3) not null default 0;

-- replace affected views
create view v_equipment as select e.id, e.model, 
e.equipment_type_id, t.name_en as type_en, t.name_zh as type_zh,
e.brand_id, b.name_en as brand_en, b.name_zh as brand_zh, b.is_oem,
e.created, e.updated
from t_equipment e  
left outer join t_equipment_type t on t.id = e.equipment_type_id 
left outer join t_brand b on b.id = e.brand_id;