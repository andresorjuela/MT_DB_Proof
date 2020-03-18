'use strict'
import { ApiError } from "../Api.js";
import env from "../env.js";
export default {
  template: /*html*/
  `
<div class="mt-1" v-cloak>
  
  <b-row no-gutters class="bg-light mb-2" align-v="center">
    <b-col class="pl-2" >
      <span v-cloak class="h5" v-if="product && product.id">Editing Product: ID = {{product.id}}</span>
    </b-col>
    <b-col>
      <b-spinner small variant="secondary" v-if="busy"/>
      <span class="p2 text-info" v-if="hasMessage" variant="info">{{ message }}</span>
      <span class="p2 text-danger" v-if="!busy && hasError" variant="danger">{{ error }}</span>
    </b-col>
    <b-col class="text-right">
      <b-button small variant="outline-secondary" @click="saveAllProductData" :disabled="busy" :href="browse_url" target="_blank">
        <b-icon-eye-fill />&nbsp;Preview
      </b-button>
      <b-button small variant="success" @click="saveAllProductData" :disabled="busy" >
        <b-icon-cloud-upload />&nbsp;Save
      </b-button>
    </b-col>
  </b-row>
  
  <b-form v-if="product">
    <b-form-row>
      <b-col cols="5">
        <b-form-group id="g_p_category" description="" label="Category:" label-for="p_category" label-cols="4" >
          <tree-selector-input :list="$router.app.categories" v-model="product.category_id"></tree-selector-input>
        </b-form-group>
      </b-col>

      <b-col cols="7">
        <b-form-group id="g_p_name_en" description="" label="Title (EN):" label-for="p_name_en" label-cols="2" label-align="right" >
          <b-input-group>
            <b-form-input id="p_name_en" v-model="product.name_en" placeholder="derived by formula" trim></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-secondary" @click="generateName('en')" :disabled="!hasNameFormula">Create Title</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="5">
        <b-form-group id="g_p_product_type" label="Product Type:" label-for="p_product_type" label-cols="4">
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="$router.app.product_types" value-field="id" text-field="name_zh" v-if="$router.app.lang==='zh'" >
            <template v-slot:first>
              <b-form-select-option value="" >选择</b-form-select-option>
            </template>
          </b-form-select>
          <b-form-select id="p_product_type" v-model="product.product_type_id" :options="$router.app.product_types" value-field="id" text-field="name_en" v-else > 
            <template v-slot:first>
              <b-form-select-option value="" >Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group id="g_p_name_zh" label="Title (ZH):" label-for="p_name_zh" label-cols="2" label-align="right" >
          <b-input-group>
            <b-form-input id="p_name_zh" v-model="product.name_zh" placeholder="从公式得出" trim></b-form-input>
            <b-input-group-append>
              <b-button variant="outline-secondary" @click="generateName('zh')" :disabled="!hasNameFormula">Create Title</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>

    </b-form-row>

    <b-form-row>
      <b-col cols="5" v-if="isAccessory||isPart">
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
      <b-col cols="5" v-if="isAccessory||isPart">
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
            <template v-slot:first>
              <b-form-select-option value="" >选择</b-form-select-option>
            </template>
          </b-form-select>
          <b-form-select id="p_supplier" v-model="product.supplier_id" :options="$router.app.suppliers" value-field="id" text-field="name_en" v-else >
            <template v-slot:first>
              <b-form-select-option value="" >Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>

    </b-form-row>

    <b-form-row>
      <b-col v-if="isAccessory||isPart" >
        <b-form-group id="g_p_family" label="Family:" label-for="p_family" label-cols="4" >
          <b-form-select id="p_family" v-model="product.family_id" :options="$router.app.families" value-field="id" text-field="family_code" :disabled="busy" >
            <template v-slot:first>
              <b-form-select-option value="" >选择/Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
        <!-- <mt-family-search family_id="product.family_id"></mt-family-search> -->
      </b-col>
      <b-col >
        <b-form-group id="g_p_warranty" description="months duration" label="Warranty:" label-for="p_warranty" label-align="right" label-cols="4" >
          <b-form-input id="p_warranty" v-model="product.warranty_duration_months" type="number" min=0 max=120 step=1>
          </b-form-input>
        </b-form-group>
      </b-col>
      <b-col v-if="isAccessory">
        <b-form-group id="g_p_certificates" label="Certificates:" label-for="p_certificates" label-cols="3" >
          <b-form-checkbox-group id="p_certficates" v-model="product_certificates" :options="$router.app.certificates" value-field="id" text-field="name_en" :disabled="busy" >
          </b-form-checkbox-group>       
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="3" v-if="isAccessory">
        <b-form-group id="g_p_lifecycle" label="Lifecycle:" label-for="p_lifecycle" label-cols="4" >
          <b-form-select id="p_lifecycle" v-model="product.lifecycle_id" :options="$router.app.lifecycles" value-field="id" text-field="name_en">
            <template v-slot:first>
              <b-form-select-option value="" >选择/Choose</b-form-select-option>
            </template>
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
      
      <b-col cols="3" v-if="isAccessory||isPart" >
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

      <b-col cols="3" v-if="isAccessory||isPart" >
        <b-form-group id="g_p_unit" label="Unit:" label-for="p_unit" label-align="right" label-cols="4" >
          <b-form-select id="p_unit" v-model="product.packaging_factor" :options="valid_units">
            <template v-slot:first>
              <b-form-select-option value="" >选择/Choose</b-form-select-option>
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
        <b-button variant="outline-secondary" @click="generateDescription('en')" :disabled="!hasDescriptionFormula" small>Create Description</b-button>
      </b-col>
    </b-form-row>

    <b-form-row >
      <b-col cols="8">
        <b-form-group id="g_p_description_zh" label="Description (ZH):" label-for="p_description_zh" label-align="left" label-cols="2" >
          <b-form-textarea id="p_description_zh" v-model="product.description_zh" rows="3" max-rows="6"></b-form-textarea>
        </b-form-group>
      </b-col>
      <b-col>
        <b-button variant="outline-secondary" @click="generateDescription('zh')" :disabled="!hasDescriptionFormula" small>Create Description</b-button>
      </b-col>
    </b-form-row>
    
    <b-form-row v-if="isAccessory">
      <b-col cols="6">
        <b-form-group id="g_p_related_families" label="Related Families:" label-for="p_related_families" label-align="left" label-cols="4" >
          <b-form-select id="p_related_families" v-model="related_families" :disabled="busy" :options="$router.app.families"  text-field="family_code" value-field="id"  :select-size="4" multiple>
            <template v-slot:first>
              <b-form-select-option :value="null">选择/Choose</b-form-select-option>
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
  <b-card v-if="product">
    <b-tabs content-class="mt-3" card>
      <b-tab active>
        <template v-slot:title>
          <b-spinner small variant="secondary" v-if="busy && tab_active=='Images'"></b-spinner>  Images
        </template>
        <b-form v-for="(pimage, idx) in product_images" :key="idx" v-if="product_images">
          <b-form-row>
            <b-col cols="4">
              <b-form-group label="Image Type:" label-cols="4" >
                <b-form-select v-model="pimage.image_type_id" :options="$router.app.image_types" value-field="id" text-field="name">
                  <template v-slot:first>
                    <b-form-select-option :value="null">选择/Choose</b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </b-col>
          
            <b-col cols="4">
              <b-form-group label="Link:" label-align="right" label-cols="4" >
                <b-form-input v-model="pimage.image_link" type="text" placeholder="url for the image" ></b-form-input>
              </b-form-group>
            </b-col>

            <b-col cols="4">
              <b-img :src="validateImage(pimage.image_link)" width="120" height="80" right />
              <b-button @click="removeProductImage(idx)"  variant="outline-danger" size="sm">Delete</b-button>
            </b-col>
          </b-form-row>
        </b-form>
        
        <b-button variant="outline-success" @click="newProductImage" size="sm">Add Image</b-button>
      </b-tab>
      
      <b-tab @click="loadProductOemReferences" v-if="isAccessory" >
        <template v-slot:title>
          <b-spinner small variant="secondary" v-if="busy && tab_active=='OEM References'"></b-spinner> OEM References
        </template>
        <b-form v-for="(oemref, idx) in product_oem_refs" :key="oemref.brand_id" v-if="product_oem_refs">
          <b-form-row>
            <b-col cols="5">
              <b-form-group
                label="OEM Reference:"
                label-align="right"
                label-cols="4" >
                <b-form-input v-model="oemref.name" type="text" ></b-form-input>
              </b-form-group>
            </b-col>
            <b-col cols="5">
              <b-form-group label="Brand:" label-cols="4" >
                <b-form-select v-model="oemref.brand_id" :options="$router.app.brands" value-field="id" text-field="name_zh" v-if="$router.app.lang==='zh'" >
                  <template v-slot:first>
                    <b-form-select-option :value="null">选择</b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-select v-model="oemref.brand_id" :options="$router.app.brands" value-field="id" text-field="name_en" v-else>
                  <template v-slot:first>
                    <b-form-select-option :value="null">Choose</b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-button @click="removeProductOemReference(idx)" variant="outline-danger" size="sm">Delete</b-button>
            </b-col>
          </b-form-row>
        </b-form>
        
        <b-button variant="outline-success" @click="newProductOemReference" size="sm">Add OEM Reference</b-button>
      </b-tab>

      <b-tab @click="loadProductFilterOptions">
        <template v-slot:title>
          <b-spinner small variant="secondary" v-if="busy && tab_active=='Filters'"></b-spinner> Filters
        </template>
        <b-form v-if="product_filter_options">
          <b-form-row>
            <b-col cols="6" v-for="(filter, idx) in filters" :key="filter.filter_id" >
              <b-form-group :label="filter.name_en+':'" label-cols="4" >
                <b-form-select v-model="getProductFilterOption(filter.filter_id).filter_option_id" :options="filter.options" value-field="filter_option_id" text-field="option_zh" v-if="$router.app.lang==='zh'" >
                  <template v-slot:first>
                    <b-form-select-option :value="null">选择</b-form-select-option>
                  </template>
                </b-form-select>
                <b-form-select v-model="getProductFilterOption(filter.filter_id).filter_option_id" :options="filter.options" value-field="filter_option_id" text-field="option_en" v-else >
                  <template v-slot:first>
                    <b-form-select-option :value="null">选择/Choose</b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </b-col>

          </b-form-row>
        </b-form>
      </b-tab>
      
      <b-tab @click="loadProductCustomAttributes" v-if="isAccessory||isRepairService">
        <template v-slot:title>
          <b-spinner small variant="secondary" v-if="busy && tab_active=='Custom Attributes'"></b-spinner> Custom Attributes
        </template>
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

      <b-tab v-if="isPart">
        <template v-slot:title>
          <b-spinner small variant="secondary" v-if="busy"></b-spinner> Set
        </template>
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
      tab_active: null,

      custom_attributes: [],
      filters: [], //options will also be loaded
      related_families: [],//family ids only
    
      product: null,//actually a product-view
      product_certificates: [],
      product_tags: [],
      
      /*
        Initialized to null intentionally. Load from server only loads
        when null, not when empty.
      */
      product_oem_refs: null,
      product_images: null, 
      product_custom_attributes: null,
      product_filter_options: null
      
    }
  },
  //props: {},
  computed: {
    browse_url: function(){ return this.product ? `${env().STATIC_ASSETS_PATH}/browse.html#/${this.product.id}`: ''; },
    busy: function(){ return this.in_process > 0;},
    category: function(){
      return this.$router.app.categories.find(c=>{ return c.id == this.product.category_id; });
    },
    family_connections: function(){
      if(!this.related_families) return "";
      return this.related_families
        .filter(fid=>{return fid!="";})
        .map(fid=>{
          let f = this.$router.app.families.find(v=>{ return v.id === fid });
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
    hasError: function(){ return this.error?true:false; },
    hasMessage: function(){ return this.message?true:false; },
    hasNameFormula: function(){ return this.category && this.category.product_name_formula; },
    hasDescriptionFormula: function(){ return this.category && this.category.product_description_formula; },
    isPart: function(){ return this.general_category.id==2; },
    isAccessory: function(){ return this.general_category.id==1; },
    isRepairService: function(){ return this.general_category.id==3; },
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
      this.error="No product specified."
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
    generateName(locale){
      if(this.category.product_name_formula){
        try{
          let generator = {
            generate: eval(this.category.product_name_formula)
          };
          if(locale === 'en'){
            this.product.name_en = generator.generate({product: this.product}, 'en');
          } else {
            this.product.name_zh = generator.generate({product: this.product}, 'zh');
          }
        }catch(ex){
          console.error(ex);
        }
      }
    },
    generateDescription(locale){
      if(this.category.product_description_formula){
        try{
          let generator = {
            generate: eval(this.category.product_description_formula)
          };
          if(locale === 'en'){
            this.product.description_en = generator.generate({product: this.product}, 'en');
          } else {
            this.product.description_zh = generator.generate({product: this.product}, 'zh');
          }
        }catch(ex){
          console.error(ex);
        }
      }
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
        this.message = "Loading...";
        this.error = null;
        
        await this.loadProduct();
        
        this.message = "Loading product dependencies...";
        await Promise.all([
          this.loadCustomAttributesForCategory(),
          this.loadProductCertificates(),
          this.loadProductFamilies(),
          this.loadFilterOptionViewsForCategory()
        ]);
        
        //If master data is missing, emit a reload request from the master app.
        if(this.$router.app.categories.length===0 
          || !this.$router.app.certificates.length===0
          || !this.$router.app.lifecycles.length===0
          || !this.$router.app.product_types.length===0 ){
          this.$emit('reload');
        }
        
        this.loadProductImages();//default tab.
        
      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't load product data. ${err.message}`;
        } else {
          this.error = `Couldn't load product data.`;
          console.error(err);
        }
      }
    },
    loadFilterOptionViewsForCategory : async function(){
      try{
        this.in_process++;
        this.message = "Loading filter options...";

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
        this.error="Couldn't load filter options.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProduct : async function(){
      try{
        this.in_process++;
        this.message="Loading...";
        this.product = await Vue.mtapi.getProductView(this.$route.params.id);
        this.product_tags = this.product.tags ? this.product.tags.split(",") : [];
        
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load product.";
      } finally {
        this.message = null;
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
        this.message = null;
        this.in_process--;
      }
    },
    loadProductCustomAttributes : async function(){
      if(this.product_custom_attributes!==null) return;//Otherwise server overwrites work
      try{
        this.tab_active = "Custom Attributes";
        this.error = null;
        this.message = "Loading custom attributes...";
        this.in_process++;
        this.product_custom_attributes = await Vue.mtapi.getProductCustomAttributes(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product custom attributes. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.message = null;
        this.in_process--;
      }
    },
    loadProductFamilies : async function(){
      try{
        this.in_process++;
        this.message = "Loading families...";
        let tempfamilyconns = await Vue.mtapi.getProductFamilies(this.product.id);
        this.related_families = tempfamilyconns.map(v=>{return v.family_id});//just the family ids.

      }catch(ex){
        console.error(ex);
        this.error="Couldn't load product families.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProductFilterOptions : async function(){
      if(this.product_filter_options!==null) return;//Otherwise server overwrites work
      try{
        this.tab_active = "Filters";
        this.error = null;
        this.message = "Loading filter options...";
        this.in_process++;
        this.product_filter_options = await Vue.mtapi.getProductFilterOptions(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product filter options. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.message = null;
        this.in_process--;
      }
    },
    loadProductImages : async function(){
      if(this.product_images!==null) return;//Otherwise server overwrites work
      try{
        this.tab_active = 'Images';
        this.error = null;
        this.message = "Loading images...";  
        this.in_process++;
        this.product_images = await Vue.mtapi.getProductImages(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product images. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.message="";
        this.in_process--;
      }
    },
    loadProductOemReferences : async function(){
      if(this.product_oem_refs!==null) return;//Otherwise server overwrites work
      try{
        this.tab_active = "OEM References";
        this.error = null;
        this.message = "Loading OEMs...";
        this.in_process++;
        this.product_oem_refs = await Vue.mtapi.getProductOemReferences(this.$route.params.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product OEMs. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.in_process--;
        this.message="";
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
        
        await Promise.all([
          this.saveProductFamilies(),
          this.saveProductCertificates(),
          this.saveProductImages(),
          this.saveProductOemReferences(),
          this.saveProductFilterOptions(),
          this.saveProductCustomAttributes(),
        ]);

      }catch(ex){
        this.message = "Error saving product.";
        this.error = ex.message; 
      }
    },
    saveProduct: async function(){
      this.in_process++;
      this.message="Saving product..."
      try{
        this.product.tags = this.product_tags && this.product_tags.length > 0 ? this.product_tags.join(",") : "";
        this.product = await Vue.mtapi.saveProduct(this.product);
        
      }catch(ex){
        this.message = "Error saving product.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    saveProductCertificates: async function(){
      this.in_process++;
      this.message="Saving certificates..."
      try{
        await Vue.mtapi.saveProductCertificates(this.product.id, this.product_certificates);
      }catch(ex){
        this.message = "Error saving certificates.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    saveProductFamilies: async function(){
      this.in_process++;
      this.message="Saving related families..."
      try{
        await Vue.mtapi.saveProductFamilies(this.product.id, this.related_families);
      }catch(ex){
        this.message = "Error saving related families.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    saveProductFilterOptions: async function(){
      if(this.product_filter_options === null) return;
      this.in_process++;
      this.message="Saving OEM references..."
      try{
        await Vue.mtapi.saveProductFilterOptions(this.product.id, this.product_filter_options);
      }catch(ex){
        this.message = "Error OEM references.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    saveProductImages: async function(){
      if(this.product_images === null) return;
      this.in_process++;
      this.message="Saving images..."
      try{
        await Vue.mtapi.saveProductImages(this.product.id, this.product_images);
      }catch(ex){
        this.message = "Error saving images.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    saveProductCustomAttributes: async function(){
      if(this.product_custom_attributes === null) return;
      this.in_process++;
      this.message="Saving custom attributes..."
      try{
        await Vue.mtapi.saveProductCustomAttributes(this.product.id, this.product_custom_attributes);
      }catch(ex){
        this.message = "Error saving custom attributes.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    saveProductOemReferences: async function(){
      if(this.product_oem_refs === null) return;
      this.in_process++;
      this.message="Saving OEM references..."
      try{
        await Vue.mtapi.saveProductOemReferences(this.product.id, this.product_oem_refs);
      }catch(ex){
        this.message = "Error OEM references.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    validateImage : function(img){
      let VALID_IMG = /http[s]?:\/\/[\w-\.\/]*\.(gif|jpeg|jpg|png)/;
      if(VALID_IMG.test(img)){
        return img;
      }
      return '';
    }
  }
};