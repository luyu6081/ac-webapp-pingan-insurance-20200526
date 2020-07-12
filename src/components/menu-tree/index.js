import MenuTree from './menu-tree.vue'

export default {
  ...MenuTree,
  install: Vue => Vue.component('menuTree', MenuTree),
}
