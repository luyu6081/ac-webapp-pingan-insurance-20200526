<template>
  <div class="main-view" :class="[{'body-only': bodyOnly}]">
    <ej-getuserinfo/>
    <ej-app-header v-if="!bodyOnly && hasAuthority"
                   :logo="logo"
                   title="权限中心"
                   fixed
                   @search="search"
                   class="ej-dqs-header__wrap">
      <!-- MENU -->
      <ej-nav-menu :default-active="activeIndex"
        mode="horizontal"
        text-color="#fff"
        active-text-color="#fff"
        class="app-nav__menu flex">
        <el-menu-item index="_0"
          class="app-nav__menu-item flex items-center"
          @click="$router.push({name: 'home'})"
          :class="{'is-active': $route.name === 'home'}">
          <span>首页</span>
        </el-menu-item>
        <ej-nav-submenu :index="item.index"
          :show-timeout="100"
          class="app-nav__menu-item flex items-center"
          v-for="(item, idx) of navList"
          :key="idx"
          :class="{'is-active': item.name === $route.name.split('/')[0]}">
          <template #title>{{item.value}}</template>
          <el-menu-item
            :index="second.index"
            @click="handleMenu(second.to)"
            v-for="(second, sindex) of item.children"
            :key="sindex"
            :class="{'is-active': second.name === $route.name.split('/')[0] + '/' + $route.name.split('/')[1]}">
            <span>{{second.value}}</span>
          </el-menu-item>
        </ej-nav-submenu>
      </ej-nav-menu>
      <template #tray>
        <div>
          <app-setting v-if="tenantSetting" @click.native="$router.push('/app-settings')"/>
          <!-- <ej-app-search/>
          <a href="javascript:" class="ej-app-setting flex items-center" @click="goSettings">
            <ej-icon icon="gear" class="ej-app-setting__button"/>
          </a> -->
          <ej-app-notification v-if="useBtnFlag"/>
        </div>
        <ej-app-usermenu :user="userData" :endpoint="endpoint" :no-uc="true"/>
      </template>
    </ej-app-header>

    <div v-ej-loading.fullScreen="!loading" class="flex-1" :class="hasAuthority ? 'app-body' : ''">
      <router-view v-if="loading && (!isCreateATA || !isCreateAPA) && hasAuthority" class="app-view"/>
      <router-view v-if="loading && !hasAuthority"/>
      <ej-auth-tenant-active :isCreateATA="isCreateATA" @closeCreateATA="closeCreateATA" :isPlatFormChange="isPlatFormChange" :isPlatFormExpired="isPlatFormExpired" v-if="isCreateATA && hasAuthority"></ej-auth-tenant-active>
      <ej-auth-platform-active :isCreateAPA="isCreateAPA" @closeCreateAPA="closeCreateAPA" :isPlatFormChange="isPlatFormChange" v-if="isCreateAPA && hasAuthority"></ej-auth-platform-active>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {mapGetters, mapState} from 'vuex'
  import {
    Menu,
    MenuItem,
    Message as ElMessage,
    Submenu,
  } from 'element-ui'
  import {
    AppHeader,
    AppNotification,
    // AppSearch,
    AppSetting,
    AppUsermenu,
    Icon,
    Loading,
    NavMenu as EjNavMenu,
    NavSubmenu as EjNavSubmenu,
  } from '@ej/ui'
  import runtimeArgs from '@/runtime-args'

  import EjAuthTenantActive from '@/components/auth-tenant-active/auth-tenant-active.vue'
  import EjAuthPlatformActive from '@/components/auth-platform-active/auth-platform-active.vue'

  import {notiCommission, notiInfomation, notiNotify} from '@/js/mockData/common'
  import GetUserinfo from '@/components/get-userinfo'
  import CHECK_TENANT_CODE_STATUS from '@/graphql/tenant/check_tenant_code_status.gql'
  import CHECK_PLATFORM_CODE_STATUS from '@/graphql/tenant/check_platform_code_status.gql'

  Vue.use(GetUserinfo)

  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Submenu)
  Vue.use(AppHeader)
  Vue.use(AppUsermenu)
  Vue.use(Icon)
  Vue.use(Loading)
  Vue.use(AppNotification)
  Vue.use(EjNavMenu)
  Vue.use(EjNavSubmenu)
  /** 头像获取地址 */
  const AVATAR_ADDRESS = runtimeArgs.VUE_APP_AUTH_FRONTIER_URL + 'fileDownload'
  /* 登录地址 */
  const LOGIN_ADDRESS = runtimeArgs.VUE_APP_LOGIN_URL
  /* 退出地址：光大需要跳转的门户页面 */
  const LOGOUT_ADDRESS = runtimeArgs.VUE_APP_LOGOUT_URL
  export default {
    name: 'MainView',
    components: {
      // AppSearch,
      AppSetting,
      EjAuthTenantActive,
      EjAuthPlatformActive,
    },
    data () {
      return {
        endpoint: {
          avatarUrl: AVATAR_ADDRESS, /* 头像获取环境变量 */
          loginUrl: LOGIN_ADDRESS, /* 登录系统地址环境变量 */
          logoutUrl: LOGOUT_ADDRESS, /* 光大门户地址环境变量 */
          client: 'ucClient', /* 调用auth-frontier中的退出接口：client名称 */
        },
        isCreateATA: false, // 租户激活码
        isPlatFormExpired: false, // 平台过期
        isPlatFormChange: false, // 平台信息发生变化，如人为修改使用日期
        isCreateAPA: false, // 平台激活码
        activeIndex: '_0',
        navListMock: [
          {
            index: '_1',
            value: '机构管理',
            to: '/',
            icon: '',
            name: 'organizations',
            children: [
              // {
              //   index: '_1-1',
              //   value: '租户管理',
              //   to: {name: 'organizations/tenant'},
              //   icon: '',
              //   name: 'organizations/tenant',
              // },
              {
                index: '_1-2',
                value: '机构管理',
                to: {name: 'organizations/organization'},
                icon: '',
                name: 'organizations/organization',
              },
              {
                index: '_1-3',
                value: '分组管理',
                to: {name: 'organizations/group'},
                icon: '',
                name: 'organizations/group',
              },
            ],
          },
          {
            index: '_2',
            value: '用户管理',
            to: '/',
            icon: '',
            name: 'users',
            children: [
              {
                index: '_2-1',
                value: '用户管理',
                to: {name: 'users/user'},
                icon: '',
                name: 'users/user',
              },
              {
                index: '_2-2',
                value: '权限审计',
                to: {name: 'users/authority-audit'},
                icon: '',
                name: 'users/authority-audit',
              },
              {
                index: '_2-3',
                value: '角色设置',
                to: {name: 'users/setting'},
                icon: '',
                name: 'users/setting',
              },
            ],
          },
          {
            index: '_3',
            value: '应用管理',
            to: {name: 'apply'},
            icon: '',
            name: 'applys',
            children: [
              {
                index: '_3-1',
                value: '快捷菜单',
                to: {name: 'applys/shortcut'},
                icon: '',
                name: 'applys/shortcut',
              },
            ],
          },
        ],
        logo: 'images/logo.svg',
      }
    },

    computed: {
      ...mapState({
        bodyOnly: 'bodyOnly',
      }),
      ...mapGetters([
        'userData',
        'useBtnFlag',
      ]),

      currentNav () {
        return this.$route.name
      },
      loading () {
        return Object.keys(this.userData).length
      },
      hasAuthority () {
        if (this.$route.name === 'noAccess') {
          return false
        }
        return true
      },
      tenantSetting () {
        if (this.loading) {
          return (this.userData.permissionCodes.includes('ucManager') || this.userData.permissionCodes.includes('platformManager')) && this.useBtnFlag
        }
        return false
      },
      navList () {
        if (this.loading) {
          // 判断该租户是否已激活过激活码
          if (this.userData.permissionCodes.includes('ucManager') && !this.isCreateATA) {
            this.checkTenantCodeStatus()
          }

          let isInCludes = this.userData.permissionCodes.includes('platformManager')
          if (isInCludes) {
            // 判断该平台账户是否已激活过激活码
            this.checkPlatformCodeStatus()
            return [
              {
                index: '_1',
                value: '机构管理',
                to: '/',
                icon: '',
                name: 'organizations',
                children: [
                  {
                    index: '_1-1',
                    value: '租户管理',
                    to: {name: 'organizations/tenant'},
                    icon: '',
                    name: 'organizations/tenant',
                  },
                ],
              },
            ]
          } else {
            return this.navListMock
          }
        }
        return []
      },
    },

    beforeCreate () {
      // todo: 接口获取数据
      this.$store.commit('setInfomation', notiInfomation)
      this.$store.commit('setNotify', notiNotify)
      this.$store.commit('setCommission', notiCommission)
    },
    mounted () {
      let curRouteName = this.$route.name
      if (curRouteName) {
        let newRNArr = curRouteName.split('/')
        if (newRNArr[0] === 'home') {
          this.activeIndex = '_0'
        } else if (newRNArr[0] === 'organizations') {
          this.activeIndex = '_1'
        } else if (newRNArr[0] === 'users') {
          this.activeIndex = '_2'
        } else if (newRNArr[0] === 'applys') {
          this.activeIndex = '_3'
        }
      }
    },
    methods: {
      /* 租户激活码 */
      closeCreateATA (val) {
        this.isCreateATA = val
      },
      checkTenantCodeStatus () {
        this.$apollo.query({
          query: CHECK_TENANT_CODE_STATUS,
          fetchPolicy: 'no-cache',
        }).then(respData => {
          let dataResult = respData.data.data
          if (this.loading) {
            this.isCreateATA = this.userData.permissionCodes.includes('ucManager') && !dataResult
          }
        }).catch(err => {
          let code = err.graphQLErrors[0].extensions.code
          if (code === '1700') {
            this.isCreateATA = true
            this.isPlatFormExpired = true
          } else if (code === '1701') {
            this.isCreateATA = true
            this.isPlatFormChange = true
          } else {
            ElMessage.error({message: err.message || '请求失败请重试'})
          }
        })
      },
      closeCreateAPA (val) {
        this.isCreateAPA = val
      },
      /* 平台激活码 */
      checkPlatformCodeStatus () {
        this.$apollo.query({
          query: CHECK_PLATFORM_CODE_STATUS,
          fetchPolicy: 'no-cache',
        }).then(respData => {
          let dataResult = respData.data.data
          if (this.loading) {
            this.isCreateAPA = this.userData.permissionCodes.includes('platformManager') && !dataResult
          }
        }).catch(err => {
          let code = err.graphQLErrors[0].extensions.code
          if (code === '1700') {
            this.isCreateAPA = true
            setTimeout(() => {
              ElMessage.error('您当前的平台使用时间已过期，请重新激活！')
            })
          } else if (code === '1701') {
            this.isCreateAPA = true
            this.isPlatFormChange = true
          } else {
            ElMessage.error({message: err.message || '请求失败请重试'})
          }
        })
      },
      handleMenu (url) {
        let newUrl = url.name.split('/')
        if (newUrl[0] === 'home') {
          this.activeIndex = '_0'
        } else if (newUrl[0] === 'organizations') {
          this.activeIndex = '_1'
        } else if (newUrl[0] === 'users') {
          this.activeIndex = '_2'
        } else if (newUrl[0] === 'applys') {
          this.activeIndex = '_3'
        }
        this.$router.push(url)
      },
      search (keywords) {
        console.log(keywords)
      },
      goSettings () {
        console.log()
      },
    },
  }
</script>

<style lang="scss">
  .main-view {
    min-height: 100vh;

    &.body-only {
      .app-body {
        .organization-list-view,
        .group-list-view,
        .user-list-view,
        .authority-audit-view,
        .role-setting-view {
          .filter {
            top: 20px;
          }
          > ::before {
            display: none;
          }
        }

        .user-list-view {
          .my-aside-main {
            top: 75px;
          }
        }

        .authority-audit-view,
        .role-setting-view {
          .my-aside-main {
            top: 20px;
          }
        }
      }
    }

    .ej-app-header {
      z-index: 100;
    }
    .app-body {
      margin: 0 30px;
      padding: 20px 0;
    }

    .ej-app-logo {
      margin-right: 100px;
    }

    .ej-app-setting {
      margin: 0 28px;

      .ej-app-setting__button {
        width: 18px;
        height: 18px;
      }
    }
  }
</style>
