import env from "../env.js";
import {Api} from "../Api.js";
import {Storage} from "../Storage.js"; 
import router from  "./BrowseAppRouter.js";

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
    equipment_types: [],
    families: [],
    groups: [],
    image_types: [],
    lifecycles: [],
    product_types: [],
    suppliers: [],
    technologies: [],
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
    this.equipment_types = Vue.storage.getEquipmentTypes();
    this.families = Vue.storage.getFamilies();
    this.groups = Vue.storage.getGroups();
    this.image_types = Vue.storage.getImageTypes();
    this.lifecycles = Vue.storage.getLifecycles();
    this.product_types = Vue.storage.getProductTypes()
    this.suppliers = Vue.storage.getSuppliers();
    this.technologies = Vue.storage.getTechnologies();

    if(this.brands.length===0 ||
       this.categories.length===0 || 
       this.certificates.length===0 || 
       this.equipment_types.length===0 || 
       this.families.length===0 || 
       this.groups.length===0 || 
       this.image_types.length===0 || 
       this.lifecycles.length===0 || 
       this.product_types.length===0 || 
       this.suppliers.length===0 ||
       this.technologies.length===0 ){

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
    loadEquipmentTypes: async function(){
      this.in_process++;
      try{
        this.equipment_types = await Vue.mtapi.getEquipmentTypes();
        if(this.equipment_types){
          Vue.storage.setEquipmentTypes(this.equipment_types);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading equipment types.";
      } finally{
        this.in_process--;
      }
    },
    loadFamilies: async function(){
      this.in_process++;
      try{
        let apiresp = await Vue.mtapi.getFamilies();
        this.families = apiresp.family_views;
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
    loadGroups: async function(){
      this.in_process++;
      try{
        this.groups = await Vue.mtapi.getGroups();
        if(this.groups){
          Vue.storage.setGroups(this.groups);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading groups.";
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
    loadTechnologies: async function(){
      this.in_process++;
      try{
        this.technologies = await Vue.mtapi.getTechnologies();
        if(this.technologies){
          Vue.storage.setTechnologies(this.technologies);
        }
      }catch(ex){
        console.error(ex);
        this.error = "Error loading technologies.";
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
          this.loadEquipmentTypes(),
          this.loadFamilies(),
          this.loadGroups(),
          this.loadImageTypes(),
          this.loadLifecycles(),
          this.loadProductTypes(),
          this.loadSuppliers(),
          this.loadTechnologies()
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
    },
    
  },
  // components:{
  //   TreeSelector
  // }
}).$mount('#app');
