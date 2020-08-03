/*
  Delta script that adds views useful to API endpoints.

  Created 8/3/2020
  Author: Derek Gau
*/

-- product marketing region view
create view v_product_marketing_region as select pm.id, 
pm.product_id, 
p.name_en as product_name_en, p.name_zh as product_name_zh, 
pm.marketing_region_id, r.name_en as marketing_region_name_en,
pm.created, pm.updated, pm.version
from t_product_marketing_region pm
left outer join t_product p on p.id = pm.product_id 
left outer join t_marketing_region r on r.id = pm.marketing_region_id;

-- equipment available region view
create view v_equipment_available_region as select ea.id, 
ea.equipment_id, 
e.model as equipment_model, 
ea.available_region_id, r.name_en as available_region_name_en,
ea.created, ea.updated, ea.version
from t_equipment_available_region ea
left outer join t_equipment e on e.id = ea.equipment_id 
left outer join t_available_region r on r.id = ea.available_region_id;