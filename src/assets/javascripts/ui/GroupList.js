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
    <b-alert v-if="!busy && error" variant="danger">{{ error }}</b-alert>
    <b-alert v-if="!busy && message" variant="info">{{ message }}</b-alert>
    <b-table hover 
      :items="groups" 
      :fields="fields"
      :busy.sync="busy"
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
      @input="getGroups"></b-pagination>
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
      currentPage: 1,
      selected : null,
      search_term: null
    }
  },
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error ? true: false;},
    hasMessage: function(){ return this.message ? true: false;}
  },
  created: function(){
    this.$router.app.selectedMenu="group";
    this.getGroups();
  },
  errorCaptured: function(err, component, info){
    console.error('GroupList Error'); 
    console.error(err);
    this.error = err.message;
    return false;
  },
  methods: {
    search: function(){
      this.currentPage = 1;
      this.getGroups();
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

        let apiresp = await Vue.mtapi.getGroups(query);
        this.groups = apiresp.groups; 
        this.total = apiresp.total;

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
    
  }
};