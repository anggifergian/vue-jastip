import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import CartView from '../views/CartView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: CatalogView,
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
    },
    {
      path: '/product/:slug',
      name: 'product-detail',
      component: ProductDetailView,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/orders/confirmation/:orderNumber',
      name: 'order-confirmation',
      component: () => import('../views/OrderConfirmationView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: () => import('../views/admin/AdminProductsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/products/new',
      name: 'admin-product-new',
      component: () => import('../views/admin/AdminProductFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/products/edit/:id',
      name: 'admin-product-edit',
      component: () => import('../views/admin/AdminProductEditView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.guestOnly) return true

  const { data } = await supabase.auth.getSession()
  const isLoggedIn = !!data.session

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && isLoggedIn) {
    return { name: 'admin-product-new' }
  }

  return true
})

export default router
