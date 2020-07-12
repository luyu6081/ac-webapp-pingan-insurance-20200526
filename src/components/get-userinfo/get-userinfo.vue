<template>
  <div class="get-userinfo-view"></div>
</template>

<script>
  import runtimeArgs from '@/runtime-args'
  import GET_USERINFO from '@/graphql/get_userinfo.gql'
  export default {
    name: 'EjGetuserinfo',

    props: {
      client: {
        type: String,
      },
    },

    created () {
      this.init()
    },

    methods: {
      init () {
        this.getUserinfo()
      },
      getUserinfo () {
        this.client && (this.$apollo.client = this.client)
        this.$apollo.query({
          // client: 'ucClient',
          query: GET_USERINFO,
        }).then(respData => {
          let data = respData.data.data
          this.$store.commit('setUserInfo', data)
          this.$store.commit('setUseBtnFlag', runtimeArgs.VUE_APP_USE_BUTTON_FLAG)
          if (!data.appKeys.includes('UC')) {
            this.$router.push({name: 'noAccess'})
          }
          // else if (data.appKeys.includes('UC') && this.$route.name === 'noAccess') {
          //   this.$router.push({path: '/'})
          // }
        })
      },
    },
  }
</script>
