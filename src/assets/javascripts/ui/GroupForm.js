'use strict'
import { ApiError } from "../Api.js";
export default {
  template: /*html*/
  `
<div class="mt-1" v-cloak>
  
  <b-row no-gutters class="bg-light mb-2" align-v="center">
    <b-col class="pl-2" >
      <span v-cloak class="h5" v-if="group && group.id">Editing Group: {{group.group_code}}</span>
    </b-col>
    <b-col>
      <b-spinner small variant="secondary" v-if="busy"/>
      <span class="p2 text-info" v-if="hasMessage" variant="info">{{ message }}</span>
      <span class="p2 text-danger" v-if="!busy && hasError" variant="danger">{{ error }}</span>
    </b-col>
    <b-col class="text-right">
      <b-button small variant="success" @click="saveAllGroupData" :disabled="busy">
        <b-icon-cloud-upload />&nbsp;Save
      </b-button>
    </b-col>
  </b-row>
  
  <b-form v-if="group">
    <b-form-row>
      <b-col>
        <b-form-group label="Group Code:" label-cols="4" >
          <b-form-input v-model="group.group_code" />
        </b-form-group>
      </b-col>
    
    </b-form-row>

    <b-form-row>
      <b-col cols="6">
        <b-form-group label="Equipment Models:" label-cols="4" for="eqlisttext">
          <b-form-input placeholder="model / brand" @input="filter_as_typed" v-model="filter" debounce="200"></b-form-input>
          <b-list-group>
            <b-list-group-item action v-for="(equip,idx) in equip_filtered" @click="addGroupEquipment(equip)" :key="idx">{{equip.label}}</b-list-group-item>
          </b-list-group>
        </b-form-group>
      </b-col>
      <b-col cols="6">
        <b-form-group label="Equipment in this Group:" label-cols="4" >
          <span class="h6">
            <b-badge href="#" variant="light" v-for="(grequip,idx) in group_equipment" :key="idx" pill>{{grequip.model}}
              <b-icon-x variant="danger" @click="removeGroupEquipment(grequip)" ></b-icon-x>
            </b-badge>
          </span>
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
      group: null,
      filter: '',
      equip_filtered: [],//holds equipment data
      equipment: [],
      group_equipment: [] 
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
    this.$router.app.selectedMenu="group";
    await this.loadData();
  },
  methods: {
    filter_as_typed: function(v){
      if(!v){ 
        this.equip_filtered = [];
        return;
      }
      this.equip_filtered = this.equipment.filter(function(eq){ 
        return eq.model.includes(v) 
        || eq.brand_en.includes(v) 
        || eq.brand_zh.includes(v);
      });
    },
    addGroupEquipment(equipment){
      let self = this;
      if(equipment){
        let existing = this.group_equipment.find(function(ge){
          return ge.equipment_id == equipment.id && 
            ge.group_id == self.group.id;
        });
        if(!existing){
          this.group_equipment.push({
            model: equipment.model,
            equipment_id: equipment.id,
            group_id: self.group.id
          });
        }
      }
      this.equip_filtered = [];
    },
    removeGroupEquipment(grequip){
      let self = this;
      if(grequip){
        let existingIdx = this.group_equipment.findIndex(function(ge){
          return ge.equipment_id == grequip.equipment_id && 
            ge.group_id == self.group.id;
        });
        if(existingIdx>=0){
          this.group_equipment.splice(existingIdx,1);
        }
      }
    },
    loadData : async function(){
      try{
        this.message = "Loading...";
        this.error = null;
        
        await this.loadGroup();
        
        await Promise.all([
          this.loadEquipment(),
          this.loadGroupEquipment(),
        ]);
        
      } catch (err){
        this.error = `Couldn't load group data.`;
        console.error(err);
      }
    },
    loadEquipment: async function(){
      try{
        this.in_process++;
        this.equipment = await Vue.mtapi.getEquipmentList({limit:1000});
        
        //decorate with label
        this.equipment.forEach(eq=>{
          eq.label = `${eq.model} / ${eq.brand_en}`;
        });

      }catch(ex){
        console.error(ex);
        this.error="Couldn't load equipment.";
      } finally {
        this.in_process--;
      }
    },
    loadGroup : async function(){
      try{
        if(!this.$route.params.id || this.$route.params.id === 'new'){
          this.group = {};
          return;
        }
        this.in_process++;
        this.message="Loading...";
        this.group = await Vue.mtapi.getGroup(this.$route.params.id);

      }catch(ex){
        console.error(ex);
        this.error="Couldn't load group.";
      } finally {
        this.message = null;
        this.in_process--;
      }
    },
    loadGroupEquipment: async function(){
      if(!this.group || !this.group.id) return;
      try{
        this.in_process++;
        this.group_equipment = await Vue.mtapi.getGroupEquipment(this.group.id,{
          order_by: '+model',
          limit: 100
        });
        
      }catch(ex){
        console.error(ex);
        this.error="Couldn't load equipment for the group.";
      } finally {
        this.in_process--;
      }
    },
    saveAllGroupData: async function(){
      try{
        this.message="Saving...";
        await this.saveGroup();
        
        await Promise.all([
          this.saveGroupEquipment()
        ]);

      }catch(ex){
        this.message = "Error saving group.";
        this.error = ex.message; 
      }
    },
    saveGroup: async function(){
      this.in_process++;
      this.message="Saving group..."
      try{
        this.group = await Vue.mtapi.saveGroup(this.group);
        this.$emit('reload', this.group);//tell parent to reload.
      }catch(ex){
        this.message = "Error saving group.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
    saveGroupEquipment: async function(){
      this.in_process++;
      this.message="Saving equipment..."
      try{
        await Vue.mtapi.saveGroupEquipment(
          this.group.id,
          this.group_equipment.map(eg=>{return eg.equipment_id; })
        );
        
      }catch(ex){
        this.message = "Error saving equipment for group.";
        this.error = ex.message; 
      }finally{
        this.in_process--;
        this.message="";
      }
    },
   
  }
};