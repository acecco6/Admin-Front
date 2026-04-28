import { api } from 'src/services/http/api'

/**
 * Obtiene el stock de productos de una sucursal.
 * @param {number} sucursal_id
 */
export function getStock(sucursal_id) {
  return api.get('/api/stock/search', { params: { sucursal_id } }).then((r) => r.data.data ?? r.data)
}

/**
 * Actualiza la cantidad de un producto en el stock.
 * @param {{ producto_id: number, sucursal_id: number, cantidad: number }} payload
 */
export function updateStock(payload) {
  return api.put('/api/stock/update', payload).then((r) => r.data)
}
