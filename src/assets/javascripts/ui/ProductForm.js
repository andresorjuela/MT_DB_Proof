'use strict'
import { ApiError } from "../Api.js";

export default {
  template:
  `
<div>
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
      <b-col cols="7">
        <b-form-group
          id="g_p_name_en"
          description=""
          label="Title (EN):"
          label-for="p_name_en"
          label-cols="2" >
          <b-input-group>
            <b-form-input id="p_name_en" v-model="product.name_en" placeholder="derived by formula" trim></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-secondary">Create Title</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col cols="5">
        <b-form-group
          id="g_p_category"
          description=""
          label="Category:"
          label-for="p_category"
          label-align="right"
          label-cols="4" >
          <b-form-select id="p_category" v-model="product.category_id" :options="this.$router.app.categories" value-field="id" text-field="name_zh" v-if="this.$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_category" v-model="product.category_id" :options="this.$router.app.categories" value-field="id" text-field="name_en" v-else></b-form-select>
          
        </b-form-group>
      </b-col>

    </b-form-row>

    <b-form-row>
      <b-col >
        <b-form-group
          id="g_p_name_zh"
          description=""
          label="Title:"
          label-for="p_name_zh"
          label-cols="2" >
          <b-input-group>
            <b-form-input id="p_name_zh" v-model="product.name_zh" placeholder="从公式得出" trim></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-secondary">Create Title</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
   
      <b-col cols="5">
        <b-form-group
          id="g_p_product_type"
          description=""
          label="Product Type:"
          label-for="p_product_type"
          label-align="right"
          label-cols="4" >
          
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="this.$router.app.product_types" value-field="id" text-field="name_zh" v-if="this.$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="this.$router.app.product_types" value-field="id" text-field="name_en" v-else ></b-form-select>
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
          label-align="right"
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
          description="???"
          label="Manufacturer:"
          label-for="p_manufacturer"
          label-align="right"
          label-cols="4" >
          <b-form-input disabled id="p_manufacturer" ></b-form-input>
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
          label-align="right"
          label-cols="4" >
          <b-form-select id="p_family" v-model="product.family_id" :options="this.families" value-field="id" text-field="family_code" :disabled="loading_dependencies"></b-form-select>
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
          <b-form-checkbox-group
            id="p_certficates"
            :disabled="loading_dependencies"
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
      families: []
    }
  },
  //props: {},
  computed: {},
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