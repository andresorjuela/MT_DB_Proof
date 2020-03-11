'use strict'
export default {
  name: "tree-selector-input",
  template: /*html*/`
<div class="mt-ts-input">
  <tree-selector :children="tree.children" :root=true @selected="onSelected" ></tree-selector>
  <input type="hidden" :value="value" />
  <b-form-input readonly :value="display_value" />
</div>
`,
  props:{
    value: [String, Number],
    root: {type: Boolean, default: true},
    node_id: { type: String },
    list: { type: Array }
  },
  data:function(){
    return {
      tree: null,
      value_copy: null,
    };
  },
  created: function(){
    this.tree = {
      label: "category",
      label_zh: "类别",
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
          return selection.name_en;
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
      console.log(`Node ${payload.id} selected.`);
      this.value_copy = payload.id;
      this.$emit('input', payload.id);//compatible for v-model
    }
  }
}