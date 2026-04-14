import { boot } from 'quasar/wrappers'
import { api, syncApiAuthHeaderFromStorage } from 'src/services/http/api'
import {
  installAuthRequestInterceptor,
  installErrorResponseInterceptor,
} from 'src/services/http/interceptors'

export default boot(({ app, router }) => {
  syncApiAuthHeaderFromStorage()
  installAuthRequestInterceptor()
  installErrorResponseInterceptor(router)

  app.config.globalProperties.$api = api
})

export { api }
