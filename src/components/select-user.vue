<template>
  <div>
    <el-select :value="value" :placeholder="placeholder" @change="handleSelectUser">
      <el-option
        v-for="item in userList"
        :key="item.userId"
        :label="item.name + '（' + item.username + '）'"
        :value="item.name">
      </el-option>
    </el-select>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Select,
    Option,
    Message as ElMessage,
  } from 'element-ui'
  import USER_LIST_NO_AUTH from '@/graphql/user/user_list_no_auth.gql'
  Vue.use(Select)
  Vue.use(Option)
  export default {
    name: 'EjSelectUser',
    components: {},
    props: {
      placeholder: {
        type: String,
        default: '',
      },
      value: {
        type: String,
        default: '',
      },
      tenantId: {
        type: String,
        default: '',
      },
    },
    data () {
      return {
        userList: [],
      }
    },
    computed: {
      currentTenantId () {
        return this.tenantId
      },
    },
    created () {
      this.getUserList()
    },
    methods: {
      getUserList () {
        this.$apollo.query({
          query: USER_LIST_NO_AUTH,
          fetchPolicy: 'no-cache',
          variables: {
            input: {
              keyWords: '',
              tenantId: this.currentTenantId ? this.currentTenantId : this.$store.state.userData.tenantId,
              // tenantId: this.currentTenantId ? this.currentTenantId : '',
            },
          },
        }).then(respData => {
          let data = respData.data.data
          this.userList = []
          if (data.length > 0) {
            this.userList = data
          } else {
            this.$emit('handleSelectUser', {})
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleSelectUser (val) {
        let selUser = null
        this.userList.forEach(it => {
          if (it.name === val) {
            selUser = it
          }
        })
        this.$emit('handleSelectUser', selUser)
      },
    },
  }
</script>
