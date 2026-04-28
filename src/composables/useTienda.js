import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { getProductos } from 'src/services/productoService'
import { createVenta, getVentas, getVentaDetalle } from 'src/services/ventaService'

export function useTienda() {
  const $q = useQuasar()
  const productos = ref([])
  const ventas = ref([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchProductos() {
    loading.value = true
    try {
      productos.value = await getProductos()
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al cargar productos', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function fetchVentas(sucursal_id) {
    loading.value = true
    try {
      ventas.value = await getVentas(sucursal_id)
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al cargar ventas', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function fetchVentaDetalle(sucursal_id, id) {
    try {
      return await getVentaDetalle(sucursal_id, id)
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al cargar detalle de la venta', icon: 'error' })
      throw e
    }
  }

  async function guardarVenta(payload) {
    saving.value = true
    try {
      const result = await createVenta(payload)
      $q.notify({ type: 'positive', message: 'Venta creada exitosamente', icon: 'shopping_bag' })
      return result
    } catch (e) {
      const errors = e.response?.data?.errors
      const msg = errors ? Object.values(errors)[0]?.[0] : e.response?.data?.message || 'Error al crear la venta'
      $q.notify({ type: 'negative', message: msg, icon: 'error' })
      throw e
    } finally {
      saving.value = false
    }
  }

  return { productos, ventas, loading, saving, fetchProductos, fetchVentas, fetchVentaDetalle, guardarVenta }
}
