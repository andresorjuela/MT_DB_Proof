### t_category

Two fields support a DSL (domain-specific-language).

Consider the category `Reusable SpO2 Sensors`:

#### column: product_name_formula
The syntax: 

```
t_family.brand_id + t_category.name + t_product.oem
```

#### column: product_name_description
The syntax: 

```
if t_product.product_type_id=2 : t_product_type.name + t_technology.name + (loop: t_filter.name + t_filter_option.option)
else: t_product_type.name
```

Conditionally assigns a description when product type = 2. Otherwise the description is just equal to the product type name.