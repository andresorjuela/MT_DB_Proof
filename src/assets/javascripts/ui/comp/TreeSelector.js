'use strict'
export default {
  name: "tree-selector",
  template: /*html*/`
<ol :class="root?'mt-ts-list-root':'mt-ts-list'">
  <li class="mt-ts-list-item" v-for="(n, idx) in children" :key="idx">
    <span class="mt-ts-actionable open"    v-if="n.children && n.children.length > 0 && !isHidden"  @click="toggleItem(n)">&#9660;</span>
    <span class="mt-ts-actionable closed"  v-if="n.children && n.children.length > 0 && isHidden" @click="toggleItem(n)">&#9654;</span>
    <b-badge href="#" :variant="n.id==value?'success':'light'" pill  @click="itemClicked(n)">{{n.name_en}}</b-badge>
    <tree-selector v-if="n.children && n.children.length > 0" :children="n.children" v-show="!isHidden(n)" :root=false @selected="itemClicked"></tree-selector>
  </li>
</ol>
`,
  props:{
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
    if(this.children[0].parent_id){
      this.show.push(this.children[0].parent_id)
    }
  },
  methods:{
    isHidden: function(node){
      return !this.show.includes(node.id);
    },
    toggleItem: function(node){
      let i = this.show.indexOf(node.id);
      if(i>=0){ 
        this.show.splice(i,1);
      } else {
        this.show.push(node.id);
      }

    },
    itemClicked: function(node){
      this.$emit("selected", node); 
    },
  }
}