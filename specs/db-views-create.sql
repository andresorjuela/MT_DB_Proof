
-- main product view
create view v_product as select 
p.id, p.sku, p.oem, p.name_en, p.description_en, p.name_zh, p.description_zh, 
p.product_type_id, t.name_en as product_type_en, t.name_zh as product_type_zh, 
p.family_id, f.family_code, f.family_connector_code, f.name_en as family_name_en, f.video_link as family_video_link,
p.oem_brand_id, b.name_en as oem_brand_en, b.name_zh as oem_brand_zh,
p.category_id, c.name_en as category_en, c.name_zh as category_zh,
nf.content as product_name_formula, 
df.content as product_description_formula, 
pf.name as packaging_factor, p.packaging_factor_id, p.price_us, p.price_zh, p.price_eu,
p.weight_kg, p.weight_lbs, p.warranty_duration_months, p.tags, p.video_link, p.note_internal, p.note_client,
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

-- filters and filter options
create view v_filter_option as 
select f.category_id, f.id as filter_id, f.name_en as filter_en, f.name_zh as filter_zh, 
o.id as filter_option_id, o.option_en, o.option_zh
from t_filter f 
join t_filter_option o on o.filter_id = f.id
order by filter_id asc, filter_option_id asc;

-- filter_id is needed to render the dynamic elements properly.
create view v_product_filter_option
as select pfo.id, pfo.product_id, 
f.id as filter_id, f.name_en as filter_en, f.name_zh as filter_zh,
fo.id as filter_option_id, fo.option_en, fo.option_zh,
pfo.priority_order, pfo.created, pfo.updated, pfo.version
from t_product_filter_option pfo
left outer join t_filter_option fo on fo.id = pfo.filter_option_id
left outer join t_filter f on f.id = fo.filter_id
order by pfo.product_id asc, fo.filter_id asc;

-- family with brand, group info
create view v_family as select f.`id`, f.`name_en`, f.`family_code`, f.`family_connector_code`, 
f.`group_id`, g.`group_code`,
f.`image_link_connector_distal`, f.`video_link`, f.`created`, f.`updated`
from t_family f
left outer join t_group g on g.id=f.group_id;

-- equipment view, includes brand info.
create view v_equipment as select e.id, e.model, 
e.equipment_type_id, t.name_en as type_en, t.name_zh as type_zh,
e.brand_id, b.name_en as brand_en, b.name_zh as brand_zh, b.is_oem,
e.created, e.updated
from t_equipment e  
left outer join t_equipment_type t on t.id = e.equipment_type_id 
left outer join t_brand b on b.id = e.brand_id;

-- equipment group view
create view v_equipment_group as select j.id, j.equipment_id,
e.model,
j.group_id, g.group_code,
j.created, j.updated
from t_equipment_group j
left outer join t_equipment e on e.id = j.equipment_id 
left outer join t_group g on g.id = j.group_id;

-- product custom attribute view
create view v_product_custom_attribute as
select pca.id, pca.product_id, 
pca.custom_attribute_id, ca.name_en as custom_attribute_en, ca.name_zh as custom_attribute_zh,
pca.value_en as value_en, pca.value_zh as value_zh, pca.created, pca.updated, pca.version
from t_product_custom_attribute pca
left outer join t_custom_attribute ca on ca.id = pca.custom_attribute_id;

-- product iamge view
create view v_product_image as select pi.id, pi.product_id, pi.image_type_id,
it.name as image_type, 
pi.priority_order, pi.image_link, pi.created, pi.updated, pi.version 
from t_product_image pi 
left outer join t_image_type it on it.id = pi.image_type_id;

-- product set view
create view v_product_set as select s.id, s.parent_product_id, pp.sku as parent_sku, 
s.child_product_id, p.sku as child_sku,
s.quantity, s.created, s.updated, s.version
from t_product_set s
left outer join t_product pp on pp.id=s.parent_product_id
left outer join t_product p on p.id=s.child_product_id;

-- product equipment connect view (depends on equipment view)
create view v_product_equipment_connect as select pe.*, e.model, e.brand_en, e.brand_zh
from t_product_equipment_connect pe 
join v_equipment e on e.id = pe.equipment_id;

-- category view (to pick up formulas)
create view v_category as select 
c.id, c.name_en, c.name_zh, c.parent_id, nf.content as product_name_formula, df.content as product_description_formula, ff.content as family_name_formula,
c.created, c.updated, c.version
from t_category c 
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id
left outer join t_formula      ff on ff.id = c.family_name_formula_id;

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