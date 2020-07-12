import 'babel-polyfill'
import Vue from 'vue'
import {Message, MessageBox} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import {getRuntimeArgs} from './runtime-args'

Vue.config.productionTip = false
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm

const esm = importCall => importCall.then(mod => mod.default || mod)

getRuntimeArgs().then(async () => {
  const router = await esm(import('./router'))
  const store = await esm(import('./store'))
  const {createProvider} = await esm(import('./vue-apollo'))
  const App = await esm(import('./app.vue'))

  new Vue({
    router,
    store,
    apolloProvider: createProvider(),
    ...App,
  }).$mount('#app')
})
