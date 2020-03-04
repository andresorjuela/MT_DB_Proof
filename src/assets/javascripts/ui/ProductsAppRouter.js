import Home from './Home.js';
import ProductAdd from './ProductAdd.js';
import ProductList from './ProductList.js';
import ProductForm from './ProductForm.js';
import FamilyList from './FamilyList.js';

let router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/product', component: ProductList},
    { path: '/product/new', component: ProductAdd},
    { path: '/product/:id', component: ProductForm},
    { path: '/family', component: FamilyList},
    { path: '/equipment', component: Home},
    { path: '/group', component: Home},
    // { path: '/family', component: Family},
    // { path: '/equipment', component: Equipment},
    // { path: '/group', component: Group},
  ]
});

export default router;