import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const bodyOnly = /[?&]body_only([=&]|$)/.test(location.hash)

export default new Vuex.Store({
  state: {
    userData: {},

    notifications: 0,
    notiInfomation: [],
    notiNotify: [],
    notiCommission: [],
    useBtnFlag: true,
    bodyOnly,
  },
  getters: {
    userData (state) {
      return state.userData
    },
    useBtnFlag (state) {
      return state.useBtnFlag
    },
  },
  mutations: {
    setUserInfo (state, data) {
      state.userData = data
    },
    setUseBtnFlag (state, data) {
      state.useBtnFlag = data
    },

    setNotifications (state, data) {
      state.notifications = data
    },
    setInfomation (state, data) {
      state.notiInfomation = data
    },
    setNotify (state, data) {
      state.notiNotify = data
    },
    setCommission (state, data) {
      state.notiCommission = data
    },
  },
  actions: {},
})
