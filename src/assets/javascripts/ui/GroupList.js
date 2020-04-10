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
          <b-button variant="outline-primary" @click="getGroups">Search</b-button>
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
    <b-table hover :items="groups" :fields="fields" selectable @row-selected="onRowSelected" ></b-table>
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
      groups: [],
      fields: [
        {key: "group_code", label: "Group Code", sortable: true},
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
    this.$router.app.selectedMenu="group";
    if(this.search){
      //If prop was set elsewhere use it for search term.
      this.search_term = this.search;
    }
    this.getGroups();
  },
  errorCaptured: function(err, component, info){
    console.error('GroupList Error'); 
    console.error(err);
    this.error = err.message;
    return false;
  },
  watch: {
    page: async function(oldp,newp){
      await this.getGroups();
    },
  },
  methods: {
    getGroupCount : async function(q){
      this.in_process ++;
      try{
        this.total = await Vue.mtapi.getGroupCount(q);
      } finally {
        this.in_process --;
      }
    },
    getGroups : async function(){
      this.in_process++;
      try{
        this.error, this.message = null;
        let query = {
          offset: this.page && this.page > 0 ? (this.page-1)*this.limit : 0,
          limit: this.limit,
          order_by: '+group_code'
        };
        if(this.search_term){
          query.search_term = this.search_term;
        }

        await this.getGroupCount(query);
        this.groups = await Vue.mtapi.getGroups(query);

        this.recalculatePages();

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get groups. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process --;
      }
    },
    onRowSelected(items) {
      let selected = items[0];
      this.$router.push({ path: `/group/${selected.id}` });
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