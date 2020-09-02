/*
  This delta script provides fixes an issue where v_category was missing the family_name_formula.

  Created 9/2/2020
  Author: Derek Gau
*/

drop view v_category;

-- category view (to pick up formulas)
create view v_category as select 
c.id, c.name_en, c.name_zh, c.parent_id, nf.content as product_name_formula, df.content as product_description_formula, ff.content as family_name_formula,
c.created, c.updated, c.version
from t_category c 
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id
left outer join t_formula      ff on ff.id = c.family_name_formula_id;
