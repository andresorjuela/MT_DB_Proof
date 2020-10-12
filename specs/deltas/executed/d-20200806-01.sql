/*
  Delta script that adds a formula reference from the family table to the formula table
  to support dynamic generation of the family name.

  Created 8/6/2020
  Author: Derek Gau
*/


-- modify table
ALTER TABLE t_category
  ADD COLUMN family_name_formula_id int unsigned default null;

ALTER TABLE t_category
  ADD CONSTRAINT `fk_family_name_formula` FOREIGN KEY (`family_name_formula_id`) REFERENCES `t_formula` (`id`);
