<template>
  <div class="home-view h-full flex items-center justify-center">
    <span class="text-2xl text-purple">Test 页面</span>
    <el-button @click="handleTest()">测试</el-button>
  </div>
</template>
<script>
  import {
    Message as ElMessage,
  } from 'element-ui'
  import DATA_SYNCH from '@/graphql/organization/data_synch.gql'

  // const authServiceUrl = process.env.VUE_APP_AUTH_SERVICE_URL // http://auth-service.dev.jinxin.cloud
  export default {
    name: 'Test',
    methods: {
      handleTest () {
        // let httpRequest = new XMLHttpRequest()
        // let getUrl = `${authServiceUrl}/bj/auth/synch/dfjx`
        // httpRequest.open('GET', getUrl, true)
        // httpRequest.send()
        // httpRequest.onreadystatechange = (e) => {
        //   if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        //     ElMessage.info(httpRequest.responseText)
        //   }
        // }
        this.$apollo.mutate({
          mutation: DATA_SYNCH,
          fetchPolicy: 'no-cache',
          variables: {
            password: 'dfjx', // this.$store.state.userData.password,
          },
        }).then((data) => {
          if (data.data.data) {
            ElMessage.success('数据同步完成')
          } else {
            ElMessage.error('数据同步失败')
          }
        }).catch((err) => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
    },
  }
</script>
