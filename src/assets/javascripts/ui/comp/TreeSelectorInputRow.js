'use strict'
export default {
  name: "tree-selector-input",
  template: /*html*/`
<b-row>
  <b-col :cols="parseInt(labelCols)">
    <label>{{label}}</label>
  </b-col>
  <b-col class="mt-ts-input" :cols="parseInt(treeCols)">
    <tree-selector :children="tree.children" :root=true @selected="onSelected" :id_field="id_field" :parent_id_field="parent_id_field" :text_field="text_field" style="height: 10em; overflow: auto;" ></tree-selector>
    <input type="hidden" :value="value" />
  </b-col>
  <b-col :cols="parseInt(valueCols)">
    <b-form-input readonly :value="display_value" />
  </b-col>
</b-row>
`,
  props:{
    label: {type: String},
    labelCols: {type: String, default: 2},
    treeCols: {type: String, default: 4},
    valueCols: {type: String},
    text_field: {type: String, default: "name_en"},
    id_field: {type: String, default: "id"},
    parent_id_field: {type: String, default: "parent_id"},
    value: [String, Number],
    root: {type: Boolean, default: true},
    list: { type: Array },
    
    display_ancestors: {type: Boolean, default: false}
  },
  data:function(){
    return {
      tree: null,
      value_copy: null,
    };
  },
  created: function(){
    this.tree = {
      label: this.label,
      children: []
    };

    //Rebuild the category tree.
    let roots = this.list_to_tree(this.list);
    this.tree.children = roots;
    this.value_copy = this.value;
  },
  computed: {
    display_value: function(){
      if(typeof this.value_copy !== 'undefined' && this.value_copy !== null){
        let selection = this.list.find((v)=>{return v.id == this.value_copy;});
        if(selection){
          let ancestors = [];
          let current_ancestor = selection;
          if(this.display_ancestors){
            for(let i=0; i<100; i++){//assume depth is less than 100
              current_ancestor = this.list.find((v)=>{ return v.id == current_ancestor.parent_id;})
              if(!current_ancestor){
                break;
              } else {
                ancestors.splice(0,0,current_ancestor[this.text_field]);
              }
            }
          }
          let to_display = selection[this.text_field];
          if(ancestors.length > 0){
            to_display += ` (${ancestors.join("/")})`;
          }
          return to_display;
        }
      }
      return '';
    }
  },
  methods:{
    list_to_tree(list) {
      var map = {}, node, roots = [], i;
      for (i = 0; i < list.length; i += 1) {
          map[list[i].id] = i; // initialize the map
          list[i].children = []; // initialize the children
      }
      for (i = 0; i < list.length; i += 1) {
          node = list[i];
          if (node.parent_id) {
              // if you have dangling branches check that map[node.parent_id] exists
              list[map[node.parent_id]].children.push(node);
          } else {
              roots.push(node);
          }
      }
      return roots;
    },
    onSelected: function(payload){
      // console.log(`Node ${payload.id} selected.`);
      this.value_copy = payload[this.id_field];
      this.$emit('input', payload[this.id_field]);//compatible for v-model
    }
  }
}