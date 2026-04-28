import { api } from 'src/services/http/api'

/**
 * @typedef {Object} TipoCancha
 * @property {number} id
 * @property {string} nombre
 * @property {number} duracion_minima_minutos
 * @property {number} intervalo_minutos
 */

/**
 * Obtiene todos los tipos de cancha.
 * @returns {Promise<TipoCancha[]>}
 */
export function getTipoCanchas() {
  return api.get('/api/tipo-cancha').then((r) => r.data.data)
}

/**
 * Obtiene un tipo de cancha por ID.
 * @param {number} id
 * @returns {Promise<TipoCancha>}
 */
export function getTipoCancha(id) {
  return api.get('/api/tipo-cancha/search', { params: { id } }).then((r) => r.data.data)
}

/**
 * Crea un nuevo tipo de cancha.
 * @param {{ nombre: string, duracion_minima_minutos: number, intervalo_minutos: number }} payload
 * @returns {Promise<TipoCancha>}
 */
export function createTipoCancha(payload) {
  return api.post('/api/tipo-cancha', payload).then((r) => r.data.data)
}

/**
 * Actualiza un tipo de cancha.
 * @param {{ id: number, nombre: string, duracion_minima_minutos: number, intervalo_minutos: number }} payload
 * @returns {Promise<TipoCancha>}
 */
export function updateTipoCancha(payload) {
  return api.put('/api/tipo-cancha/update', payload).then((r) => r.data.data)
}

/**
 * Elimina un tipo de cancha.
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteTipoCancha(id) {
  return api.delete('/api/tipo-cancha/delete', { params: { id } }).then((r) => r.data)
}
