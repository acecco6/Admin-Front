import { api } from 'src/services/http/api'

/**
 * Obtiene el catálogo de productos disponibles.
 */
export async function getProductos(sucursal_id) {
  const r = await api.get('/api/producto', {
    params: { sucursal_id },
  })
  return r.data.data ?? r.data
}

/**
 * Actualiza el stock de los productos indicados.
 */
export async function actualizarStockTienda(sucursal_id, productos) {
  const r = await api.get('/api/producto/actualizar-tienda', {
    params: { sucursal_id, productos },
  })
  return r.data.data ?? r.data
}
