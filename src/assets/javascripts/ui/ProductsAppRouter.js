import Home from './Home.js';
import ProductAdd from './ProductAdd.js';
import ProductList from './ProductList.js';
import ProductForm from './ProductForm.js';
import FamilyList from './FamilyList.js';
import FamilyForm from './FamilyForm.js';
import GroupList from './GroupList.js';
import GroupForm from './GroupForm.js';
import EquipmentList from './EquipmentList.js';
// import EquipmentForm from './EquipmentForm.js';

let router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    
    { path: '/product', component: ProductList, props: (route) => ({ page: parseInt(route.query.page) }) },
    { path: '/product/new', component: ProductAdd},
    { path: '/product/:id', component: ProductForm},
    
    { path: '/family', component: FamilyList, props: (route) => ({ page: parseInt(route.query.page) }) },
    { path: '/family/new', component: FamilyForm},
    { path: '/family/:id', component: FamilyForm},
    
    { path: '/equipment', component: EquipmentList, props: (route) => ({ page: parseInt(route.query.page) }) },
    // { path: '/equipment/new', component: EquipmentForm},
    // { path: '/equipment/:id', component: EquipmentForm},
    
    { path: '/group', component: GroupList, props: (route) => ({ page: parseInt(route.query.page) }) },
    { path: '/group/new', component: GroupForm},
    { path: '/group/:id', component: GroupForm}, 
  ]
});

export default router;