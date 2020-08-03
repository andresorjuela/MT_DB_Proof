/*
  Delta script that adds/modifies the columns on the t_product table
  to support international pricing, weights, name audit tracking, and
  some internal notes fields.

  Created 8/3/2020
  Author: Derek Gau
*/

-- drop affected views
drop view v_product_filter_option;

drop view v_product_image;

-- column changes
alter table `t_product_filter_option`
  add column `priority_order` smallint DEFAULT 0;

alter table `t_product_image`
  add column `priority_order` smallint DEFAULT 0;

-- replace affected views
create view v_product_filter_option
as select pfo.id, pfo.product_id, 
f.id as filter_id, f.name_en as filter_en, f.name_zh as filter_zh,
fo.id as filter_option_id, fo.option_en, fo.option_zh,
pfo.priority_order, pfo.created, pfo.updated, pfo.version
from t_product_filter_option pfo
left outer join t_filter_option fo on fo.id = pfo.filter_option_id
left outer join t_filter f on f.id = fo.filter_id
order by pfo.product_id asc, fo.filter_id asc;

create view v_product_image as select pi.id, pi.product_id, pi.image_type_id,
it.name as image_type, 
pi.priority_order, pi.image_link, pi.created, pi.updated, pi.version 
from t_product_image pi 
left outer join t_image_type it on it.id = pi.image_type_id;
 