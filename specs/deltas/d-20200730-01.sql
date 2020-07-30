/*
  Delta script that removes the valid_image_types column from the category table.
  Created 7/30/2020.
  Author: Derek Gau
*/

-- drop affected views
drop view v_product;
drop view v_category;

-- column removal
alter table `t_category` drop column `valid_image_types`;

-- replace affected views
create view v_product as select 
p.id, p.sku, p.oem, p.name_en, p.description_en, p.name_zh, p.description_zh, 
p.product_type_id, t.name_en as product_type_en, t.name_zh as product_type_zh, 
p.family_id, f.family_code, f.family_connector_code,
p.oem_brand_id, b.name_en as oem_brand_en, b.name_zh as oem_brand_zh,
p.category_id, c.name_en as category_en, c.name_zh as category_zh,
nf.content as product_name_formula, 
df.content as product_description_formula, 
pf.value as packaging_factor, p.packaging_factor_id, p.price,
p.supplier_id, u.name_en as supplier_en, u.name_zh as supplier_zh,
p.weight, p.warranty_duration_months, p.tags,
p.lifecycle_id, l.name_en as lifecycle_en, l.name_zh as lifecycle_zh,
p.created, p.updated, p.version
from t_product p
left outer join t_category     c on c.id = p.category_id
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id
left outer join t_family       f on f.id = p.family_id
left outer join t_product_type t on t.id = p.product_type_id
left outer join t_supplier     u on u.id = p.supplier_id
left outer join t_lifecycle    l on l.id = p.lifecycle_id
left outer join t_brand        b on b.id = p.oem_brand_id
left outer join t_packaging_factor pf on pf.id = p.packaging_factor_id;

create view v_category as select 
c.id, c.name_en, c.name_zh, c.parent_id, nf.content as product_name_formula, df.content as product_description_formula,
c.created, c.updated, c.version
from t_category c 
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id;

