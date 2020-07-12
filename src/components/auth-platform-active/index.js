import AuthTenantActive from './auth-tenant-active'

export default {
  ...AuthTenantActive,
  install: Vue => Vue.component('ej-auth-tenant-active', AuthTenantActive),
}
