import env from "../env.js";
import {Api} from "../Api.js";
import router from  "./ProductsAppRouter.js";

Vue.use(new Api(env().API_BASE_URL));

var app = new Vue({
  el: "#app",
  router: router,
  data:{
    busy: false,
    selectedMenu: null
  }
}).$mount('#app');