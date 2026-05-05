import { ref, watch } from 'vue'

const defaultSucursalId = ref(
  localStorage.getItem('defaultSucursalId') 
    ? Number(localStorage.getItem('defaultSucursalId')) 
    : null
)

watch(defaultSucursalId, (newVal) => {
  if (newVal) {
    localStorage.setItem('defaultSucursalId', newVal)
  } else {
    localStorage.removeItem('defaultSucursalId')
  }
})

export function useDefaultSucursal() {
  const toggleDefaultSucursal = (id) => {
    if (defaultSucursalId.value === id) {
      defaultSucursalId.value = null
    } else {
      defaultSucursalId.value = id
    }
  }

  return {
    defaultSucursalId,
    toggleDefaultSucursal
  }
}
