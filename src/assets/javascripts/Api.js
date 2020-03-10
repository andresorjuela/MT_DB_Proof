/**
 * API class for calling Medten site APIs.
 */
export class Api{
  constructor(base_url){
    if(!base_url){
      throw new ApiError(`A base url is required.`);
    }
    this.base_url = base_url;
  }
  async getBrands(){
    let result = await this._get(`${this.base_url}/brands`, {limit:1000, order_by:'+name_en'});
    return result.brands;
  }
  async getCategories(){
    let result = await this._get(`${this.base_url}/categories`, {limit:1000, order_by:'+name_en'});
    return result.categories;
  }
  async getCertificates(){
    let result = await this._get(`${this.base_url}/certificates`, {limit:1000, order_by:'+name_en'});
    return result.certificates;
  }
  async getCustomAttributesForCategory(category_id){
    let query = {category_id: category_id, limit:1000, order_by:'+category_id,+name_en'};
    let result = await this._get(`${this.base_url}/custom_attributes`, query);
    return result.custom_attributes;
  }
  async getEquipmentList(qopts){
    if(!qopts) qopts = {limit:100, order_by:'+model'};
    let result = await this._get(`${this.base_url}/equipment`, qopts);
    return result.equipment_views;
  }
  async getEquipment(id){
    let result =  await this._get(`${this.base_url}/equipment/${id}`);
    return result;
  }
  async getEquipmentCount(qopts){
    return await this._get(`${this.base_url}/equipment/count`, qopts);
  }
  async getEquipmentGroups(qopts){
    if(!qopts) qopts={limit: 100, order_by: "+model,+group_code"};
    let result =  await this._get(`${this.base_url}/equipment_groups`, qopts);
    return result.equipment_group_views;
  }
  async getEquipmentTypes(qopts){
    if(!qopts) qopts = {limit:100, order_by:'+name_en'};
    let result = await this._get(`${this.base_url}/equipment_types`, qopts);
    return result.equipment_types;
  }
  async getFamilies(qopts){
    if(!qopts) qopts = {limit:10, order_by:'+family_code'};
    let result = await this._get(`${this.base_url}/families`, qopts);
    return result.family_views;
  }
  async getFamiliesForBrand(brand_id){
    let query = {brand_id: brand_id, limit:100, order_by:'+family_code'};
    let result = await this._get(`${this.base_url}/families`, query);
    return result.family_views;
  }
  async getFamily(id){
    let result =  await this._get(`${this.base_url}/families/${id}`);
    return result;
  }
  async getFamilyCount(qopts){
    return await this._get(`${this.base_url}/families/count`, qopts);
  }
  async getGroup(id){
    let result =  await this._get(`${this.base_url}/groups/${id}`);
    return result;
  }
  async getGroupCount(qopts){
    return await this._get(`${this.base_url}/groups/count`, qopts);
  }
  async getGroups(qopts){
    if(!qopts) qopts={limit: 100, order_by: "+group_code"};
    let result =  await this._get(`${this.base_url}/groups`, qopts);
    return result.groups
  }
  async getGroupEquipment(group_id, qopts){
    if(!qopts) qopts={limit: 100, order_by: "+group_id,+model"};
    let result =  await this._get(`${this.base_url}/groups/${group_id}/equipment`, qopts);
    return result.equipment_group_views;
  }
  async getFilterOptionViewsForCategory(category_id){
    let query = {category_id: category_id, limit:1000, order_by:'+category_id,+filter_id'};
    let result = await this._get(`${this.base_url}/filter_option_views`, query);
    return result.filter_option_views;
  }
  async getImageTypes(){
    let result = await this._get(`${this.base_url}/image_types`, {limit:1000, order_by:'+name'});
    return result.image_types;
  }
  async getLifecycles(){
    let result = await this._get(`${this.base_url}/lifecycles`, {limit:1000, order_by:'+name_en'});
    return result.lifecycles;
  }
  async getProducts(qopts){
    if(!qopts) qopts = {limit:10, order_by:'+name_en'};
    let result = await this._get(`${this.base_url}/products`, qopts);
    return result.product_views;
  }
  async getProduct(id){
    let result =  await this._get(`${this.base_url}/products/${id}`);
    return result;
  }
  async getProductCount(){
    let result =  await this._get(`${this.base_url}/products/count`);
    return result;
  }
  async getProductCertificates(id){
    let result =  await this._get(`${this.base_url}/products/${id}/certificates`);
    return result.product_certificates;
  }

  async saveEquipment(equipment){
    if(equipment.id){
      return await this._put(`${this.base_url}/equipment/${equipment.id}`, equipment);
    } else {
      return await this._post(`${this.base_url}/equipment`, equipment);
    }
  }
  async saveGroup(group){
    if(group.id){
      return await this._put(`${this.base_url}/groups/${group.id}`, group);
    } else {
      return await this._post(`${this.base_url}/groups`, group);
    }
  }
  async saveGroupEquipment(group_id, equipment_ids){
    let payload = equipment_ids.map(eqid=>{ 
      return {
        group_id: product_id,
        equipment_id: eqid
      };
    });
    return await this._post(`${this.base_url}/groups/${group_id}/equipment`, payload);
  }

  async saveFamily(family){
    if(family.id){
      return await this._put(`${this.base_url}/families/${family.id}`,family);
    } else {
      return await this._post(`${this.base_url}/families`,family);
    }
  }
  /**
   * 
   * @param {number} product_id 
   * @param {array} certificate_ids array of certificate ids
   */
  async saveProductCertificates(product_id, certificate_ids){
    let payload = certificate_ids.map(cid=>{ 
      return {
        product_id: product_id,
        certificate_id: cid
      };
    });
    return await this._post(`${this.base_url}/products/${product_id}/certificates`, payload);
  }

  async getProductCustomAttributes(id){
    let result =  await this._get(`${this.base_url}/products/${id}/custom_attributes`);
    return result.product_custom_attributes;
  }
/**
   * 
   * @param {number} product_id 
   * @param {array} cust_attr array of custom attribute objects
   */
  async saveProductCustomAttributes(product_id, cust_attr){
    return await this._post(`${this.base_url}/products/${product_id}/custom_attributes`, cust_attr);
  }

  /**
   * 
   * @param {number} id product id
   */
  async getProductFamilies(id){
    let result =  await this._get(`${this.base_url}/products/${id}/families`);
    return result.product_family_connects;
  }
  /**
   * 
   * @param {number} product_id 
   * @param {array} family_ids array of family ids
   */
  async saveProductFamilies(product_id, family_ids){
    let payload = family_ids.map(fid=>{ 
      return {
        product_id: product_id,
        family_id: fid
      };
    });
    return await this._post(`${this.base_url}/products/${product_id}/families`, payload);
  }

  async getProductFilterOptions(id){
    let result =  await this._get(`${this.base_url}/products/${id}/filter_options`);
    return result.product_filter_option_views;//this api method returns a view object
  }
  /**
   * 
   * @param {number} product_id 
   * @param {array} filter_options array of filter option objects
   */
  async saveProductFilterOptions(product_id, filter_options){
    let with_ids = filter_options.filter(obj=>{return obj.filter_option_id ? true : false; });
    return await this._post(`${this.base_url}/products/${product_id}/filter_options`, with_ids);
  }

  async getProductImages(id){
    let result =  await this._get(`${this.base_url}/products/${id}/images`);
    return result.product_images;
  }
  /**
   * 
   * @param {number} product_id 
   * @param {array} images array of image objects
   */
  async saveProductImages(product_id, images){
    return await this._post(`${this.base_url}/products/${product_id}/images`, images);
  }

  async getProductOemReferences(id){
    let result =  await this._get(`${this.base_url}/products/${id}/oem_references`);
    return result.product_oem_references;
  }
  /**
   * 
   * @param {number} product_id 
   * @param {array} oem_refs array of oem ref objects
   */
  async saveProductOemReferences(product_id, oem_refs){
    return await this._post(`${this.base_url}/products/${product_id}/oem_references`, oem_refs);
  }

  async getProductTypes(){
    let result = await this._get(`${this.base_url}/product-types`, {limit:100, order_by:'+name_en'});
    return result.product_types;
  }
  async getProductView(id){
    let result =  await this._get(`${this.base_url}/products/view/${id}`);
    return result;
  }
  async getSuppliers(){
    let result = await this._get(`${this.base_url}/suppliers`, {limit:100, order_by:'+name_en'});
    return result.suppliers;
  }
  async getTechnologies(){
    let result = await this._get(`${this.base_url}/technologies`, {limit:100, order_by:'+name'});
    return result.technologies;
  }
  
  async saveProduct(product){
    if(product.id){
      return await this._put(`${this.base_url}/products/${product.id}`,product);
    } else {
      return await this._post(`${this.base_url}/products`,product);
    }
  }


  //common methods.
  async _get(url, parms){
    return await this.doFetch('GET', url, {parms: parms});
  }
  async _post(url, body){
    return await this.doFetch('POST', url, {body: body});
  }
  async _put(url, body){
    return await this.doFetch('PUT', url, {body: body});
  }
  async _delete(url, parms){
    return await this.doFetch('DELETE', url, {parms: parms});
  }
  async doFetch(method, url, payload){
    if(payload && payload.parms){
      if(payload.parms){
        let searchParams = new URLSearchParams();
        for(let key in payload.parms){ searchParams.append(key, payload.parms[key]); }
        let search = searchParams.toString();
        if(search) url += '?'+search;
      }
    }
    let data = {};
    try{
      let fetchOpts = {
        method: method,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      };
      if(method==='POST' || method ==='PUT' ){
        if(payload && payload.body){
          fetchOpts.body =  JSON.stringify(payload.body);
        }
      }
      let response = await fetch(url, fetchOpts);
      if( [401,403].indexOf(response.status) >= 0 ){
        throw new Error('Unauthorized.');
      } else if( [400,500].indexOf(response.status) >= 0 ){
        data = await response.json();
      } else if (response.ok){
        data = await response.json();
      }
      return data;
    }catch(ex){
      console.error(ex);
      console.error(`${method} ${url} error. ${ex.message}`);
      throw new ApiError(ex.message); 
    }
  }


  /**
   * Support usage as a Vue plugin. You can use the
   * "mtapi" global inside any Vue instance to make Medten API
   * calls.
   * @param {object} Vue vue instance
   * @param {*} opts (currently unused)
   */
  install(Vue, opts){
    Vue.mtapi = this;
  }

}
/**
 * API-related error.
 */
export class ApiError extends Error{};
 