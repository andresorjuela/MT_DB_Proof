'use strict'

export default {
  template: /* html */`
<div>
  <b-row>
    <b-col>
      <b-input-group >
        <b-input type="text" placeholder="search" v-model="search_term" />
        <b-input-group-append>
          <b-button variant="outline-primary" @click="search">Search</b-button>
        </b-input-group-append>
      </b-input-group>
      </b-form>
    </b-col>
  </b-row>
  <b-row>
    <b-col>
      <b-alert v-if="!busy && hasError" variant="danger">{{ error }}</b-alert>
      <b-alert v-if="!busy && hasMessage" variant="info">{{ message }}</b-alert>
    </b-col>
  </b-row>
  <b-row>
    <b-col>
      <b-table id="search-table" hover 
        :items="products" 
        :fields="fields"
        :busy.sync="busy"
        empty-text="No products found."
        show-empty
        selectable
        @row-selected="onRowSelected" >
        <template v-slot:table-busy>
          <b-row class="d-flex justify-content-center"><b-spinner variant="secondary" center /></b-row>
        </template>
      </b-table>
    </b-col>
  </b-row>
  <b-row>
    <b-col class="text-center">
      <b-pagination v-model="currentPage" 
        :total-rows="total"
        :per-page="limit" 
        aria-controls="search-table" 
        @input="getProducts"></b-pagination>
    </b-col>
  </b-row>
  
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
        {key: "id"},
        {key: "oem"},
        {key: "sku"},
        {key: "name_en", label: "Name"},
        {key: "category_en", label: "Category"},
        {key: "category_zh", label: "Category (Chinese)"},
      ],
      currentPage: 1,
      selected : null,
      search_term: ''
    }
  },
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error ? true: false;},
    hasMessage: function(){ return this.message ? true: false;}
  },
  created: async function(){
    this.$router.app.selectedMenu="product";
    await this.getProducts();
  },
  errorCaptured: function(err, component, info){
    console.error('ProductList Error'); 
    console.error(err);
    this.error = err.message;
    return false;
  },
  methods: {
    search: async function(){
      this.currentPage = 1;
      this.getProducts();
    },
    getProducts : async function(){
      this.in_process ++;
      try{
        let query = {
          offset: this.currentPage && this.currentPage > 0? (this.currentPage-1)*this.limit : 0,
          limit: this.limit,
          order_by: '+sku'
        };
        if(this.search_term){
          query.search_term = this.search_term;
        }
        let apiresp = await Vue.mtapi.getProducts(query);
        this.products = apiresp.product_views;
        this.total = apiresp.total;

      } finally {
        this.in_process --;
      }
    },
    onRowSelected(items) {
      let selected = items[0];
      this.$router.push({ path: `/product/${selected.id}` });
    },
    
  }
};