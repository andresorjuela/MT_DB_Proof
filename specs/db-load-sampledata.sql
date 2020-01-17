/**
  Table load script for the Medten Product database.

  Contains initial valid value data and some sample product and 
  equipment data for testing.

  Authors: Andres Orjuela, Derek Gau
*/

insert into t_brand (id, name_en, name_zh, parent_id) values 
(1, 'GE', '', null),
(2, 'Mindray', '', null),
(3, 'Philips', '', null),
(4, 'Marquette', '', 1);

insert into t_product_type (id, name_en) values
(1, 'OEM'),
(2, 'Replacement'),
(3, 'Refurbished'),
(4, 'As Is'),
(5, 'Repair Service'),
(6, 'Repair');

insert into t_category (id, name_en, inheritance, product_name_formula, product_description_formula, valid_image_types ) values 
(1,	'Parts', 0, '', '', ''),
(2,	'Accessories and Supplies', 0, '', '', ''),
(3,	'Repair Service', 0, '', '', ''),
(4,	'Fetal', 1, '', '', ''),
(5,	'Telemetry', 1, '', '', ''),
(6,	'Monitors/Modules', 1, '', '', ''),
(7,	'Infusion Pumps', 1, '', '', ''),
(8,	'Sp02', 2, '[OEM Part Number] + [Description]', '', '1, 2, 4, 7, 8'),
(9,	'ECG', 2, '', '', ''),
(10, 'EKG', 2, '', '', ''),
(11, 'NIBP', 2, '', '', ''),
(12, 'IBP', 2, '', '', ''),
(13, 'Temperature', 2, '', '', ''),
(14, 'Fetal', 2, '', '', ''),
(15, 'O2', 2, '', '', ''),
(16, 'EtCO2', 2, '', '', ''),
(17, 'MVP', 2, '', '', ''),
(18, 'Oxygen Sensors', 2, '', '', ''),
(19, 'Flow Sensors', 2, '', '', '');

insert into t_supplier (id, name_en) values
(1, 'Orantech');

insert into t_lifecycle (id, name_en) values
(1, 'Reusable'),
(2, 'Disposable');

insert into t_certificate (id, name_en) values
(1, 'CE'),
(2, 'FDA'),
(3, 'CFDA');

insert into t_image_type (id, name_en) values
(1, 'OEM'),
(2, 'Replacement full product'),
(3, 'Detail'),
(4, 'Package'),
(5, 'Top side'),
(6, 'Bottom side'),
(7, 'Connector Proximal (patient)');

insert into t_custom_attribute (id, name_en, category_id) values
(1, 'Turn around time', 3);