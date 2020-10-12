/*
  This delta script adds brand-related columns to the v_equipment_group view 

  Created 10/7/2020

  Author: Derek Gau
*/
drop view if exists v_product_oem_reference;

create view v_product_oem_reference as
select por.*, b.is_oem, b.name_en as brand_en, b.name_zh as brand_zh
from t_product_oem_reference por
left outer join t_brand b on b.id = por.brand_id; 