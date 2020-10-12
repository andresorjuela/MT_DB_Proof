/*
  This delta script create a view for product oem references 
  so the is_oem field can be made more conveniently accessible.

  Created 9/8/2020
  Author: Derek Gau
*/
 
create view v_product_oem_reference as
select por.*, b.is_oem
from t_product_oem_reference por
left outer join t_brand b on b.id = por.brand_id; 