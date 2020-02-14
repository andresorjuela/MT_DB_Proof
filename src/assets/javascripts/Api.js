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
  async getCategories(){
    let result = await this._get(`${this.base_url}/categories`, {limit:1000, order_by:'+name_en'});
    return result.categories;
  }
  async getCertificates(){
    let result = await this._get(`${this.base_url}/certificates`, {limit:1000, order_by:'+name_en'});
    return result.certificates;
  }
  async getFamilies(){
    let result = await this._get(`${this.base_url}/families`, {limit:10, order_by:'+family_code'});
    return result.families;
  }
  async getFamily(id){
    let result =  await this._get(`${this.base_url}/families/${id}`);
    return result;
  }
  async getLifecycles(){
    let result = await this._get(`${this.base_url}/lifecycles`, {limit:1000, order_by:'+name_en'});
    return result.lifecycles;
  }
  async getProducts(){
    let result = await this._get(`${this.base_url}/products`, {limit:10, order_by:'+name_en'});
    return result.products;
  }
  async getProduct(id){
    let result =  await this._get(`${this.base_url}/products/${id}`);
    return result;
  }
  async getProductCertificates(id){
    let result =  await this._get(`${this.base_url}/products/${id}/certificates`);
    return result.product_certificates;
  }
  async getProductFamilies(id){
    let result =  await this._get(`${this.base_url}/products/${id}/families`);
    return result.product_family_connects;
  }
  async getProductTypes(){
    let result = await this._get(`${this.base_url}/product-types`, {limit:1000, order_by:'+name_en'});
    return result.product_types;
  }
  async getProductView(id){
    let result =  await this._get(`${this.base_url}/products/view/${id}`);
    return result;
  }
  async getSuppliers(){
    let result = await this._get(`${this.base_url}/suppliers`, {limit:10, order_by:'+name_en'});
    return result.suppliers;
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
 