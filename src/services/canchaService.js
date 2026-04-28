import { api } from 'src/services/http/api'

/**
 * @typedef {Object} Cancha
 * @property {number} id
 * @property {number} sucursal_id
 * @property {number} tipo_cancha_id
 * @property {string} nombre
 * @property {string} precio_base
 * @property {boolean} activa
 * @property {{ id: number, nombre: string }} [tipo]
 */

/**
 * Obtiene todas las canchas agrupadas por sucursal.
 * @returns {Promise<Array<{ id: number, nombre: string, canchas: Cancha[] }>>}
 */
export function getCanchas() {
  return api.get('/api/cancha').then((r) => r.data.data)
}

/**
 * Obtiene una cancha por ID.
 * @param {number} id
 * @returns {Promise<Cancha>}
 */
export function getCancha(id) {
  return api.get('/api/cancha/search', { params: { id } }).then((r) => r.data.data)
}

/**
 * Crea una nueva cancha.
 * @param {{ sucursal_id: number, tipo_cancha_id: number, nombre: string, precio_base: number }} payload
 * @returns {Promise<Cancha>}
 */
export function createCancha(payload) {
  return api.post('/api/cancha', payload).then((r) => r.data.data)
}

/**
 * Actualiza una cancha existente.
 * @param {{ id: number, sucursal_id: number, tipo_cancha_id: number, nombre: string, precio_base: number }} payload
 * @returns {Promise<Cancha>}
 */
export function updateCancha(payload) {
  return api.put('/api/cancha/update', payload).then((r) => r.data.data)
}

/**
 * Cambia el estado activo de una cancha.
 * @param {number} id
 * @returns {Promise<Cancha>}
 */
export function toggleCanchaEstado(id) {
  return api.put('/api/cancha/state-change', { id }).then((r) => r.data.data)
}

/**
 * Elimina una cancha.
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteCancha(id) {
  return api.delete('/api/cancha/delete', { params: { id } }).then((r) => r.data)
}
