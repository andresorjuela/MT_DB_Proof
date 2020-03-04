'use strict'
import { ApiError } from "../Api.js";
export default {
  template: /*html*/
  `
<div class="mt-1" v-cloak>
  <b-alert v-if="!busy && error" variant="danger">{{ error }}</b-alert>
  <b-alert v-if="!busy && message" variant="info">{{ message }}</b-alert>
  <div class="p-1 pt-2 d-flex justify-content-between bg-light">
    <span>
      <span class="h5" v-cloak v-if="product">Editing Product: ID = {{product.id}}</span>
      <span class="h5" v-cloak v-else-if="busy"></span>
      <span class="h5" v-cloak v-else >Adding new Product</span>
    </span>
    <span v-show="busy"  >
      <b-spinner small variant="secondary" />
      <span>loading...</span>
    </span>
    <b-button small variant="success" @click="saveProduct" :disabled="busy">Save</b-button>

  </div>

  <b-form v-if="init_product">
    <b-form-row>
      <b-col>
        <h3>Adding a new product.</h3>
        <p>To add a new product you must first select a Category and a Family.</p>
      </b-col>
    </b-form-row>
    <b-form-row>
      <b-col>
        <b-form-group label="Category:"  label-cols="4" class="pb-1"  >
          <b-form-select v-model="product.category_id" :options="$router.app.brands" value-field="id" text-field="name_en" ></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>
    <b-form-row>
      <b-col>
        <b-form-group label="Family:"  label-cols="4" class="pb-1"  >
          <b-form-select v-model="product.family_id" :options="$router.app.families" value-field="id" text-field="family_code" ></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>
    
  </b-form>

  <b-form v-if="product && !init_product">
    <b-form-row>
      <b-col cols="5">
        <b-form-group id="g_p_category" description="" label="Category:" label-for="p_category" label-cols="4" >
          <b-form-select id="p_category" v-model="product.category_id" :options="$router.app.categories" value-field="id" text-field="name_zh" v-if="$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_category" v-model="product.category_id" :options="$router.app.categories" value-field="id" text-field="name_en" v-else></b-form-select>
        </b-form-group>
      </b-col>

      <b-col cols="7">
        <b-form-group id="g_p_name_en" description="" label="Title (EN):" label-for="p_name_en" label-cols="2" label-align="right" >
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
        <b-form-group id="g_p_product_type" label="Product Type:" label-for="p_product_type" label-cols="4">
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="$router.app.product_types" value-field="id" text-field="name_zh" v-if="$router.app.lang==='zh'" ></b-form-select>
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="$router.app.product_types" value-field="id" text-field="name_en" v-else ></b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group id="g_p_name_zh" label="Title:" label-for="p_name_zh" label-cols="2" label-align="right" >
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
        <b-form-group id="g_p_oem" label="OEM:" label-for="p_oem" label-cols="4" >
          <b-form-input id="p_oem" v-model="product.oem" trim></b-form-input>
        </b-form-group>
      </b-col>
      
      <b-col>
      </b-col>
      
      <b-col cols="5">
        <b-form-group id="g_p_sku" label="SKU:" label-for="p_sku" label-align="right" label-cols="4" >
          <b-form-input id="p_sku" v-model="product.sku" trim></b-form-input>
        </b-form-group>
      </b-col>

    </b-form-row>

    <b-form-row>
      <b-col cols="5">
        <b-form-group id="g_p_oem" label="Manufacturer:"  label-cols="4" class="pb-1"  >
          <b-form-input v-if="$router.app.lang==='zh'" v-model="product.brand_zh" readonly ></b-form-input>
          <b-form-input v-else v-model="product.brand_en" readonly></b-form-input>
        </b-form-group>
      </b-col>
      <b-col>
        
      </b-col>
      <b-col cols="5">
        <b-form-group id="g_p_supplier" label="Supplier:" label-for="p_supplier" label-align="right" label-cols="4" >
          <b-form-select id="p_supplier" v-model="product.supplier_id" :options="$router.app.suppliers" value-field="id" text-field="name_zh" v-if="$router.app.lang==='zh'" >
          </b-form-select>
          <b-form-select id="p_supplier" v-model="product.supplier_id" :options="$router.app.suppliers" value-field="id" text-field="name_en" v-else >
          </b-form-select>
        </b-form-group>
      </b-col>

    </b-form-row>

    <b-form-row>
      <b-col cols="4">
        <b-form-group id="g_p_family" label="Family:" label-for="p_family" label-cols="4" >
          <b-form-select id="p_family" v-model="product.family_id" :options="this.families" value-field="id" text-field="family_code" :disabled="busy" >
          </b-form-select>
        </b-form-group>
        <!-- <mt-family-search family_id="product.family_id"></mt-family-search> -->
      </b-col>
      <b-col cols="3">
        <b-form-group id="g_p_warranty" description="months duration" label="Warranty:" label-for="p_warranty" label-align="right" label-cols="4" >
          <b-form-input id="p_warranty" v-model="product.warranty_duration_months" type="number" min=0 max=120 step=1>
          </b-form-input>
        </b-form-group>
      </b-col>
      <b-col cols="5">
        <b-form-group id="g_p_certificates" label="Certificates:" label-for="p_certificates" label-cols="3" >
          <b-form-checkbox-group id="p_certficates" v-model="product_certificates" :options="$router.app.certificates" value-field="id" text-field="name_en" :disabled="busy" >
          </b-form-checkbox-group>       
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="3">
        <b-form-group id="g_p_lifecycle" label="Lifecycle:" label-for="p_lifecycle" label-cols="4" >
          <b-form-select id="p_lifecycle" v-model="product.lifecycle_id" :options="$router.app.lifecycles" value-field="id" text-field="name_en">
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col cols="3">
        <b-form-group id="g_p_price" label="Price:" label-for="p_price" label-align="right" label-cols="4" >
          <b-input-group>
            <b-form-input id="p_price" v-model="product.price" type="number" :number="true" min=0 step=0.01 >
            </b-form-input>
            <template v-slot:append>
              <b-input-group-text>&yen;</b-input-group-text>
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>
      
      <b-col cols="3">
        <b-form-group id="g_p_weight" label="Weight:" label-for="p_weight" label-align="right" label-cols="4" >
          <b-input-group>
            <b-form-input id="p_weight" v-model="product.weight" type="number" :number="true" min=0 step=0.01 >
            </b-form-input>
            <template v-slot:append>
              <b-input-group-text>kg</b-input-group-text>
            </template>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col cols="3">
        <b-form-group id="g_p_unit" label="Unit:" label-for="p_unit" label-align="right" label-cols="4" >
          <b-form-select id="p_unit" v-model="product.lifecycle_id" :options="valid_units">
            <template v-slot:first>
              <b-form-select-option value="" >Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="8">
        <b-form-group id="g_p_description_en" label="Description (EN):" label-for="p_description_en" label-align="left" label-cols="2" >
          <b-form-textarea id="p_description_en" v-model="product.description_en" rows="3" max-rows="6">
          </b-form-textarea>
        </b-form-group>
      </b-col>
      <b-col>
        <b-button variant="outline-secondary" small>Create Description</b-button>
      </b-col>
    </b-form-row>

    <b-form-row >
      <b-col cols="8">
        <b-form-group id="g_p_description_zh" label="Description (CH):" label-for="p_description_zh" label-align="left" label-cols="2" >
          <b-form-textarea id="p_description_zh" v-model="product.description_zh" rows="3" max-rows="6"></b-form-textarea>
        </b-form-group>
      </b-col>
      <b-col>
        <b-button variant="outline-secondary" small>Create Description</b-button>
      </b-col>
    </b-form-row>
    
    <b-form-row>
      <b-col cols="6">
        <b-form-group id="g_p_family_connects" label="Related Families:" label-for="p_family_connects" label-align="left" label-cols="4" >
          <b-form-select id="p_family_connects" v-model="family_connects" :disabled="busy" :options="families"  text-field="family_code" value-field="id"  :select-size="4" multiple>
            <template v-slot:first>
              <b-form-select-option :value="null">-- choose --</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group v-if="family_connections" id="g_display_family_connections" label="Currently Related to:" label-for="display_family_connections" label-align="left" label-cols="4" >
          <p id="display_family_connections">{{ family_connections }}</p>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group id="g_p_tags" label="Tags:" label-for="p_tags" label-align="left" label-cols="2" >
          <b-form-tags id="p_tags" v-model="product_tags" separator="," ></b-form-tags>
        </b-form-group>
      </b-col>
    </b-form-row>
  </b-form>
  
  <!-- 1:N relationships -->
  <b-card v-if="product && !init_product">
    <b-tabs content-class="mt-3" card>
      <b-tab title="Images" active>
        <h5>Images</h5>
        <b-form v-for="(pimage, idx) in product_images" key="pimage.id" v-if="product_images">
          <b-form-row>
            <b-col cols="5">
              <b-form-group label="Image Type:" label-cols="4" >
                <b-form-select v-model="pimage.image_type_id" :options="$router.app.image_types" value-field="id" text-field="name"></b-form-select>
              </b-form-group>
            </b-col>
          
            <b-col cols="5">
              <b-form-group label="Link:" label-align="right" label-cols="4" >
                <b-form-input v-model="pimage.image_link" type="text" placeholder="url for the image" ></b-form-input>
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-button @click="removeProductImage(idx)"  variant="outline-danger" size="sm">Delete</b-button>
            </b-col>
          </b-form-row>
        </b-form>
        
        <b-button variant="outline-success" @click="newProductImage" size="sm">Add Image</b-button>
      </b-tab>
      
      <b-tab title="OEM References" @click="loadProductOemReferences">
        <h5>OEM References</h5>
        <b-form v-for="(oemref, idx) in product_oem_refs" :key="oemref.brand_id" v-if="product_oem_refs">
          <b-form-row>
            <b-col cols="5">
              <b-form-group label="OEM:" label-cols="4" >
                <b-form-select v-model="oemref.brand_id" :options="$router.app.brands" value-field="id" text-field="name_zh" v-if="$router.app.lang==='zh'" >
                </b-form-select>
                <b-form-select v-model="oemref.brand_id" :options="$router.app.brands" value-field="id" text-field="name_en" v-else >
                </b-form-select>
              </b-form-group>
            </b-col>
          
            <b-col cols="5">
              <b-form-group
                label="Reference:"
                label-align="right"
                label-cols="4" >
                <b-form-input v-model="oemref.name" type="text" ></b-form-input>
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-button @click="removeProductOemReference(idx)" variant="outline-danger" size="sm">Delete</b-button>
            </b-col>
          </b-form-row>
        </b-form>
        
        <b-button variant="outline-success" @click="newProductOemReference" size="sm">Add OEM Reference</b-button>
      </b-tab>

      <b-tab title="Filters" @click="loadProductFilterOptions">
        <h5>Filters</h5>
        <b-form v-if="product_filter_options">
          <b-form-row>
            <b-col cols="6" v-for="(filter, idx) in filters" :key="filter.filter_id" >
              <b-form-group :label="filter.name_en+':'" label-cols="4" >
                <b-form-select v-model="getProductFilterOption(filter.filter_id).filter_option_id" :options="filter.options" value-field="filter_option_id" text-field="option_zh" v-if="$router.app.lang==='zh'" >
                </b-form-select>
                <b-form-select v-model="getProductFilterOption(filter.filter_id).filter_option_id" :options="filter.options" value-field="filter_option_id" text-field="option_en" v-else >
                </b-form-select>
              </b-form-group>
            </b-col>

          </b-form-row>
        </b-form>
      </b-tab>
      
      <b-tab title="Custom Attributes" @click="loadProductCustomAttributes">
        <h5>Custom Attributes</h5>
        <b-form v-if="product_custom_attributes">
          <b-form-row>
            <b-col cols="6" v-for="(attr, idx) in custom_attributes" :key="attr.id" >
              <b-form-group :label="attr.name_en+':'" label-cols="4" >
                <b-form-input v-model="getProductCustomAttribute(attr.id).name_en" type="text">
                </b-form-input>
              </b-form-group>
            </b-col>

          </b-form-row>
        </b-form>
      </b-tab>

      <b-tab title="Set">
        <h5>Set</h5>
      </b-tab>
    </b-tabs>
  </b-card>


</div>
  `,
  data (){
    return {
      message: null,
      error: null,
      in_process: 0,
     
      init_product: false,

      custom_attributes: [],
      filters: [], //options will also be loaded
      families: [],
      family_connects: [],//family ids only
    
      product: null,//actually a product-view
      product_certificates: [],
      product_oem_refs: [],
      product_tags: [],
      
      /*
        Initialized to null intentionally. Load from server only loads
        when null, not when empty.
      */
      product_images: null, 
      product_custom_attributes: null,
      product_filter_options: null
      
    }
  },
  //props: {},
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error?true:false; },
    hasMessage: function(){ return this.message?true:false; },
    family_connections: function(){
      if(!this.family_connects) return "";
      return this.family_connects
        .filter(fid=>{return fid!="";})
        .map(fid=>{
          let f = this.families.find(v=>{ return v.id === fid });
          if(f) return f.family_code;
        })
        .join(",");
    },
    /**
     * The highest-level ancestor of the current category.
     */
    general_category: function(){
      return this.$router.app.topAncestorCategoryFor(this.product.category_id);
    },
    valid_units: function(){
      let units = [1, 5, 6, 10, 12, 16, 20, 24, 25, 50, 100];
      let ancestor = this.general_category;
      if(ancestor && ancestor.name_en==='Parts'){
        units.push("Set");
      }
      return units;
    }
  },
  created: async function(){
    this.$router.app.selectedMenu="product";
    if(this.$route.params.id){
      await this.loadData();
    } else {
      this.init_product = true;
      this.product = {
        category_id: 0,
        family_id: 0,
      };
    }
  },
  methods: {
    getProductCustomAttribute: function(attr_id){
      let the_pca = this.product_custom_attributes.find(pca=>{ return pca.custom_attribute_id == attr_id;});
      if(!the_pca){
        //lazy init.
        the_pca = {
          product_id: this.product.id,
          custom_attribute_id: attr_id,
          name_en: null,
          name_zh: null
        };
        this.product_custom_attributes.push(the_pca);
      }
      return the_pca;
    },
    getProductFilterOption: function(filter_id){
      let the_pfo = this.product_filter_options.find(pfo=>{ return pfo.filter_id == filter_id;});
      if(!the_pfo){
        //lazy init.
        the_pfo = {
          product_id: this.product.id,
          filter_id: filter_id,
          filter_option_id: null
        };
        this.product_filter_options.push(the_pfo);
      }
      return the_pfo;
    },
    loadCustomAttributesForCategory : async function(){
      try{
        this.in_process++;
        this.custom_attributes = await Vue.mtapi.getCustomAttributesForCategory(this.product.category_id);
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load custom attributes for the category.";
      } finally {
        this.in_process--;
      }
    },
    loadData : async function(){
      try{
        this.error = null;
        this.message = null;
        
        await this.loadProduct();

        await Promise.all([
          this.loadFamiliesForBrand(),
          this.loadCustomAttributesForCategory(),
          this.loadProductCertificates(),
          this.loadProductFamilies(),
          this.loadFilterOptionViewsForCategory()
        ]);
        this.product_tags = this.product.tags ? this.product.tags.split() : [];
        
        //If master data is missing, emit a reload request from the master app.
        if(this.$router.app.categories.length===0 
          || !this.$router.app.certificates.length===0
          || !this.$router.app.lifecycles.length===0
          || !this.$router.app.product_types.length===0 ){
          this.$emit('reload');
        }
        
        
        this.loadProductImages();//default tab.
        this.in_process--;

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't load product data. ${err.message}`;
        } else {
          this.error = `Couldn't load product data.`;
          console.error(err);
        }
      } 
    },
    loadFamiliesForBrand: async function(){
      try{
        this.in_process++;
        this.families = await Vue.mtapi.getFamiliesForBrand(this.product.brand_id);
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load families for brand.";
      } finally {
        this.in_process--;
      }
    },
    loadFilterOptionViewsForCategory : async function(){
      try{
        this.in_process++;
        let filter_option_views = await Vue.mtapi.getFilterOptionViewsForCategory(this.product.category_id);
        filter_option_views.forEach(fov=>{
          let filter = this.filters.find(f=>{ return f.filter_id == fov.filter_id; });
          if(!filter){
            filter = {
              filter_id: fov.filter_id,
              name_en: fov.filter_en,
              name_zh: fov.filter_zh,
              options:[]
            }
            this.filters.push(filter);
          }
          filter.options.push({
            filter_option_id: fov.filter_option_id,
            option_en: fov.option_en,
            option_zh: fov.option_zh
          });
        });


      }catch(ex){
        console.error(ex);
        this.error="Couldn't load filter options for this category.";
      } finally {
        this.in_process--;
      }
    },
    loadProduct : async function(){
      try{
        this.in_process++;
        this.product = await Vue.mtapi.getProductView(this.$route.params.id);
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load product.";
      } finally {
        this.in_process--;
      }
    },
    loadProductCertificates : async function(){
      try{
        this.in_process++;
        let tempcerts = await Vue.mtapi.getProductCertificates(this.product.id);
        this.product_certificates = tempcerts.map(v=>{return v.certificate_id});//just the cert ids.
        
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load product certificates.";
      } finally {
        this.in_process--;
      }
    },
    loadProductCustomAttributes : async function(){
      if(this.product_custom_attributes!==null) return;//Otherwise server overwrites work
      try{
        this.error = null;
        this.message = null;
        this.in_process++;
        this.product_custom_attributes = await Vue.mtapi.getProductCustomAttributes(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product custom attributes. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    loadProductFamilies : async function(){
      try{
        this.in_process++;
        let tempfamilyconns = await Vue.mtapi.getProductFamilies(this.product.id);
        this.family_connects = tempfamilyconns.map(v=>{return v.family_id});//just the family ids.

      }catch(ex){
        console.error(ex);
        this.error="Couldn't load product families.";
      } finally {
        this.in_process--;
      }
    },
    loadProductFilterOptions : async function(){
      if(this.product_filter_options!==null) return;//Otherwise server overwrites work
      try{
        this.error = null;
        this.message = null;
        this.in_process++;
        this.product_filter_options = await Vue.mtapi.getProductFilterOptions(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product filter options. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    loadProductImages : async function(){
      if(this.product_images!==null) return;//Otherwise server overwrites work
      try{
        this.error = null;
        this.message = null;
        this.in_process++;
        this.product_images = await Vue.mtapi.getProductImages(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product images. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    loadProductOemReferences : async function(){
      if(this.product_oem_refs!==null) return;//Otherwise server overwrites work
      try{
        this.error = null;
        this.message = null;
        this.in_process++;
        this.product_oem_refs = await Vue.mtapi.getProductOemReferences(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product OEM references. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
      }
    },
    newProductFilterOption : function(){
      this.product_filter_options.push({
        id: null,
        product_id: this.product.id,
        filter_option_id: null,
        image_link: null
      });
    },
    newProductImage : function(){
      this.product_images.push({
        id: null,
        product_id: this.product.id,
        image_type_id: null,
        image_link: null
      });
    },
    newProductOemReference : function(){
      this.product_oem_refs.push({
        id: null,
        product_id: this.product.id,
        brand_id: null,
        name: ""
      });
    },
    removeProductFilterOption : function(idx){
      if(idx>=0) this.product_filter_options.splice(idx, 1);
    },
    removeProductImage : function(idx){
      if(idx>=0) this.product_images.splice(idx, 1);
    },
    removeProductOemReference : function(idx){
      if(idx>=0) this.product_oem_refs.splice(idx, 1);
    },
    saveAllProductData: async function(){
      try{
        
        await this.saveProduct();
        
        // product_certificates: [],
        // product_oem_refs: [],
        // product_tags: [],
      
        // product_images: null, 
        // product_custom_attributes: null,
        // product_filter_options: null

      }catch(ex){
        this.message = "Error saving product.";
        this.error = ex.message; 
      }
    },
    saveProduct: async function(){
      this.in_process++;
      try{
        await Vue.mtapi.saveProduct();
        
      }catch(ex){
        this.message = "Error saving product.";
        this.error = ex.message; 
      }finally{
        this.in_process--
      }
    }
  }
};