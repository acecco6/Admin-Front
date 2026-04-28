import { api } from 'src/services/http/api'

/**
 * Obtiene lista de ventas de una sucursal.
 * @param {number} sucursal_id
 */
export function getVentas(sucursal_id) {
  return api.get('/api/venta/', { params: { sucursal_id } }).then((r) => r.data.data ?? r.data)
}

/**
 * Obtiene detalle completo de una venta.
 * @param {number} sucursal_id
 * @param {number} id
 */
export function getVentaDetalle(sucursal_id, id) {
  return api.get('/api/venta/search/', { params: { sucursal_id, id } }).then((r) => r.data.data)
}

/**
 * Crea una nueva venta.
 * @param {{ sucursal_id: number, reserva_id?: number|null, productos: Array<{ producto_id: number, cantidad: number }> }} payload
 */
export function createVenta(payload) {
  return api.post('/api/venta/', payload).then((r) => r.data)
}
