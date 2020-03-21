'use strict'
export default {
  name: "tree-selector",
  template: /*html*/`
<ol :class="root?'mt-ts-list-root':'mt-ts-list'">
  <li class="mt-ts-list-item" v-for="(n, idx) in children" :key="idx">
    <span class="mt-ts-actionable open"    v-if="n.children && n.children.length > 0 && !isHidden"  @click="toggleItem(n)">&#9660;</span>
    <span class="mt-ts-actionable closed"  v-if="n.children && n.children.length > 0 && isHidden" @click="toggleItem(n)">&#9654;</span>
    <b-badge href="#" :variant="n.id==value?'success':'light'" pill  @click="itemClicked(n)">{{getLabel(n)}}</b-badge>
    <tree-selector v-if="n.children && n.children.length > 0" :children="n.children" v-show="!isHidden(n)" :root=false @selected="itemClicked"></tree-selector>
  </li>
</ol>
`,
  props:{
    id_field: { type: String, default: "id"},
    parent_id_field: { type: String, default: "parent_id" },
    text_field: { type: String, default: "name_en"},
    value: { type: Object },
    root: {type: Boolean, default: true},
    label: { type: String },
    children: { type: Array }
  },
  data:function(){
    return {
      show: []
    }
  },
  created: function(){
    if(this.children[0][this.parent_id]){
      this.show.push(this.children[0][this.parent_id])
    }
  },
  methods:{
    getLabel: function(node){
      return node[this.text_field]
    },
    isHidden: function(node){
      return !this.show.includes(node[this.id_field]);
    },
    toggleItem: function(node){
      let i = this.show.indexOf(node[this.id_field]);
      if(i>=0){ 
        this.show.splice(i,1);
      } else {
        this.show.push(node[this.id_field]);
      }

    },
    itemClicked: function(node){
      this.$emit("selected", node); 
    },
  }
}