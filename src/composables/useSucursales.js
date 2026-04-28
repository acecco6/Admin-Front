import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  getSucursales,
  createSucursal,
  updateSucursal,
  toggleSucursalEstado,
  deleteSucursal,
} from 'src/services/sucursalService'

export function useSucursales() {
  const $q = useQuasar()
  const sucursales = ref([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchSucursales() {
    loading.value = true
    try {
      sucursales.value = await getSucursales()
    } catch (e) {
      $q.notify({ type: 'negative', message: e.response?.message || 'Error al cargar sucursales', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function saveSucursal(payload) {
    saving.value = true
    try {
      let resultado
      if (payload.id) {
        resultado = await updateSucursal(payload)
        const idx = sucursales.value.findIndex((s) => s.id === payload.id)
        if (idx !== -1) sucursales.value[idx] = resultado
        $q.notify({ type: 'positive', message: 'Sucursal actualizada', icon: 'check_circle' })
      } else {
        resultado = await createSucursal(payload)
        sucursales.value.unshift(resultado)
        $q.notify({ type: 'positive', message: 'Sucursal creada', icon: 'add_task' })
      }
      return resultado
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al guardar la sucursal'
      $q.notify({ type: 'negative', message: msg, icon: 'error' })
      throw e
    } finally {
      saving.value = false
    }
  }

  async function cambiarEstado(sucursal) {
    try {
      const actualizada = await toggleSucursalEstado(sucursal.id)
      const idx = sucursales.value.findIndex((s) => s.id === sucursal.id)
      if (idx !== -1) sucursales.value[idx] = actualizada
      $q.notify({ type: 'info', message: `Estado actualizado a ${actualizada.estado === 'A' ? 'Activo' : 'Inactivo'}`, icon: 'swap_horiz' })
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al cambiar estado', icon: 'error' })
      throw e
    }
  }

  async function eliminarSucursal(sucursal) {
    return new Promise((resolve, reject) => {
      $q.dialog({
        title: 'Eliminar Sucursal',
        message: `¿Confirmas la eliminación de "${sucursal.nombre}"? Esta acción no se puede deshacer.`,
        persistent: true,
        dark: true,
        ok: { label: 'Eliminar', push: true, color: 'negative' },
        cancel: { label: 'Cancelar', flat: true, color: 'white' },
      }).onOk(async () => {
        try {
          await deleteSucursal(sucursal.id)
          sucursales.value = sucursales.value.filter((s) => s.id !== sucursal.id)
          $q.notify({ type: 'negative', message: 'Sucursal eliminada', icon: 'delete' })
          resolve()
        } catch (e) {
          $q.notify({ type: 'negative', message: 'Error al eliminar', icon: 'error' })
          reject(e)
        }
      }).onCancel(() => resolve())
    })
  }

  return { sucursales, loading, saving, fetchSucursales, saveSucursal, cambiarEstado, eliminarSucursal }
}
