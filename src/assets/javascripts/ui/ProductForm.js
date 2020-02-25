'use strict'
import { ApiError } from "../Api.js";

export default {
  template: /*html*/
  `
<div class="mt-2">
  <b-alert v-if="!busy && error" variant="danger">{{ error }}</b-alert>
  <b-alert v-if="!busy && message" variant="info">{{ message }}</b-alert>
  <b-form @submit="onSubmit" v-if="product">
    <b-form-row>
      <b-col class="text-center">
        <h5 v-cloak v-if="product">Editing Product: ID = {{product.id}}</h5>
        <h5 v-cloak v-else >Adding new Product</h5>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="5">
        <b-form-group
          id="g_p_category"
          description=""
          label="Category:"
          label-for="p_category"
          label-cols="4" >
          <b-form-select id="p_category" v-model="product.category_id" :options="this.$router.app.categories" value-field="id" text-field="name_zh" v-if="this.$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_category" v-model="product.category_id" :options="this.$router.app.categories" value-field="id" text-field="name_en" v-else></b-form-select>
          
        </b-form-group>
      </b-col>

      <b-col cols="7">
        <b-form-group
          id="g_p_name_en"
          description=""
          label="Title (EN):"
          label-for="p_name_en"
          label-cols="2"
          label-align="right" >
          <b-input-group>
            <b-form-input id="p_name_en" v-model="product.name_en" placeholder="derived by formula" trim></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-secondary">Create Title</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="5">
        <b-form-group
          id="g_p_product_type"
          description=""
          label="Product Type:"
          label-for="p_product_type"
          label-cols="4" >
          
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="this.$router.app.product_types" value-field="id" text-field="name_zh" v-if="this.$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="this.$router.app.product_types" value-field="id" text-field="name_en" v-else ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col >
      <b-form-group
        id="g_p_name_zh"
        description=""
        label="Title:"
        label-for="p_name_zh"
        label-cols="2" 
        label-align="right" >
        <b-input-group>
          <b-form-input id="p_name_zh" v-model="product.name_zh" placeholder="从公式得出" trim></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-secondary">Create Title</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </b-col>
 
    </b-form-row>

    <b-form-row>
      <b-col cols="5">
        <b-form-group
          id="g_p_oem"
          description=""
          label="OEM:"
          label-for="p_oem"
          label-cols="4" >
          <b-form-input id="p_oem" v-model="product.oem" trim></b-form-input>
        </b-form-group>
      </b-col>
      <b-col>
        
      </b-col>
      <b-col cols="5">
        <b-form-group
          id="g_p_sku"
          description=""
          label="SKU:"
          label-for="p_sku"
          label-align="right"
          label-cols="4" >
          <b-form-input id="p_sku" v-model="product.sku" trim></b-form-input>
        </b-form-group>
      </b-col>

    </b-form-row>

    <b-form-row>
      <b-col cols="5">
        <b-form-group
          id="g_p_oem"
          label="Manufacturer:"
          label-for="p_manufacturer"
          label-cols="4" >
          <b-form-select id="p_manufacturer" v-model="product.brand_id" :options="this.$router.app.brands" value-field="id" text-field="name_zh" v-if="this.$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_manufacturer" v-model="product.brand_id" :options="this.$router.app.brands" value-field="id" text-field="name_en" v-else ></b-form-select>
          
        </b-form-group>
      </b-col>
      <b-col>
        
      </b-col>
      <b-col cols="5">
        <b-form-group
          id="g_p_supplier"
          description=""
          label="Supplier:"
          label-for="p_supplier"
          label-align="right"
          label-cols="4" >
          <b-form-select id="p_supplier" v-model="product.supplier_id" :options="this.$router.app.suppliers" value-field="id" text-field="name_zh" v-if="this.$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_supplier" v-model="product.supplier_id" :options="this.$router.app.suppliers" value-field="id" text-field="name_en" v-else ></b-form-select>
          
        </b-form-group>
      </b-col>

    </b-form-row>

    <b-form-row>
      <b-col cols="4">
        <b-form-group
          id="g_p_family"
          description=""
          label="Family:"
          label-for="p_family"
          label-cols="4" >
          <b-form-select id="p_family" 
            v-model="product.family_id" 
            :options="this.families" 
            value-field="id" 
            text-field="family_code" 
            :disabled="busy || loading_dependencies" >
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group
          id="g_p_warranty"
          description="months duration"
          label="Warranty:"
          label-for="p_warranty"
          label-align="right"
          label-cols="4" >
          <b-form-input id="p_warranty" v-model="product.warranty_duration_months" type="number" min=0 max=120 step=1></b-form-input>
        </b-form-group>
      </b-col>
      <b-col cols="5">
        <b-form-group
          id="g_p_certificates"
          description=""
          label="Certificates:"
          label-for="p_certificates"
          label-cols="3" >
          <b-form-checkbox-group id="p_certficates"
            :disabled="busy || loading_dependencies"
            v-model="product_certificates"
            :options="this.$router.app.certificates"
            value-field="id"
            text-field="name_en">

          </b-form-checkbox-group>
          
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="3">
        <b-form-group
          id="g_p_lifecycle"
          description=""
          label="Lifecycle:"
          label-for="p_lifecycle"
          label-align="right"
          label-cols="4" >
          <b-form-select id="p_lifecycle" v-model="product.lifecycle_id" :options="this.$router.app.lifecycles" value-field="id" text-field="name_en"></b-form-select>
        </b-form-group>
      </b-col>

      <b-col cols="3">
        <b-form-group
          id="g_p_price"
          description=""
          label="Price:"
          label-for="p_price"
          label-align="right"
          label-cols="4" >
          <b-form-input id="p_price" v-model="product.price" type="number" min=0></b-form-input>
        </b-form-group>
      </b-col>
      
      <b-col cols="3">
        <b-form-group
          id="g_p_weight"
          description=""
          label="Weight:"
          label-for="p_weight"
          label-align="right"
          label-cols="4" >
          <b-form-input id="p_weight" v-model="product.weight" type="number" min=0></b-form-input>
        </b-form-group>
      </b-col>

      <b-col cols="3">
        <b-form-group
          id="g_p_unit"
          description="???"
          label="Unit:"
          label-for="p_unit"
          label-align="right"
          label-cols="4" >
          <b-form-select id="p_unit" v-model="product.lifecycle_id" >
            <b-form-select-option value="" disabled>? discuss ?</b-form-select-option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group
          id="g_p_description_en"
          description=""
          label="Description (EN):"
          label-for="p_description_en"
          label-align="left"
          label-cols="2" >
          <b-form-textarea id="p_description_en" v-model="product.description_en" rows="3" max-rows="6"></b-form-textarea>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row >
      <b-col>
        <b-form-group
          id="g_p_description_zh"
          description=""
          label="Description (CH):"
          label-for="p_description_zh"
          label-align="left"
          label-cols="2" >
          <b-form-textarea id="p_description_zh" v-model="product.description_zh" rows="3" max-rows="6"></b-form-textarea>
        </b-form-group>
      </b-col>
    </b-form-row>
    
    <b-form-row>
      <b-col cols="6">
        <b-form-group
          id="g_p_family_connects"
          description=""
          label="Related Families:"
          label-for="p_family_connects"
          label-align="left"
          label-cols="4" >
          <b-form-select id="p_family_connects" 
            multiple
            v-model="family_connects" 
            :disabled="busy || loading_dependencies"
            :options="families" 
            text-field="family_code" 
            value-field="id" 
            :select-size="4">
            <template v-slot:first>
              <b-form-select-option :value="null">-- choose --</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          v-if="family_connections"
          id="g_display_family_connections"
          description=""
          label="Currently Related to:"
          label-for="display_family_connections"
          label-align="left"
          label-cols="4" >
          <p id="display_family_connections">{{ family_connections }}</p>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group
          id="g_p_oem_references"
          description=""
          label="OEM References:"
          label-for="p_oem_references"
          label-cols="2" >
          <b-form-textarea id="p_oem_references" v-model="product.oem_references" rows="3" max-rows="6"></b-form-textarea>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group
          id="g_p_tags"
          description=""
          label="Tags:"
          label-for="p_tags"
          label-align="left"
          label-cols="2" >
          <b-form-textarea id="p_tags" v-model="product.tags" rows="3" max-rows="6"></b-form-textarea>
        </b-form-group>
      </b-col>
    </b-form-row>
  </b-form>
  <b-spinner v-if="busy || loading_dependencies" variant="secondary" />
</div>
  `,
  data (){
    return {
      message: null,
      error: null,
      busy: false,
      loading_dependencies: false,
      product: null,//actually a product-view
      product_certificates: [],
      families: [],
      family_connects: []//family ids only
    }
  },
  //props: {},
  computed: {
    family_connections: function(){
      if(!this.family_connects) return "";
      return this.family_connects
        .filter(fid=>{return fid!="";})
        .map(fid=>{
          let f = this.families.find(v=>{ return v.id === fid });
          if(f) return f.family_code;
        })
        .join(",");
    }
  },
  created: function(){
    this.loadData();
    this.$router.app.selectedMenu="product";
  },
  methods: {
    loadData : async function(){
      try{
        this.error = null;
        this.message = null;
        this.busy = true;
        this.product = await Vue.mtapi.getProductView(this.$route.params.id);
        if(!this.$router.app.categories 
          || !this.$router.app.certificates
          || !this.$router.app.lifecycles
          || !this.$router.app.product_types ){
          this.$emit('reload');
        }
        this.families = await Vue.mtapi.getFamilies(this.product.family_id);

        this.loading_dependencies = true;
        
        let tempcerts = await Vue.mtapi.getProductCertificates(this.product.id);
        this.product_certificates = tempcerts.map(v=>{return v.certificate_id});//just the cert ids.
        
        let tempfamilyconns = await Vue.mtapi.getProductFamilies(this.product.id);
        this.family_connects = tempfamilyconns.map(v=>{return v.family_id});//just the family ids.

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.busy = false;
        this.loading_dependencies = false;
      }
    },
    onSubmit: async function(){

    }
  }
};