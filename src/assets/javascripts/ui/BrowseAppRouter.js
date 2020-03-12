import ProductDisplay from './ProductDisplay.js';

let router = new VueRouter({
  routes: [
    { path: '/:id', component: ProductDisplay },
  ]
});

export default router;