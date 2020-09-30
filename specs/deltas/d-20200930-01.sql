/*
  This delta script adds brand-related columns to the v_equipment_group view 

  Created 9/30/2020
  Author: Derek Gau
*/
drop view if exists v_equipment_group;

create view v_equipment_group as select j.id, j.equipment_id,
e.model, e.brand_id, b.name_en as brand_en, b.name_zh as brand_zh, b.is_oem,
j.group_id, g.group_code, 
j.created, j.updated
from t_equipment_group j
left outer join t_equipment e on e.id = j.equipment_id 
left outer join t_brand b on b.id = e.brand_id 
left outer join t_group g on g.id = j.group_id;