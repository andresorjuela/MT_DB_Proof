### t_category

Two fields support a DSL (domain-specific-language).

Consider the category `Reusable SpO2 Sensors`:

Formulas can be stored by category and expressed in javascript. Each formula can select values out of a "context" which contains default available fields if they are associated with the family. 

The default context includes the following data:
* `product` backed by the v_product view with the following fields:
  * id
  * sku
  * oem
  * warranty_duration_months
  * price
  * weight
  * packaging_factor
  * name_en
  * name_zh
  * description_en
  * description_zh
  * product_type_en
  * product_type_zh
  * family_code
  * family_connector_code
  * brand_id
  * brand_en
  * brand_zh
  * category_id
  * category_en
  * category_zh
  * supplier_id
  * supplier_en
  * supplier_zh
  * lifecycle_id
  * lifecycle_en
  * lifecycle_zh

* `filters` backed by the v_product_filter_options view, with the following fields:
  * id 
  * TODO 


#### column: product_name_formula
The syntax as originally written...

```
t_family.brand_id + ' ' + t_category.name + ' ' + t_product.oem
```

in javascript becomes...
```javascript
(c,lang)=>{
  if(lang=='en'){
    return `${c.product.brand_en} ${c.product.category_en} ${c.product.oem}`;
  } else if (lang=='zh'){
    return `${c.product.brand_zh} ${c.product.category_zh} ${c.product.oem}`;
  }
}

```
In the above arrow function, the arguments:
* `c` is a context object that gives the function access to things like `product` (and other future data elements if needed).
* `lang` is an optional modifier that provides the ability to support 'en' or 'zh' language indicators.

#### column: product_name_description
The syntax: 

```
if t_product.product_type_id=2 : t_product_type.name + t_technology.name + (loop: t_filter.name + t_filter_option.option)
else: t_product_type.name
```

Conditionally assigns a description when product type = 2. Otherwise the description is just equal to the product type name.