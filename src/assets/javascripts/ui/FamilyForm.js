'use strict'

export default {
  template: /*html*/
  `
<div class="mt-1" v-cloak>
  
  <b-row no-gutters class="bg-light mb-2" align-v="center">
    <b-col class="pl-2" >
      <span v-cloak class="h5" v-if="family && family.id">Editing Family: {{family.family_code}}</span>
    </b-col>
    <b-col>
      <b-spinner small variant="secondary" v-if="busy"/>
      <span class="p2 text-info" v-if="hasMessage" variant="info">{{ message }}</span>
      <span class="p2 text-danger" v-if="!busy && hasError" variant="danger">{{ error }}</span>
    </b-col>
    <b-col class="text-right">
      <b-button small variant="success" @click="saveAllFamilyData" :disabled="busy">
        <b-icon-cloud-upload />&nbsp;Save
      </b-button>
    </b-col>
  </b-row>
  
  <b-form v-if="family">
    <b-form-row>
      <b-col cols="6">
        <b-form-group label="Family Code:" label-cols="4" >
          <b-form-input v-model="family.family_code" />
        </b-form-group>
      </b-col>
      <b-col cols="6">
        <b-form-group label="Category:" label-cols="4" label-align="right" >
          <b-form-input disabled v-model="family_product_category_zh" v-if="$router.app.lang==='zh'" ></b-form-input>
          <b-form-input disabled v-model="family_product_category_en" v-else ></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group label="Product SKUs in Family:" label-align="left" label-cols="2" >
          <b-form-tags disabled :value="product_skus" separator="," placeholder="" tag-variant="light" ></b-form-tags>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="6">
        <b-form-group label="Brand:" label-cols="4" >
          <tree-selector-input :list="$router.app.brands" v-model="family.brand_id" label="Brand" display_ancestors v-if="brand_tree"></tree-selector-input>
        </b-form-group>
      </b-col>
      <b-col cols="6">
        <b-form-group label="Technology:" label-cols="4" label-align="right" >
          <b-form-select v-model="family.technology_id" :options="$router.app.technologies" value-field="id" text-field="name_en" >
            <template v-slot:first>
              <b-form-select-option value="" >Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col >
        <b-form-group label="Family Connector Code:" label-cols="6" >
          <b-form-input v-model="family.family_connector_code" />
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group label="Equipment Group:" label-cols="6" >
          <b-form-select v-model="family.group_id" :options="$router.app.groups" value-field="id" text-field="group_code" >
            <template v-slot:first>
              <b-form-select-option value="" >Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>
    
    <b-form-row>
      <b-col cols="6" >
        <b-form-group label="Image link connector distal:" label-cols="4" >
          <b-form-input v-model="family.image_link_connector_distal" />
        </b-form-group>
      </b-col>
      <b-col>
        <b-img :src="family.image_link_connector_distal" width="120" height="80" right/>
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
     
      family: null,
      brand_tree: [],
      products: [],
    }
  },
  //props: {},
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error?true:false; },
    hasMessage: function(){ return this.message?true:false; },
    family_product_category_en: function(){
      if(!this.products || this.products.length===0) return null;
      return this.products[0].category_en;
    },
    family_product_category_zh: function(){
      if(!this.products || this.products.length===0) return null;
      return this.products[0].category_zh;
    },
    product_skus: function(){
      if(!this.products || this.products.length===0) return null;
      return this.products.map((p)=>{ return p.sku; })
    }
  },
  created: async function(){
    this.$router.app.selectedMenu="family";
    if(this.$route.params.id){
      await this.loadData();
    } else {
      this.error="No family specified."
    }
  },
  methods: {
    loadProducts: async function(){
      if(!this.family || !this.family.id) return;
      try{
        this.in_process++;
        this.products = await Vue.mtapi.getProducts({
          family_id: this.family.id,
          order_by: '+sku',
          limit: 100
        });
        if(this.products.length > 0){
          this.products[0]
        }
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load products for the family.";
      } finally {
        this.in_process--;
      }
    },
    
    loadData : async function(){
      try{
        this.message = "Loading...";
        this.error = null;
        
        await this.loadFamily();
        
        await Promise.all([
          this.loadProducts(),
        ]);
        
        //If master data is missing, emit a reload request from the master app.
        if(this.$router.app.brands.length===0 
          || this.$router.app.groups.length===0
          || this.$router.app.technologies.length===0 ){
          this.$emit('reload');
        }
        
      } catch (err){
        this.error = `Couldn't load family data.`;
        console.error(err);
      }
    },
    loadFamily : async function(){
      try{
        if(!this.$route.params.id || this.$route.params.id === 'new'){
          this.family = {};
          return;
        }
        this.in_process++;
        this.message="Loading...";
        this.family = await Vue.mtapi.getFamily(this.$route.params.id);

      }catch(ex){
        console.error(ex);
        this.error="Couldn't load family.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    saveAllFamilyData: async function(){
      try{
        this.message="Saving...";
        await this.saveFamily();
       
        //Regenerate the cache.
        this.$router.app.loadFamilies();

      }catch(ex){
        this.message = "Error saving family.";
        this.error = ex.message; 
      }
    },
    saveFamily: async function(){
      this.in_process++;
      this.message="Saving family..."
      try{
        this.family = await Vue.mtapi.saveFamily(this.family);
        
      }catch(ex){
        this.message = "Error saving family.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
   
    setProductSkus: function(){ this.product_skus = this.product_skus; return; } //readonly
  }
};