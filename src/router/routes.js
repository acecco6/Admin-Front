const routes = [
  // ——— Rutas públicas (solo invitados) ———
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  // ——— Rutas protegidas del panel de administración ———
  {
    path: '/',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true, label: 'Dashboard', icon: 'dashboard' },
      },
      // ——— Agregá tus rutas aquí ———
      {
        path: 'profesiones',
        name: 'profesiones',
        component: () => import('pages/ProfesionesPage.vue'),
        meta: { requiresAuth: true, label: 'Profesiones', icon: 'work' },
      },
      // {
      //   path: 'usuarios',
      //   name: 'usuarios',
      //   component: () => import('pages/UsuariosPage.vue'),
      //   meta: { requiresAuth: true, label: 'Usuarios', icon: 'people' },
      // },
    ],
  },

  // ——— 404 ———
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
