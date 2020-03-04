import env from "../env.js";
import {Api} from "../Api.js";
import {Storage} from "../Storage.js"; 
import router from  "./ProductsAppRouter.js";
import FamilySearch from "./comp/FamilySearch.js";

Vue.use(new Api(env().API_BASE_URL));
Vue.use(new Storage());

var app = new Vue({
  el: "#app",
  router: router,
  data:{
    in_process: 0,
    lang: window.navigator.language.substr(0,2),
    error: null,
    message: null,
    selectedMenu: null,

    brands: [],
    categories: [],
    certificates: [],
    families: [],
    image_types: [],
    lifecycles: [],
    product_types: [],
    suppliers: [],
    warranties: [],

  },
  computed:{
    busy: function(){return this.in_process>0;},
    hasError: function(){return this.error?true:false;},
    hasMessage: function(){return this.message?true:false;},
  },
  created: async function(){
    this.brands = Vue.storage.getBrands();
    this.categories = Vue.storage.getCategories();
    this.certificates = Vue.storage.getCertificates();
    this.families = Vue.storage.getFamilies();
    this.image_types = Vue.storage.getImageTypes();
    this.lifecycles = Vue.storage.getLifecycles();
    this.product_types = Vue.storage.getProductTypes()
    this.suppliers = Vue.storage.getSuppliers();
    
    if(this.brands.length===0 ||
       this.categories.length===0 || 
       this.certificates.length===0 || 
       this.families.length===0 || 
       this.image_types.length===0 || 
       this.lifecycles.length===0 || 
       this.product_types.length===0 || 
       this.suppliers.length===0 ){
      await this.reloadData();
    }
    
  },
  methods:{
    loadBrands: async function(){
      this.in_process++;
      try{
        this.brands = await Vue.mtapi.getBrands();
        if(this.brands){
          Vue.storage.setBrands(this.brands);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading brands.";
      } finally{
        this.in_process--;
      }
    },
    loadCategories: async function(){
      this.in_process++;
      try{
        this.categories = await Vue.mtapi.getCategories();
        if(this.categories){
          Vue.storage.setCategories(this.categories);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading categories.";
      } finally{
        this.in_process--;
      }
    },
    loadCertificates: async function(){
      this.in_process++;
      try{
        this.certificates = await Vue.mtapi.getCertificates();
        if(this.certificates){
          Vue.storage.setCertificates(this.certificates);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading certificates.";
      } finally{
        this.in_process--;
      }
    },
    loadFamilies: async function(){
      this.in_process++;
      try{
        this.families = await Vue.mtapi.getFamilies();
        if(this.families){
          Vue.storage.setFamilies(this.families);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading families.";
      } finally{
        this.in_process--;
      }
    },
    loadImageTypes: async function(){
      this.in_process++;
      try{
        this.image_types = await Vue.mtapi.getImageTypes();
        if(this.image_types){
          Vue.storage.setImageTypes(this.image_types);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading image type.";
      } finally{
        this.in_process--;
      }
    },
    loadLifecycles: async function(){
      this.in_process++;
      try{
        this.lifecycles = await Vue.mtapi.getLifecycles();
        if(this.lifecycles){
          Vue.storage.setLifecycles(this.lifecycles);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading lifecycles.";
      } finally{
        this.in_process--;
      }
    },
    loadProductTypes: async function(){
      this.in_process++;
      try{
        this.product_types = await Vue.mtapi.getProductTypes();
        if(this.product_types){
          Vue.storage.setProductTypes(this.product_types);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading product types.";
      } finally{
        this.in_process--;
      }
    },
    loadSuppliers: async function(){
      this.in_process++;
      try{
        this.suppliers = await Vue.mtapi.getSuppliers();
        if(this.suppliers){
          Vue.storage.setSuppliers(this.suppliers);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading suppliers.";
      } finally{
        this.in_process--;
      }
    },
    reloadData: async function(){
      try{
        let pr = await Promise.all([
          this.loadBrands(),
          this.loadCategories(),
          this.loadCertificates(),
          this.loadFamilies(),
          this.loadImageTypes(),
          this.loadLifecycles(),
          this.loadProductTypes(),
          this.loadSuppliers()
        ]);
       
      }catch(err){
        console.error(err);
      }
    },
    topAncestorCategoryFor: function(category_id){
      let cat = this.categories.find((c)=>{ return c.id === category_id; });
      if(!cat) return null;
      //has a parent?
      if(cat.parent_id) return this.topAncestorCategoryFor(cat.parent_id);
      //else this is it.
      return cat;
    }
  }
}).$mount('#app');

Vue.component('mt-family-search', FamilySearch);