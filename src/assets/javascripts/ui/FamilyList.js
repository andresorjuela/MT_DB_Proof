'use strict'
import { ApiError } from "../Api.js";

export default {
  template:
  `
<div>
  <b-alert v-if="!busy && error" variant="danger">{{ error }}</b-alert>
  <b-alert v-if="!busy && message" variant="info">{{ message }}</b-alert>
  <b-table hover :items="families" :fields="fields"></b-table>
  <b-spinner v-if="busy" variant="secondary" />
</div>
  `,
  data (){
    return {
      message: null,
      error: null,
      busy: false,
      families: [],
      fields: [
        {key: "family_code", label: "Family Code", sortable: true},
        {key: "brand_id", label: "Brand ID", sortable: true},
        {key: "family_connector_code", label: "Connector Code", sortable: true}
      ]
    }
  },
  //props: {},
  computed: {},
  created: function(){
    this.getFamilies();
    this.$router.app.selectedMenu="family";
  },
  methods: {
    getFamilies : async function(){
      try{
        this.error = null;
        this.message = null;
        this.busy = true;
        this.families = await Vue.mtapi.getFamilies();
      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get families. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.busy = false;
      }
    }
    
  }
};