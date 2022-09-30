
const routes = [
  {
    path: '/pizza',
    component: () => import('pages/QnCPizza.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/QnCPizza.vue') },
      {
        path: 'admin',
        component: () => import('pages/Admin.vue')
      }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
