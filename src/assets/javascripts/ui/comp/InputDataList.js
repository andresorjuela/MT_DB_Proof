'use strict'
export default {
  template: /*html*/
  `
<b-form-group :label="label" :label-cols="label-cols" >
  <b-form-input placeholder="model / brand" @input="filter_as_typed" v-model="current" debounce="200"></b-form-input>
  <b-list-group>
    <b-list-group-item action v-for="(equip,idx) in filter_options" @click="addGroupEquipment(equip)" :key="idx">{{equip.label}}</b-list-group-item>
  </b-list-group>
</b-form-group>
`,
  data (){
    return {
      current: '',
      filter_options: [],
    }
  },
  props: {
    label: { type: String, required: false},
    "label-cols": { type: String, default: 2, required: false},
    placeholder: { type: String, default: 'type to filter', required: false},
    options: {type: Array, required: true}
  },
  created: async function(){},
  methods: {
    filter_as_typed: function(v){
      if(!v){ 
        this.options = [];
        return;
      }
      this.options = this.equipment.filter(function(eq){ 
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
            group: self.group.id
          });
        }
      }
      this.filter_options = [];
    },
    removeGroupEquipment(equipment){
      let self = this;
      if(equipment){
        let existingIdx = this.group_equipment.findIndex(function(ge){
          return ge.equipment_id == equipment.id && 
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
      if(!this.group || !this.group.id) return;
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
        this.group = await Vue.mtapi.saveGroupEquipment(
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