import { api } from 'src/services/http/api'

/**
 * @typedef {Object} Sucursal
 * @property {number} id
 * @property {string} nombre
 * @property {string} direccion
 * @property {string} hora_apertura  - "HH:mm:ss"
 * @property {string} hora_cierre    - "HH:mm:ss"
 * @property {string} estado         - "A" | "B"
 */

/**
 * Obtiene todas las sucursales.
 * @returns {Promise<Sucursal[]>}
 */
export function getSucursales() {
  return api.get('/api/sucursal').then((r) => r.data.data)
}

/**
 * Obtiene una sucursal por ID.
 * @param {number} id
 * @returns {Promise<Sucursal>}
 */
export function getSucursal(id) {
  return api.get('/api/sucursal/search', { params: { id } }).then((r) => r.data.data)
}

/**
 * Crea una nueva sucursal.
 * @param {{ nombre: string, direccion: string, hora_apertura: string, hora_cierre: string }} payload
 * @returns {Promise<Sucursal>}
 */
export function createSucursal(payload) {
  return api.post('/api/sucursal', payload).then((r) => r.data.data)
}

/**
 * Actualiza una sucursal existente.
 * @param {{ id: number, nombre: string, direccion: string, hora_apertura: string, hora_cierre: string }} payload
 * @returns {Promise<Sucursal>}
 */
export function updateSucursal(payload) {
  return api.put('/api/sucursal/update', payload).then((r) => r.data.data)
}

/**
 * Cambia el estado de una sucursal (A ↔ B).
 * @param {number} id
 * @returns {Promise<Sucursal>}
 */
export function toggleSucursalEstado(id) {
  return api.put('/api/sucursal/state-change', { id }).then((r) => r.data.data)
}

/**
 * Elimina una sucursal.
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteSucursal(id) {
  return api.delete('/api/sucursal/delete', { params: { id } }).then((r) => r.data)
}
