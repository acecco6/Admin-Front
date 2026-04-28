import { api } from 'src/services/http/api'

// ─── Reservas diarias ────────────────────────────────────────────────────────

/**
 * Obtiene horarios disponibles de una sucursal para una fecha.
 * @param {number} sucursal_id
 * @param {string} fecha  - "YYYY-MM-DD"
 * @param {number} minutos
 * @param {number} tipo_cancha_id
 * @returns {Promise<Object>}
 */
export function getDisponibilidad(sucursal_id, fecha, minutos, tipo_cancha_id) {
  return api.get('/api/reservas/disponibilidad', { params: { sucursal_id, fecha, minutos, tipo_cancha_id } }).then((r) => r.data.data)
}

/**
 * Obtiene canchas con sus ocupaciones para una sucursal y fecha.
 * @param {number} sucursal_id
 * @param {string} fecha  - "YYYY-MM-DD"
 * @returns {Promise<Object>}
 */
export function getReservasCancha(sucursal_id, fecha, tipo_cancha_id) {
  return api.get('/api/reservas/cancha', { params: { sucursal_id, fecha, tipo_cancha_id } }).then((r) => r.data.data)
}

/**
 * Obtiene detalle de una reserva diaria por ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export function getReserva(id) {
  return api.get('/api/reservas/search', { params: { id } }).then((r) => r.data.data)
}

/**
 * Crea una nueva reserva diaria.
 * @param {{ cancha_id: number, fecha: string, hora_inicio: string, hora_fin: string, nombre: string, apellido: string, email: string, documento: string, telefono?: string }} payload
 * @returns {Promise<Object>}
 */
export function createReserva(payload) {
  return api.post('/api/reservas', payload).then((r) => r.data.data)
}

// ─── Reservas fijas ───────────────────────────────────────────────────────────

/**
 * Obtiene grilla de reservas fijas de una cancha.
 * Respuesta: array de { hora, dias_reservas: { 0..6: null | { nombre, apellido, email, hora_inicio, hora_fin, dia_semana } } }
 * @param {number} sucursal_id
 * @param {number} cancha_id
 * @returns {Promise<Array>}
 */
export function getReservasFijas(sucursal_id, cancha_id) {
  return api.get('/api/reservas/fijas', { params: { sucursal_id, cancha_id } }).then((r) => r.data.data)
}

/**
 * Obtiene detalle de una reserva fija por ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export function getReservaFija(id) {
  return api.get('/api/reservas/fijas/search', { params: { id } }).then((r) => r.data.data)
}

/**
 * Crea una nueva reserva fija.
 * @param {{ cancha_id: number, dia_semana: number, hora_inicio: string, hora_fin: string, fecha_inicio: string, fecha_fin: string, nombre: string, apellido: string, email: string, documento: string }} payload
 * @returns {Promise<Object>}
 */
export function createReservaFija(payload) {
  return api.post('/api/reservas/fijas', payload).then((r) => r.data.data)
}
