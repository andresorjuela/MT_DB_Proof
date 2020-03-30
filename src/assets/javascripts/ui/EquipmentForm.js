'use strict'
import { ApiError } from "../Api.js";
export default {
  template: /*html*/
  `
<div class="mt-1" v-cloak>
  
  <b-row no-gutters class="bg-light mb-2" align-v="center">
    <b-col class="pl-2" >
      <span v-cloak class="h5" v-if="equipment && equipment.id">Editing Equipment: {{equipment.model}}</span>
    </b-col>
    <b-col>
      <b-spinner small variant="secondary" v-if="busy"/>
      <span class="p2 text-info" v-if="hasMessage" variant="info">{{ message }}</span>
      <span class="p2 text-danger" v-if="!busy && hasError" variant="danger">{{ error }}</span>
    </b-col>
    <b-col class="text-right">
      <b-button small variant="success" @click="saveAllEquipmentData" :disabled="busy">
      <b-icon-cloud-upload />&nbsp;Save
    </b-button>
  </b-row>
  
  <b-form v-if="equipment">
    <b-form-row>
      <b-col>
        <b-form-group label="Model:" label-cols="4" >
          <b-form-input v-model="equipment.model" />
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="6">
        <b-form-group label="Brand:" label-cols="4">
          <b-form-select v-model="equipment.brand_id" :options="$router.app.brands" value-field="id" text-field="name_en" >
            <template v-slot:first>
              <b-form-select-option value="" >Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="6">
        <b-form-group label="Equipment type:" label-cols="4" label-align="right">
          <b-form-select v-model="equipment.equipment_type_id" :options="$router.app.equipment_types" value-field="id" text-field="name_en" >
            <template v-slot:first>
              <b-form-select-option value="" >Choose</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row v-if="equipment.id">
      <b-col>
        <b-form-group label="Is part of equipment groups:" label-cols="4" >
          <b-badge v-if="equipment_groups.length>0" v-for="(equip_group, idx) in equipment_groups" :key="idx" variant="light" pill>{{ equip_group.group_code }}</b-badge>
          <span v-if="equipment_groups.length===0">Not currently associated with any groups.</span>
        </b-form-group>
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
      equipment: null,

      equipment_groups: []
    }
  },
  //props: {},
  computed: {
    busy: function(){ return this.in_process > 0;},
    hasError: function(){ return this.error?true:false; },
    hasMessage: function(){ return this.message?true:false; },
    
  },
  watch: {
    async $route(to, from) {
      if( to.params != from.params ){
        await this.loadData();
      }
    }
  },
  created: async function(){
    this.$router.app.selectedMenu="equipment";
    await this.loadData();
  },
  methods: {
    loadData : async function(){
      try{
        this.message = "Loading...";
        this.error = null;
        
        await this.loadEquipment();
        
        await Promise.all([
          this.loadEquipmentGroups(),
        ]);
        this.message = "";
      } catch (err){
        this.error = `Couldn't load equipment data.`;
        console.error(err);
      } 
    },
    
    loadEquipment : async function(){
      if(!this.$route.params.id || this.$route.params.id === 'new'){
        this.equipment = {};
        return;
      }
      try{ 
        this.in_process++;
        this.message="Loading...";
        this.equipment = await Vue.mtapi.getEquipment(this.$route.params.id);

      }catch(ex){
        console.error(ex);
        this.error="Couldn't load equipment.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadEquipmentGroups: async function(){
      if(!this.equipment || !this.equipment.id) return;
      try{
        this.in_process++;
        this.equipment_groups = await Vue.mtapi.getEquipmentGroups({
          equipment_id: this.equipment.id,
          order_by: '+model',
          limit: 100
        });
        
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load groups for the equipment.";
      } finally {
        this.in_process--;
      }
    },
    saveAllEquipmentData: async function(){
      try{
        this.message="Saving...";
        await this.saveEquipment();
        
        // await Promise.all([
          
        // ]);

      }catch(ex){
        this.message = "Error saving equipment.";
        this.error = ex.message; 
      }
    },
    saveEquipment: async function(){
      this.in_process++;
      this.message="Saving equipment..."
      try{
        this.equipment = await Vue.mtapi.saveEquipment(this.equipment);
        
      }catch(ex){
        this.message = "Error saving equipment.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
  
   
  }
};