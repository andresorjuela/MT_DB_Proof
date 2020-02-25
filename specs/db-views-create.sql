
-- main product view
create view v_product as select 
p.id, p.sku, p.oem, p.name_en, p.description_en, p.name_zh, p.description_zh, 
p.product_type_id, t.name_en as product_type_en, t.name_zh as product_type_zh, 
p.family_id, f.family_code, f.family_connector_code,
b.id as brand_id, b.name_en as brand_en, b.name_zh as brand_zh,
p.category_id, c.name_en as category_en, c.name_zh as category_zh, c.product_name_formula, c.product_description_formula, c.valid_image_types,
p.packaging_factor, p.price,
p.supplier_id, u.name_en as supplier_en, u.name_zh as supplier_zh,
p.weight, p.warranty_duration_months, p.tags,
p.lifecycle_id, l.name_en as lifecycle_en, l.name_zh as lifecycle_zh,
p.created, p.updated, p.version
from t_product p
join t_product_type t on t.id = p.product_type_id
join t_category     c on c.id = p.category_id
join t_family       f on f.id = p.family_id
join t_supplier     u on u.id = p.supplier_id
join t_lifecycle    l on l.id = p.lifecycle_id
join t_brand        b on b.id = f.brand_id