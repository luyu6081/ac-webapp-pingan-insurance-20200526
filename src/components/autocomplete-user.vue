<template>
  <div>
    <input style="display:none;"/>
    <el-autocomplete
      popper-class="my-autocomplete"
      v-model.trim="value$"
      :maxlength="20"
      :minlength="1"
      :fetch-suggestions="querySearch"
      :placeholder="placeholder"
      @select="handleAutoSelect">
      <template slot-scope="{ item }">
        <div class="name">{{ item.name }}{{ item.jobNumber === '' ? '' : '（' + item.jobNumber + '）' }}</div>
        <span class="addr">{{ item.username }}</span>
      </template>
    </el-autocomplete>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Autocomplete,
    Message as ElMessage,
  } from 'element-ui'
  import USER_LIST_NO_AUTH from '@/graphql/user/user_list_no_auth.gql'
  Vue.use(Autocomplete)
  export default {
    name: 'EjAutocompleteUser',
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
        currentValue: null,
        userList: [],
      }
    },
    computed: {
      value$: {
        get () {
          return this.value
        },
        set (val) {
          this.$emit('input', val)
        },
      },
      currentTenantId () {
        return this.tenantId
      },
    },
    watch: {
      value (val) {
        this.currentValue = val
      },
    },
    created () {
      this.getUserList()
    },
    methods: {
      /* 负责人自动搜索弹出 start */
      getUserList () {
        this.$apollo.query({
          query: USER_LIST_NO_AUTH,
          fetchPolicy: 'no-cache',
          variables: {
            input: {
              keyWords: '',
              tenantId: this.currentTenantId ? this.currentTenantId : this.$store.state.userData.tenantId,
            },
          },
        }).then(respData => {
          let data = respData.data.data
          this.userList = []
          if (data.length > 0) {
            this.userList = data
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleAutoSelect (item) {
        this.$emit('handleSelect', item)
      },
      querySearch (queryString, cb) {
        var searchUser = this.userList
        var results = queryString ? searchUser.filter(this.createFilter(queryString)) : searchUser
        // 调用 callback 返回建议列表的数据
        if (results.length === 0) this.$emit('input', '') // 无匹配数据，则清空值
        cb(results)
      },
      createFilter (queryString) {
        return (filterUser) => {
          return (filterUser.username.toLowerCase().indexOf(queryString.toLowerCase()) === 0) || (filterUser.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0) || (filterUser.jobNumber.indexOf(queryString) === 0)
        }
      },
      /* 负责人自动搜索弹出 end */
    },
  }
</script>
