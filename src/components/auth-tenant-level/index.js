import AuthTenantLevel from './auth-tenant-level'

export default {
  ...AuthTenantLevel,
  install: Vue => Vue.component('ej-auth-tenant-level', AuthTenantLevel),
}
