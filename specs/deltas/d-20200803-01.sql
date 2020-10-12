/*
  Delta script that adds/modifies the columns on the t_product table
  to support international pricing, weights, name audit tracking, and
  some internal notes fields.

  Created 8/3/2020
  Author: Derek Gau
*/

-- drop affected views
drop view v_product;

-- column changes
alter table `t_product`
  rename column `price` to `price_us`,
  add column `price_zh` decimal(9,2) DEFAULT null,
  add column `price_eu` decimal(9,2) DEFAULT null,
  rename column `weight` to `weight_kg`;
alter table `t_product`
  modify column `weight_kg` decimal(9,4) DEFAULT null,
  add column `weight_lbs` decimal(9,4) DEFAULT null,
  add column `name_en_edit_user_id` int unsigned DEFAULT null,
  add column `name_en_edit_timestamp` timestamp DEFAULT null,
  add column `name_zh_edit_user_id` int unsigned DEFAULT null,
  add column `name_zh_edit_timestamp` timestamp DEFAULT null,
  add column `video_link` varchar(255) DEFAULT null,
  add column `note_internal` varchar(512) DEFAULT null,
  add column `notes_client` varchar(512) DEFAULT null,
  drop foreign key `fk_product_supplier`,
  drop column `supplier_id`;

-- replace affected views
create view v_product as select 
p.id, p.sku, p.oem, p.name_en, p.description_en, p.name_zh, p.description_zh, 
p.product_type_id, t.name_en as product_type_en, t.name_zh as product_type_zh, 
p.family_id, f.family_code, f.family_connector_code, f.name_en as family_name_en, f.video_link as family_video_link,
p.oem_brand_id, b.name_en as oem_brand_en, b.name_zh as oem_brand_zh,
p.category_id, c.name_en as category_en, c.name_zh as category_zh,
nf.content as product_name_formula, 
df.content as product_description_formula, 
pf.value as packaging_factor, p.packaging_factor_id, p.price_us, p.price_zh, p.price_eu,
p.weight_kg, p.weight_lbs, p.warranty_duration_months, p.tags, p.video_link, p.note_internal, p.notes_client,
p.lifecycle_id, l.name_en as lifecycle_en, l.name_zh as lifecycle_zh,
p.created, p.updated, p.version
from t_product p
left outer join t_category     c on c.id = p.category_id
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id
left outer join t_family       f on f.id = p.family_id
left outer join t_product_type t on t.id = p.product_type_id
left outer join t_lifecycle    l on l.id = p.lifecycle_id
left outer join t_brand        b on b.id = p.oem_brand_id
left outer join t_packaging_factor pf on pf.id = p.packaging_factor_id;

 