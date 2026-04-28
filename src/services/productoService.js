import { api } from 'src/services/http/api'

/**
 * Obtiene el catálogo de productos disponibles.
 */
export function getProductos() {
  return api.get('/api/producto/').then((r) => r.data.data ?? r.data)
}
