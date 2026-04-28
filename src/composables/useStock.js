import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { getStock, updateStock } from 'src/services/stockService'

export function useStock() {
  const $q = useQuasar()
  const stockItems = ref([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchStock(sucursal_id) {
    loading.value = true
    try {
      stockItems.value = await getStock(sucursal_id)
    } catch (e) {
      $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al cargar el stock', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function actualizarStock(payload) {
    saving.value = true
    try {
      await updateStock(payload)
      $q.notify({ type: 'positive', message: 'Stock actualizado correctamente', icon: 'inventory_2' })
      return true
    } catch (e) {
      const errors = e.response?.data?.errors
      const msg = errors ? Object.values(errors)[0]?.[0] : e.response?.data?.message || 'Error al actualizar stock'
      $q.notify({ type: 'negative', message: msg, icon: 'error' })
      return false
    } finally {
      saving.value = false
    }
  }

  return { stockItems, loading, saving, fetchStock, actualizarStock }
}
