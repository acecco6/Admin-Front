import { api } from 'src/services/http/api'

/**
 * Cobra el pago de una reserva.
 * @param {{ reserva_id: number, monto: number, metodo_pago: string, referencia?: string }} payload
 */
export function cobrarReserva(payload) {
  return api.post('/api/pago/reserva', payload).then((r) => r.data)
}

/**
 * Cobra el pago de una venta de tienda.
 * @param {{ venta_id: number, monto: number, metodo_pago: string, referencia?: string }} payload
 */
export function cobrarTienda(payload) {
  return api.post('/api/pago/tienda', payload).then((r) => r.data)
}

/**
 * Obtiene el historial de pagos paginado.
 * @param {object} params - Filtros (sucursal_id, page, per_page, fecha)
 */
export function getPagos(params) {
  return api.get('/api/pago', { params }).then((r) => r.data)
}

/**
 * Obtiene los ingresos totales filtrados por sucursal.
 * @param {number} sucursal_id
 */
export function getIngresosTotales(sucursal_id) {
  return api.get('/api/pago/ingresos-totales', { params: { sucursal_id } }).then((r) => r.data)
}

/**
 * Obtiene los ingresos por reservas filtrados por sucursal.
 * @param {number} sucursal_id
 */
export function getIngresosReservas(sucursal_id) {
  return api.get('/api/pago/ingresos-reservas', { params: { sucursal_id } }).then((r) => r.data)
}

/**
 * Obtiene los ingresos por tienda filtrados por sucursal.
 * @param {number} sucursal_id
 */
export function getIngresosTienda(sucursal_id) {
  return api.get('/api/pago/ingresos-tienda', { params: { sucursal_id } }).then((r) => r.data)
}
