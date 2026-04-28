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
      // ── Dashboard ──────────────────────────────────────────────
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true, label: 'Dashboard' },
      },

      // ── Módulos activos ────────────────────────────────────────
      {
        path: 'sucursales',
        name: 'sucursales',
        component: () => import('src/modules/sucursales/SucursalesPage.vue'),
        meta: { requiresAuth: true, label: 'Sucursales' },
      },
      {
        path: 'tipo-canchas',
        name: 'tipo-canchas',
        component: () => import('src/modules/tipo-canchas/TipoCanchasPage.vue'),
        meta: { requiresAuth: true, label: 'Tipo de Canchas' },
      },
      {
        path: 'reservas',
        meta: { requiresAuth: true, label: 'Reservas' },
        children: [
          {
            path: 'ocupadas',
            name: 'reservas-ocupadas',
            component: () => import('src/modules/reservas/ReservasOcupadasPage.vue'),
            meta: { requiresAuth: true, label: 'Ocupadas' },
          },
          {
            path: 'disponibles',
            name: 'reservas-disponibles',
            component: () => import('src/modules/reservas/ReservasDisponiblesPage.vue'),
            meta: { requiresAuth: true, label: 'Disponibles' },
          },
        ],
      },
      {
        path: 'reservas-fijas',
        name: 'reservas-fijas',
        component: () => import('src/modules/reservas-fijas/ReservasFijasPage.vue'),
        meta: { requiresAuth: true, label: 'Reservas Fijas' },
      },

      // ── Módulos futuros (skeletons) ────────────────────────────
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('src/modules/usuarios/UsuariosPage.vue'),
        meta: { requiresAuth: true, label: 'Usuarios' },
      },
      {
        path: 'stock',
        name: 'stock',
        component: () => import('src/modules/stock/StockPage.vue'),
        meta: { requiresAuth: true, label: 'Stock' },
      },
      {
        path: 'tienda',
        name: 'tienda',
        component: () => import('src/modules/tienda/TiendaPage.vue'),
        meta: { requiresAuth: true, label: 'Tienda' },
      },
      {
        path: 'pagos',
        meta: { requiresAuth: true, label: 'Pagos' },
        children: [
          {
            path: 'nuevo',
            name: 'pagos',
            component: () => import('src/modules/pagos/PagosPage.vue'),
            meta: { requiresAuth: true, label: 'Nuevo Pago' },
          },
          {
            path: 'historial',
            name: 'pagos-historial',
            component: () => import('src/modules/pagos/HistorialPagosPage.vue'),
            meta: { requiresAuth: true, label: 'Historial' },
          },
        ],
      },
    ],
  },

  // ——— 404 ———
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
