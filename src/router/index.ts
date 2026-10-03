import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
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
      component: () => import('../views/CatalogView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue'),
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
