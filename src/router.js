import Vue from 'vue'
import Router from 'vue-router'

const Home = () => import(/* webpackChunkName: 'home' */ '@/views/home.vue')
const Users = () => import(/* webpackChunkName: 'users' */ '@/views/user-admin/list.vue')
const Operates = () => import(/* webpackChunkName: 'users/operates' */ '@/views/user-admin/operates.vue')
const TenantList = () => import(/* webpackChunkName: 'tenant' */ '@/views/tenant-manage/list.vue')
const OrganizationList = () => import(/* webpackChunkName: 'organizations' */ '@/views/organization-manage/list.vue')
const RoleSetting = () => import(/* webpackChunkName: 'roles/setting' */ '@/views/role-manage/setting.vue')
const AuthorityAudit = () => import(/* webpackChunkName: 'roles/authority' */ '@/views/role-manage/authority-audit.vue')
const GroupList = () => import(/* webpackChunkName: 'groups' */ '@/views/group-manage/list.vue')
const ShortcutList = () => import(/* webpackChunkName: 'shortcut' */ '@/views/shortcut-menu/shortcutmenu-list.vue')
const Test = () => import(/* webpackChunkName: 'test' */ '@/views/test.vue')
const AppSettings = () => import(/* webpackChunkName: 'appsettings' */ '@/views/settings/settings.vue')
const NoAccess = () => import(/* webpackChunkName: 'noAccess' */ '@/views/noAccess/noAccess.vue')

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '*',
      redirect: '/',
    },
    {
      path: '/main',
      component: () => import('./views/main.vue'),
      children: [
        {
          path: '',
          redirect: '/',
        },
        {
          path: '/home',
          name: 'home',
          component: Home,
        },
        {
          path: '/app-settings',
          name: 'app-settings',
          component: AppSettings,
        },
        {
          path: '/users/user',
          name: 'users/user',
          component: Users,
        },
        {
          path: '/users/user/operates',
          name: 'users/user/operates',
          component: Operates,
        },
        {
          path: '/organizations/tenant',
          name: 'organizations/tenant',
          component: TenantList,
        },
        {
          path: '/organizations/organization',
          name: 'organizations/organization',
          component: OrganizationList,
        },
        {
          path: '/users/setting',
          name: 'users/setting',
          component: RoleSetting,
        },
        {
          path: '/users/authority-audit',
          name: 'users/authority-audit',
          component: AuthorityAudit,
        },
        {
          path: '/organizations/group',
          name: 'organizations/group',
          component: GroupList,
        },
        {
          path: '/applys/shortcut',
          name: 'applys/shortcut',
          component: ShortcutList,
        },
        {
          path: '/test',
          name: 'test',
          component: Test,
        },
        {
          path: '/noAccess',
          name: 'noAccess',
          component: NoAccess,
        },
      ],
    },
  ],
})
