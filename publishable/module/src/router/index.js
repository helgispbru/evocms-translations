import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(), // import.meta.env.BASE_URL
  routes: [
    { path: '/', redirect: '/languages' },
    {
      path: '/languages',
      name: 'langs',
      component: () => import('@/views/PageLanguages.vue'),
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('@/views/PageGroups.vue'),
    },
    {
      path: '/entries',
      name: 'entries',
      component: () => import('@/views/PageEntries.vue'),
    },
  ],
})

export default router
