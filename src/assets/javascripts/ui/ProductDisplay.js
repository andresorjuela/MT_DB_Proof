'use strict'
import { ApiError } from "../Api.js";
export default {
  template: /*html*/
  `
<div class="mt-1" v-cloak>
  <div v-if="!product && busy"><b-spinner small variant="secondary"/></div>
  <div v-if="product">
    <b-row no-gutters class="bg-light mb-2" align-v="center">
      <b-col class="pl-2" >
        <span class="h5" v-if="$router.app.lang==='zh'">{{product.name_zh||'(no title yet)'}}</span>
        <span class="h5" v-else>{{product.name_en||'(no title yet)'}}</span>
      </b-col>
      <b-col>
        <b-spinner small variant="secondary" v-if="busy"/>
        <span class="p2 text-info" v-if="hasMessage" variant="info">{{ message }}</span>
        <span class="p2 text-danger" v-if="!busy && hasError" variant="danger">{{ error }}</span>
      </b-col>
    </b-row>
    
    <b-row>
      <b-col cols="6">

        <b-row>
          <b-col>
            <span class="text-info" v-if="$router.app.lang==='zh'">{{product.description_zh||'(no description yet)'}}</span>
            <span class="text-info" v-else>{{product.description_en||'(no description yet)'}}</span>
          </b-col>
        </b-row>
        
        <b-table-simple responsive borderless>
          <b-thead>
            <b-tr>
              <b-th variant="secondary">OEM</b-th>
              <b-th variant="light">Manufacturer</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr>
              <b-td>{{product.oem}}</b-td>
              <b-td>{{product.brand_en}}</b-td>
            </b-tr>
          </b-tbody>
        
          <b-thead>
            <b-tr>
              <b-th>SKU</b-th>
              <b-th>Price</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr>
              <b-td class="bg-info">{{product.sku}}</b-td>
              <b-td class="bg-light">{{product.price+' ￥'}}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>

      </b-col>

      <b-col>
        <b-carousel controls indicators background="#0c0c0c" img-width="400" img-height="300" style="text-shadow: 1px 1px 2px #333;"  v-if="product_images" >
          <b-carousel-slide v-for="(img,idx) in product_images" :key="idx" :caption="img.image_type" :img-src="img.image_link"></b-carousel-slide>
        </b-carousel>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="6">
        <b-table-simple responsive >
          <b-tbody>
            <b-tr>
              <b-th variant="light">Category</b-th>
              <b-td>{{$router.app.lang==='zh' ? product.category_zh : product.category_en}}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Product Type</b-th>
              <b-td>{{$router.app.lang==='zh' ? product.product_type_zh : product.product_type_en}}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Supplier</b-th>
              <b-td>{{$router.app.lang==='zh' ? product.supplier_zh : product.supplier_en}}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Family</b-th>
              <b-td>{{product.family_code}}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Certificates</b-th>
              <b-td>{{ certificates || '(none)' }}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>

      </b-col>

      <b-col>
        <b-table-simple responsive >
          <b-tbody>
            <b-tr>
              <b-th variant="light">Connects To</b-th>
              <b-td>{{ connects_to || '(none)' }}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Tags</b-th>
              <b-td>{{ product.tags || '(none)' }}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Warranty</b-th>
              <b-td>{{product.warranty_duration_months}} months</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Lifecycle</b-th>
              <b-td>{{product.lifecycle_en}}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Weight</b-th>
              <b-td>{{ product.weight ? product.weight+' g' : '' }}</b-td>
            </b-tr>

            <b-tr>
              <b-th variant="light">Unit</b-th>
              <b-td>{{ product.packaging_factor }}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-col>
    </b-row>
    
    
    <!-- 1:N relationships -->
    <b-card v-if="product">
      <b-tabs content-class="mt-3" card>
        
        <b-tab title="OEM References" @click="loadProductOemReferences" v-if="isAccessory">
          <b-table hover :items="product_oem_refs" ></b-table>
        </b-tab>

        <b-tab title="Filters" @click="loadProductFilterOptions" active>
          <b-table hover :items="product_filter_options" ></b-table>
        </b-tab>
        
        <b-tab title="Custom Attributes" @click="loadProductCustomAttributes" v-if="isPart||isAccessory">
          <b-table hover :items="product_custom_attributes" ></b-table>
        </b-tab>

        <b-tab title="Set" @click="loadProductSets" v-if="isPart && product.packaging_factor==='Set'">
          <b-table hover :items="product_sets" ></b-table>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</div>
  `,
  data (){
    return {
      message: null,
      error: null,
      in_process: 0,
     
      custom_attributes: [], 

      product: null,//actually a product-view
      product_families:[],
      product_certificates: [],
      product_oem_refs: [],
      product_sets: [],
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
    certificates: function(){
      let labels = [];
      this.product_certificates.forEach(c=>{ 
        let cert = this.$router.app.certificates.find(cert=>{ return cert.id == c.certificate_id;});
        labels.push( cert.name_en ); 
      });
      return labels.join(",")
    },
    connects_to: function(){
      let labels = [];
      this.product_families.forEach(pf=>{ 
        let family = this.$router.app.families.find(f=>{ return f.id == pf.family_id;});
        labels.push(family.family_code);
      });
      return labels.join(",");
    },
    
    /**
     * The highest-level ancestor of the current category.
     */
    general_category: function(){
      return this.$router.app.topAncestorCategoryFor(this.product.category_id);
    },
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
    await this.loadData();
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
          this.loadProductImages(),
          this.loadProductOemReferences(),
          this.loadCustomAttributesForCategory(),
          this.loadProductCertificates(),
          this.loadProductFamilies(),
          this.loadProductFilterOptions()
        ]);
        
        //If master data is missing, emit a reload request from the master app.
        if(this.$router.app.categories.length===0 
          || !this.$router.app.certificates.length===0
          || !this.$router.app.lifecycles.length===0
          || !this.$router.app.product_types.length===0 ){
          this.$emit('reload');
        }
        
        
      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't load product data. ${err.message}`;
        } else {
          this.error = `Couldn't load product data.`;
          console.error(err);
        }
      }
    },
    
    loadProduct : async function(){
      try{
        this.in_process++;
        this.message="Loading...";
        this.product = await Vue.mtapi.getProductView(this.$route.params.id);
        
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
        this.product_certificates = await Vue.mtapi.getProductCertificates(this.product.id);
        
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
        this.error = null;
        this.message = "Loading custom attributes...";
        this.in_process++;
        this.product_custom_attributes = await Vue.mtapi.getProductCustomAttributes(this.product.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product custom attributes. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadProductFamilies : async function(){
      try{
        this.in_process++;
        this.message = "Loading families...";
        this.product_families = await Vue.mtapi.getProductFamilies(this.product.id);
        
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
        this.message = null;
        this.in_process--;
      }
    },
    loadProductImages : async function(){
      if(this.product_images!==null) return;//Otherwise server overwrites work
      try{
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
        this.message="";
        this.in_process--;
      }
    },
    loadProductOemReferences : async function(){
      try{
        this.error = null;
        this.message = "Loading OEMs...";
        this.in_process++;
        this.product_oem_refs = await Vue.mtapi.getProductOemReferences(this.product.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product OEMs. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.in_process--;
        this.message="";
      }
    },
    loadProductSets : async function(){
      try{
        this.error = null;
        this.message = "Loading set...";  
        this.in_process++;
        this.product_sets = await Vue.mtapi.getProductSets(this.product.id);

      } catch (err){
        if(err instanceof ApiError){
          this.error = `Couldn't get product set. ${err.message}`;
        } else {
          console.error(err);
        }
      } finally {
        this.tab_active = null;
        this.message="";
        this.in_process--;
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