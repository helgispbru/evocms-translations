import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(), // import.meta.env.BASE_URL
  routes: [
    { path: '/', redirect: { name: 'language' } },
    { // так как модуль по умолчанию запускается с таким адресом
      path: '/manager/index.php',
      redirect: { name: 'language' },
    },
    {
      path: '/language',
      name: 'language',
      component: () => import('@/views/page-languages.vue'),
    },
    {
      path: '/group',
      name: 'group',
      component: () => import('@/views/page-groups.vue'),
    },
    {
      path: '/entry',
      name: 'entry',
      component: () => import('@/views/page-entries.vue'),
    },
  ],
})

export default router
