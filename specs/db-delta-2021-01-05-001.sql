alter table t_custom_attribute 
rename column value_en to name_en,
rename column value_zh to name_zh;

alter table t_product_custom_attribute
modify column product_id INT unsigned NOT NULL,
rename column name_en to value_en,
rename column name_zh to value_zh;

