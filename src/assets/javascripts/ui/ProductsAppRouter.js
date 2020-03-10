import Home from './Home.js';
import ProductAdd from './ProductAdd.js';
import ProductList from './ProductList.js';
import ProductForm from './ProductForm.js';
import FamilyList from './FamilyList.js';
import FamilyForm from './FamilyForm.js';

let router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/product', component: ProductList, props: (route) => ({ page: parseInt(route.query.page) }) },
    { path: '/product/new', component: ProductAdd},
    { path: '/product/:id', component: ProductForm},
    { path: '/family', component: FamilyList, props: (route) => ({ page: parseInt(route.query.page) }) },
    { path: '/family/:id', component: FamilyForm},
    { path: '/equipment', component: Home},
    { path: '/group', component: Home},
    // { path: '/family', component: Family},
    // { path: '/equipment', component: Equipment},
    // { path: '/group', component: Group},
  ]
});

export default router;