'use strict'
import { ApiError } from "../../Api.js";

export default {
  template:/* html */
  `
<b-form-group label="Family:" label-for="fsearch" label-cols="4" >
  <b-form-input id="fsearch" list="fsearchlist" v-model="family_id" debounce="500" :disabled="!families || families.length ===0 || busy"></b-form-input>
  <b-form-datalist id="fsearchlist" :options="families" value-field="id" text-field="name_en" ></b-form-datalist>
</b-form-group>
  `,
  data (){
    return {
      message: null,
      error: null,
      busy: false,
      families: []
    }
  },
  props: {
    family_id: String
  },
  computed: {},
  created: function(){
    this.getFamilies();
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