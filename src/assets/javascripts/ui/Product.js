'use strict'
import { ApiError } from "../Api.js";

export default {
  template:
  `
<div>
  <b-alert v-if="!busy && error" variant="danger">{{ error }}</b-alert>
  <b-alert v-if="!busy && message" variant="info">{{ message }}</b-alert>
  <b-table hover :items="products" :fields="fields"></b-table>
  <b-spinner v-if="busy" variant="secondary" />
</div>
  `,
  data (){
    return {
      message: null,
      error: null,
      busy: false,
      products: [],
      fields: [
        {key: "oem", sortable: true},
        {key: "sku", sortable: true},
        {key: "name_en", label: "Name", sortable: true}
      ]
    }
  },
  //props: {},
  computed: {},
  created: function(){
    this.getProducts();
    console.log(this.$router);
    this.$router.app.selectedMenu="product";
  },
  methods: {
    getProducts : async function(){
      try{
        this.error = null;
        this.message = null;
        this.busy = true;
        this.products = await Vue.mtapi.getProducts();
      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get products. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.busy = false;
      }
    }
    
  }
};