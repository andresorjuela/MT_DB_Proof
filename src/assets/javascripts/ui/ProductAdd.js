'use strict'
import { ApiError } from "../Api.js";
export default {
  template: /*html*/
  `
<div class="mt-1" v-cloak>
  
  <b-row no-gutters class="bg-light" align-v="center">
    <b-col>
      <b-spinner small variant="secondary" v-if="busy"/>
      <span class="p2 text-info" v-if="hasMessage" variant="info">{{ message }}</span>
      <span class="p2 text-danger" v-if="!busy && hasError" variant="danger">{{ error }}</span>
    </b-col>
  </b-row>

  <b-form>
    <b-form-row>
      <b-col>
        <h3>Adding a new product.</h3>
        <p>To add a new product you must first select a Category.</p>
      </b-col>
    </b-form-row>
    <b-form-row>
      <b-col>
        <b-form-group label="Category:"  label-cols="4" class="pb-1"  >
          <b-form-select v-model="product.category_id" :options="$router.app.categories" value-field="id" text-field="name_en" ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col>
        <b-button variant="success" @click="selectProductCategory">Continue</b-button>
      </b-col>
    </b-form-row>
  </b-form>

</div>
  `,
  data (){
    return {
      message: null,
      error: null,
      in_process: 0,
      product: null,
    }
  },
  //props: {},
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error?true:false; },
    hasMessage: function(){ return this.message?true:false; }
  },
  created: async function(){
    this.$router.app.selectedMenu="product";
    this.product = {
      category_id: 0
    };
  },
  methods: {
    selectProductCategory : async function(){
      this.in_process++;
      this.message="Saving..."
      try{
        this.product = await Vue.mtapi.saveProduct(this.product);
        this.$router.push({path: `/product/${this.product.id}`});
      }catch(ex){
        this.message = "Error initializing product.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    }
  }
};