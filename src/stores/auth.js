import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'
import { clearAuthToken, getAuthToken, setAuthToken } from 'src/services/http/token'

export const useAuthStore = defineStore('auth', () => {
  // ——— State ———
  const user = ref(null)
  const token = ref(getAuthToken() || null)

  // ——— Getters ———
  const isAuthenticated = computed(() => !!token.value)

  // ——— Actions ———
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      setAuthToken(newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      clearAuthToken()
      delete api.defaults.headers.common['Authorization']
    }
  }

  async function login(credentials) {
    const response = await api.post('/api/login', credentials)
    const { access_token: newToken, user: userData } = response.data.data
    setToken(newToken)
    console.log(userData)
    user.value = userData
    return response
  }

  async function fetchUser() {
    try {
      const response = await api.get('/api/user')
      user.value = response.data
    } catch {
      logout()
    }
  }

  function logout() {
    try {
      api.post('/api/logout').catch(() => {})
    } finally {
      user.value = null
      setToken(null)
    }
  }

  // Restaurar token en headers al recargar
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    setToken,
  }
})
