import env from "../env.js";
import {Api} from "../Api.js";
import {storageAvailable} from "../Global.js";
import router from  "./ProductsAppRouter.js";

Vue.use(new Api(env().API_BASE_URL));

var app = new Vue({
  el: "#app",
  router: router,
  data:{
    busy: false,
    lang: window.navigator.language.substr(0,2),
    error: null,
    selectedMenu: null,
    brands: [],
    categories: [],
    certificates: [],
    lifecycles: [],
    product_types: [],
    suppliers: [],
    warranties: [],
  },
  created: function(){
    if(!storageAvailable("localStorage")){
      error = "This app uses browser local storage for better performance. Please enable local storage or use a different browser.";
      return;
    } else {
      this.brands = JSON.parse( window.localStorage.getItem('brands') );
      this.categories = JSON.parse( window.localStorage.getItem('categories') );
      this.certificates = JSON.parse( window.localStorage.getItem('certificates') );
      this.lifecycles = JSON.parse( window.localStorage.getItem('lifecycles') );
      this.product_types = JSON.parse( window.localStorage.getItem('product_types') );
      this.suppliers = JSON.parse( window.localStorage.getItem('suppliers') );
    }
    if(!this.brands ||
       !this.categories || 
       !this.certificates || 
       !this.lifecycles || 
       !this.product_types || 
       !this.suppliers ){
      this.reloadData();
    }
    
  },
  methods:{
    reloadData: async function(){
      try{
        this.busy = false;
        let pr = await Promise.all([
          Vue.mtapi.getBrands(),
          Vue.mtapi.getCategories(),
          Vue.mtapi.getCertificates(),
          Vue.mtapi.getLifecycles(),
          Vue.mtapi.getProductTypes(),
          Vue.mtapi.getSuppliers()
        ]);
        this.brands = pr[0]
        this.categories = pr[1];
        this.certificates = pr[2];
        this.lifecycles = pr[3];
        this.product_types = pr[4];
        this.suppliers = pr[5];

        window.localStorage.setItem('brands', JSON.stringify(this.brands));
        window.localStorage.setItem('categories', JSON.stringify(this.categories));
        window.localStorage.setItem('certificates', JSON.stringify(this.certificates));
        window.localStorage.setItem('lifecycles', JSON.stringify(this.lifecycles));
        window.localStorage.setItem('product_types', JSON.stringify(this.product_types));
        window.localStorage.setItem('suppliers', JSON.stringify(this.suppliers));

      }catch(err){
        console.error(err);
      } finally {
        this.busy = false;
      }
    }
  }
}).$mount('#app');