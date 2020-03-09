'use strict'
import { ApiError } from "../Api.js";

export default {
  template: /* html */`
<div>
  <b-alert v-if="!busy && hasError" variant="danger">{{ error }}</b-alert>
  <b-alert v-if="!busy && hasMessage" variant="info">{{ message }}</b-alert>
  <b-table hover :items="products" :fields="fields" selectable @row-selected="onRowSelected" ></b-table>
  <b-spinner v-if="busy" variant="secondary" />
  <b-pagination-nav v-if="!busy" :pages="pages" use-router></b-pagination-nav>
</div>
  `,
  data (){
    return {
      message: null,
      error: null,
      in_process: 0,
      products: [],
      limit: 10,
      total: 0,
      fields: [
        {key: "oem", sortable: true},
        {key: "sku", sortable: true},
        {key: "name_en", label: "Name", sortable: true}
      ],
      pages: [],
      selected : null
    }
  },
  props: {
    page: {
      type: Number,
      required: true,
      default: 1
    }
  },
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error ? true: false;},
    hasMessage: function(){ return this.message ? true: false;}
  },
  created: async function(){
    await this.getProducts();
    this.$router.app.selectedMenu="product";
  },
  errorCaptured: function(err, component, info){
    console.error('ProductList Error'); 
    console.error(err);
    this.error = err.message;
    return false;
  },
  watch: {
    page: async function(oldp,newp){
      await this.getProducts();
    },
  },
  methods: {
    getProductCount : async function(){
      this.in_process ++;
      try{
        this.total = await Vue.mtapi.getProductCount();
      } finally {
        this.in_process --;
      }
    },
    getProducts : async function(){
      this.in_process ++;
      try{
        await this.getProductCount();
    
        this.products = await Vue.mtapi.getProducts({
          offset: (this.page-1)*this.limit,
          limit: this.limit,
          order_by: '+sku'
        });
      
        this.recalculatePages();

      } finally {
        this.in_process --;
      }
    },
    onRowSelected(items) {
      let selected = items[0];
      this.$router.push({ path: `/product/${selected.id}` });
    },
    recalculatePages(){
      let total_pages = Math.ceil(this.total/this.limit); 
      this.pages = [];
      for(let page = 1; page <= total_pages; page++){
        this.pages.push({
          link: { query: { 
            page: page,
            limit: this.limit
          }},
          text: page
        })
      }
    }
    
  }
};