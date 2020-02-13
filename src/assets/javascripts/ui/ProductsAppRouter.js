import Home from './Home.js';
import Product from './Product.js';
import Family from './Family.js';

let router = new VueRouter({
  //mode: "history",
  routes: [
    { path: '/', component: Home },
    { path: '/product', component: Product},
    { path: '/family', component: Family},
    { path: '/equipment', component: Home},
    { path: '/group', component: Home},
    // { path: '/family', component: Family},
    // { path: '/equipment', component: Equipment},
    // { path: '/group', component: Group},
  ]
});

export default router;