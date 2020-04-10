'use strict'
import { ApiError } from "../Api.js";

export default {
  template: /* html */`
<div>
  <b-row>
    <b-col>
      <b-input-group >
        <b-input type="text" placeholder="search" v-model="search_term" />
        <b-input-group-append>
          <b-button variant="outline-primary" @click="getEquipmentList">Search</b-button>
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
    <b-alert v-if="!busy && error" variant="danger">{{ error }}</b-alert>
    <b-alert v-if="!busy && message" variant="info">{{ message }}</b-alert>
    <b-table hover :items="equipment" :fields="fields" selectable @row-selected="onRowSelected" ></b-table>
    <b-spinner v-if="busy" variant="secondary" />
  </b-col>
  </b-row>
  <b-row>
    <b-col class="text-center">
      <b-pagination-nav v-if="!busy" :pages="pages" use-router></b-pagination-nav>
    </b-col>
  </b-row>
</div>`,
  data (){
    return {
      message: null,
      error: null,
      in_process: 0,
      limit: 10,
      total: 0,
      equipment: [],
      fields: [
        {key: "model", label: "Model", sortable: true},
        {key: "brand_en", label: "Brand", sortable: true},
        {key: "brand_zh", label: "Brand (Chinese)", sortable: true},
        {key: "type_en", label: "Type", sortable: true},
        {key: "type_zh", label: "Type (Chinese)", sortable: true}
      ],
      pages:[],
      selected : null,
      search_term: null
    }
  },
  props: {
    page: {
      type: Number,
      required: true,
      default: 1
    },
    search: String
  },
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error ? true: false;},
    hasMessage: function(){ return this.message ? true: false;}
  },
  created: function(){
    this.$router.app.selectedMenu="equipment";
    if(this.search) {
      this.search_term = this.search;
    }
    this.getEquipmentList(); 
  },
  errorCaptured: function(err, component, info){
    console.error('EquipmentList Error'); 
    console.error(err);
    this.error = err.message;
    return false;
  },
  watch: {
    page: async function(oldp,newp){
      await this.getEquipmentList();
    },
  },
  methods: {
    getEquipmentCount : async function(q){
      this.in_process ++;
      try{
        this.total = await Vue.mtapi.getEquipmentCount(q);
      } finally {
        this.in_process --;
      }
    },
    getEquipmentList : async function(){
      this.in_process++;
      try{
        this.error, this.message = null;
        let query = {
          offset: this.page && this.page > 0 ? (this.page-1)*this.limit : 0,
          limit: this.limit,
          order_by: '+model'
        };
        if(this.search_term){
          query.search_term = this.search_term;
        }
        await this.getEquipmentCount(query);
        this.equipment = await Vue.mtapi.getEquipmentList(query);

        this.recalculatePages();

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get equipment. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process --;
      }
    },
    onRowSelected(items) {
      let selected = items[0];
      this.$router.push({ path: `/equipment/${selected.id}` });
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