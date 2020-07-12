<template>
  <div class="settings-view app-view">
    <div v-if="$store.state.userData.permissionCodes.includes('platformManager')">
      <div class="demo-input-suffix">
        资源目录主要负责单位：
        <el-select v-model="selTenants" multiple placeholder="请选择">
          <el-option
            v-for="item in tenantList"
            :key="item.tenantId"
            :label="item.tenantName"
            :value="item.tenantId">
          </el-option>
        </el-select>
        <el-button type="primary" @click="handleSetting()" class="ml20">设置</el-button>
      </div>
    </div>
    <el-tabs v-model="hbActiveName" :tab-position="tabPosition" @tab-click="handleHbClick" v-else>
      <el-tab-pane label="充值" name="first">
        <div class="hb-title">当前海贝值：{{curVirtualCurrency}}</div>
        <el-form ref="formHBData" :model="formHBData">
          <el-row :gutter="60">
            <el-col :span="12" class="pinline">
              <el-form-item label="海贝充值" :label-width="formLabelWidth" prop="virtualCurrency">
                <el-input-number v-model="formHBData.virtualCurrency"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="dialog-footer" v-show="hbActiveName === 'first'">
          <el-button type="primary" @click="handleSubmit('formHBData')">充值</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="详情" name="second">
        <el-table ref="hbTable" :data="hbList" class="my-table w-full">
          <el-table-column prop="type" label="类型"/>
          <el-table-column prop="title" label="名称"/>
          <el-table-column prop="desc" label="描述"/>
        </el-table>

      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Col,
    Dialog,
    Form,
    FormItem,
    Input,
    InputNumber,
    Row,
    Message as ElMessage,
    Select,
    Option,
    Table,
    TableColumn,
    Tabs,
    TabPane,
  } from 'element-ui'

  import TENANT_LIST from '@/graphql/tenant/tenant_list.gql'
  import SAVE_UPDATE_TENANTINFO from '@/graphql/setting/save_update_tenantInfo.gql'
  import SELECT_TENANTINFO from '@/graphql/setting/select_tenantInfo.gql'

  Vue.use(Button)
  Vue.use(Col)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(InputNumber)
  Vue.use(Row)
  Vue.use(Select)
  Vue.use(Option)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Tabs)
  Vue.use(TabPane)

  export default {
    name: 'EjSettings',
    components: {},
    data () {
      return {
        tabPosition: 'left',
        formLabelWidth: '70px',
        formHBData: {
          // tenantInfoId: '',
          virtualCurrency: 0,
        },
        hbActiveName: 'first',
        hbList: [
          {
            type: '充值1',
            title: '充值充值1',
            desc: '我充值了，现在有钱了1',
            date: '2019-11-01',
          },
          {
            type: '充值2',
            title: '充值充值2',
            desc: '我充值了，现在有钱了2',
            date: '2019-11-06',
          },
        ],
        formRules: {
          registrationCode: [
            {
              required: true,
              message: '请输入激活码',
              trigger: 'blur',
            },
          ],
        },
        curVirtualCurrency: 0,
        // 资源目录
        tenantList: [],
        selTenants: [],
      }
    },
    watch: {
    },
    created () {
      let isInCludes = this.$store.state.userData.permissionCodes.includes('platformManager')
      if (isInCludes) {
        this.getTenantList()
      } else {
        this.selectTenantInfo()
      }
    },

    methods: {
      selectTenantInfo () {
        this.$apollo.query({
          query: SELECT_TENANTINFO,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              tenantId: this.$store.state.userData.tenantId,
            },
          },
        }).then(respData => {
          let data = respData.data.data
          this.curVirtualCurrency = data[0].virtualCurrency
          this.formHBData.virtualCurrency = 0
        })
      },
      handleHbClick (tab, event) {
        console.log(tab)
      },
      handleSubmit (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$apollo.mutate({
              mutation: SAVE_UPDATE_TENANTINFO,
              variables: {
                input: [this.formHBData],
              },
            }).then((data) => {
              if (data.data.data) {
                ElMessage.success('充值成功')
                this.selectTenantInfo()
              }
            }).catch((err) => {
              ElMessage.error({message: err.message || '请求失败请重试'})
            })
          }
        })
      },
      getTenantList () {
        this.$apollo.query({
          query: TENANT_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: {
              tenantId: '',
              keyWords: '',
            },
          },
        }).then(respData => {
          let data = respData.data.data
          this.tenantList = []
          this.selTenants = []
          if (data.length > 0) {
            this.tenantList = data
            data.forEach(item => {
              if (item.tenantInfoVO && item.tenantInfoVO.drdManager) {
                this.selTenants.push(item.tenantId)
              }
            })
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleSetting () {
        let curTenants = []
        this.selTenants.forEach(item => {
          curTenants.push({
            drdManager: true,
            tenantId: item,
          })
        })
        this.$apollo.mutate({
          mutation: SAVE_UPDATE_TENANTINFO,
          variables: {
            input: curTenants,
          },
        }).then((data) => {
          if (data.data.data) {
            this.getTenantList()
            ElMessage.success('设置成功')
          }
        }).catch((err) => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
    },
  }
</script>
<style lang="scss">
  .settings-view {
    @apply bg-white;

    min-height: 826px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
    display: flex;
    width: 1100px;

    .el-tabs {
      -webkit-box-flex: 1;
      flex: 1 1 0%;

      .el-tabs__nav {
        .el-tabs__item {
          padding: 0 50px;
          font-size: 16px;
        }
      }

      .el-tabs__content {
        padding: 20px;
      }

      .hb-title {
        font-size: 25px;
        margin-bottom: 20px;
      }
    }

    .el-button {
      padding: 0;
      width: 64px;
      height: 32px;
    }
  }
</style>
