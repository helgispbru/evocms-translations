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
      component: () => import('@/views/PageLanguages.vue'),
    },
    {
      path: '/group',
      name: 'group',
      component: () => import('@/views/PageGroups.vue'),
    },
    {
      path: '/entry',
      name: 'entry',
      component: () => import('@/views/PageEntries.vue'),
    },
  ],
})

export default router
