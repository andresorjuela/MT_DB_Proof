/*
  This delta script adds the `option_us` column to the t_filter_option table.
  The purpose of this is primarily:
    1. To create a product title
    2. To transfer filter option information to any US based website
  It will mainly be used to store feet/inches in cases where this is needed. 

  Created 9/11/2020
  Author: Derek Gau
*/
 
alter table t_filter_option add column `option_us` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL;

drop view v_filter_option;

create view v_filter_option as 
select f.category_id, f.id as filter_id, f.name_en as filter_en, f.name_zh as filter_zh, 
o.id as filter_option_id, o.option_en, o.option_zh, o.option_us
from t_filter f 
join t_filter_option o on o.filter_id = f.id
order by filter_id asc, filter_option_id asc;

drop view v_product_filter_option;

create view v_product_filter_option
as select pfo.id, pfo.product_id, 
f.id as filter_id, f.name_en as filter_en, f.name_zh as filter_zh,
fo.id as filter_option_id, fo.option_en, fo.option_zh, fo.option_us,
pfo.priority_order, pfo.created, pfo.updated, pfo.version
from t_product_filter_option pfo
left outer join t_filter_option fo on fo.id = pfo.filter_option_id
left outer join t_filter f on f.id = fo.filter_id
order by pfo.product_id asc, fo.filter_id asc;