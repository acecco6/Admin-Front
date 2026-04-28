import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  getTipoCanchas,
  createTipoCancha,
  updateTipoCancha,
  deleteTipoCancha,
} from 'src/services/tipoCanchaService'

export function useTipoCanchas() {
  const $q = useQuasar()
  const tipoCanchas = ref([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchTipoCanchas() {
    loading.value = true
    try {
      tipoCanchas.value = await getTipoCanchas()
    } catch (e) {
      $q.notify({ type: 'negative', message: e.response?.message || 'Error al cargar tipos de cancha', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function saveTipoCancha(payload) {
    saving.value = true
    try {
      let resultado
      if (payload.id) {
        resultado = await updateTipoCancha(payload)
        const idx = tipoCanchas.value.findIndex((t) => t.id === payload.id)
        if (idx !== -1) tipoCanchas.value[idx] = resultado
        $q.notify({ type: 'positive', message: 'Tipo de cancha actualizado', icon: 'check_circle' })
      } else {
        resultado = await createTipoCancha(payload)
        tipoCanchas.value.unshift(resultado)
        $q.notify({ type: 'positive', message: 'Tipo de cancha creado', icon: 'add_task' })
      }
      return resultado
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al guardar'
      $q.notify({ type: 'negative', message: msg, icon: 'error' })
      throw e
    } finally {
      saving.value = false
    }
  }

  async function eliminarTipoCancha(tipo) {
    return new Promise((resolve, reject) => {
      $q.dialog({
        title: 'Eliminar Tipo de Cancha',
        message: `¿Confirmas la eliminación de "${tipo.nombre}"?`,
        persistent: true,
        dark: true,
        ok: { label: 'Eliminar', push: true, color: 'negative' },
        cancel: { label: 'Cancelar', flat: true, color: 'white' },
      }).onOk(async () => {
        try {
          await deleteTipoCancha(tipo.id)
          tipoCanchas.value = tipoCanchas.value.filter((t) => t.id !== tipo.id)
          $q.notify({ type: 'negative', message: 'Tipo eliminado', icon: 'delete' })
          resolve()
        } catch (e) {
          $q.notify({ type: 'negative', message: 'Error al eliminar', icon: 'error' })
          reject(e)
        }
      }).onCancel(() => resolve())
    })
  }

  return { tipoCanchas, loading, saving, fetchTipoCanchas, saveTipoCancha, eliminarTipoCancha }
}
