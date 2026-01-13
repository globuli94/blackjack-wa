const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/GamePage.vue'),
        // No requiresAuth - History and Rules are public
        // Game actions are protected by backend Firebase authentication
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('pages/AuthPage.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
