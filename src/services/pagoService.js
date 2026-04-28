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
