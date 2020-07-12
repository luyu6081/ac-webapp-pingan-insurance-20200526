<template>
  <div class="tenant-list-view">
    <div v-if="isAuth">
      <el-header class="filter z-10">
        <div class="flex-1">
          <ej-search-input v-model="params.keyWords"
            placeholder="请输入检索信息"
            @search="search"/>
        </div>
        <a href="javascript:" class="btn btn-normal" @click="handleOperation(1, '')" v-if="$store.state.userData.permissionCodes.includes('platformManager')">新建</a>
      </el-header>
      <el-main class="my-main" :style="{minHeight: screenHeight}">
        <div v-ej-loading="loading">
          <el-table ref="table" :data="tenantList" class="my-table w-full">
            <el-table-column prop="tenantCode" label="租户编码"/>
            <el-table-column prop="tenantName" label="租户名称"/>
            <el-table-column prop="tenantDesc" label="租户描述"/>
            <el-table-column prop="status" label="状态">
              <template slot-scope="scope">
                <div v-if="scope.row.status === 0" class="stateBlueColor">启用</div>
                <div v-else class="stateRedColor">禁用</div>
              </template>
            </el-table-column>
            <el-table-column prop="managerName" label="管理员姓名"/>
            <el-table-column prop="managerMail" label="管理员邮箱"/>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleOperation(2, scope.row)" v-if="$store.state.userData.permissionCodes.includes('platformManager')">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="handleOperation(3, scope.row)">
                  {{scope.row.status ? '启用' : '禁用'}}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <ej-auth-tenant-level :isCreateRC="isCreateRC" :registrationCode="registrationCode" @closeCreateRC="closeCreateRC"></ej-auth-tenant-level>
        <el-dialog :title="isModify ? '编辑租户' : '新建租户'"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            :show-close="false"
            width="834px"
            class="dialogVisible">
          <ej-step-bar :active="active" :steps="stepsData"></ej-step-bar>
          <el-form ref="formData" label-position="top" :model="formData" :rules="formRules">
            <el-row :gutter="60">
              <el-col v-show="active === 0" :span="12" class="pinline">
                <el-form-item label="租户编码" :label-width="formLabelWidth" prop="tenantCode">
                  <el-input v-model.trim="formData.tenantCode" maxlength="20" placeholder="请输入租户编码"/>
                </el-form-item>
              </el-col>
              <el-col v-show="active === 0" :span="12" class="pinline">
                <el-form-item label="租户名称" :label-width="formLabelWidth" prop="tenantName">
                  <el-input v-model.trim="formData.tenantName" maxlength="20" placeholder="请输入租户名称"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col v-show="active === 0" :span="24" class="pinline">
                <el-form-item label="租户级别" prop="tenantLevelId" class="select-item">
                  <el-select v-model="formData.tenantLevelId" placeholder="请选择租户级别">
                    <el-option
                      v-for="item in tenantLevelSel"
                      :key="item.tenantLevel"
                      :label="item.description"
                      :value="item.tenantLevel">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- <el-col v-show="active === 0" :span="11" class="pinline">
              <el-form-item label="系统名称" prop="systemListSel" class="select-item">
                <el-select v-model="formData.systemListSel" multiple collapse-tags placeholder="请选择系统名称">
                  <el-option
                    v-for="item in systemList"
                    :key="item.appName"
                    :label="item.systemName"
                    :value="item.appName">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col> -->
            <el-row>
              <el-col v-show="active === 0" :span="24" class="pinline">
                <el-form-item label="租户描述" prop="tenantDesc">
                  <el-input type="textarea" v-model.trim="formData.tenantDesc" maxlength="150" show-word-limit resize="none"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="60">
              <el-col v-show="active === 1" :span="12" class="pinline">
                <el-form-item label="管理员姓名" :label-width="formLabelWidth" prop="name">
                  <!-- <el-input v-model.trim="formData.name" maxlength="20" v-if="!isModify"/>
                  <ej-select-user v-model="formData.name" placeholder="请选择管理员姓名" :tenantId="formData.tenantId" @handleSelectUser="handleSelectUser" v-else></ej-select-user> -->
                  <ej-select-user v-model="formData.name" placeholder="请选择管理员姓名" :tenantId="formData.tenantId" @handleSelectUser="handleSelectUser" v-if="isModify && hasUserList"/>
                  <el-input v-model.trim="formData.name" maxlength="20" v-else/>
                </el-form-item>
              </el-col>
              <el-col v-show="active === 1" :span="12" class="pinline">
                <el-form-item label="管理员电话" :label-width="formLabelWidth" prop="phoneNumber">
                  <el-input v-model.trim="formData.phoneNumber" maxlength="15" :disabled="isModify"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="60">
              <el-col v-show="active === 1" :span="12" class="pinline">
                <el-form-item label="管理员邮箱" :label-width="formLabelWidth" prop="email">
                  <el-input v-model.trim="formData.email" type="email" maxlength="20" :disabled="isModify"/>
                </el-form-item>
              </el-col>
              <el-col v-show="active === 1" :span="12" class="pinline">
                <el-form-item label="登录账号" :label-width="formLabelWidth" prop="username">
                  <!-- <el-input v-model="formData.username" @keyup.native="limitLetter"/> -->
                  <el-input v-model.trim="formData.username" placeholder="请输入登录账号" maxlength="20" :disabled="isModify"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col v-show="active === 1" :span="24" class="pinline">
                <el-form-item
                    label="默认密码"
                    :label-width="formLabelWidth"
                    prop="password"
                    class="password-item">
                  <el-input v-model.trim="formData.password" show-password maxlength="60" placeholder="请输入默认密码" :disabled="isModify"/>
                </el-form-item>
              </el-col>
          </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancel('formData')">取消</el-button>
            <el-button v-if="active === 0" type="primary" @click="handleNext">下一步</el-button>
            <el-button v-if="active === 1" type="primary" @click="handlePre">上一步</el-button>
            <el-button v-if="active === 1" type="primary" :disabled="btnDisabled" @click="handleSubmit('formData')">提交</el-button>
          </div>
        </el-dialog>
      </el-main>
    </div>
    <div class="empty-content flex items-center justify-center" :style="{minHeight: screenHeight}" v-else>
      <div>用户无权限</div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Col,
    Container,
    Dialog,
    Form,
    FormItem,
    Header,
    Input,
    Main,
    Message as ElMessage,
    Option,
    Row,
    Select,
    Step,
    Steps,
    Table,
    TableColumn,
    Tabs,
    TabPane,
  } from 'element-ui'

  import {Loading, SearchInput} from '@ej/ui'
  import {cloneDeep} from 'lodash'

  import EjSelectUser from '@/components/select-user.vue'
  import EjStepBar from '@/components/step-bar.vue'
  import EjAuthTenantLevel from '@/components/auth-tenant-level/auth-tenant-level.vue'
  import SYSTEM_LIST from '@/graphql/role/system_list.gql'
  import TENANT_LIST from '@/graphql/tenant/tenant_list.gql'
  import TENANT_LEVEL from '@/graphql/tenant/tenant_level.gql'
  import SAVE_TENANT from '@/graphql/tenant/save_tenant.gql'
  import UPDATE_TENANT from '@/graphql/tenant/update_tenant.gql'
  import UPDATE_TENANT_STATUS from '@/graphql/tenant/update_tenant_status.gql'
  import CHECK_CREATE_TENANT_COUNT from '@/graphql/tenant/check_create_tenant_count.gql'

  Vue.use(Button)
  Vue.use(Col)
  Vue.use(Container)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Header)
  Vue.use(Input)
  Vue.use(Main)
  Vue.use(Row)
  Vue.use(Select)
  Vue.use(Option)
  Vue.use(Steps)
  Vue.use(Step)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Tabs)
  Vue.use(TabPane)

  Vue.use(SearchInput)
  Vue.use(Loading)

  export default {
    name: 'tenant-list',
    components: {
      EjSelectUser,
      EjStepBar,
      EjAuthTenantLevel,
    },
    data () {
      let validateUserName = (rule, value, callback) => {
        let self = this
        if (value === '' || value === null) {
          callback(new Error('请输入登录账号'))
        } else {
          if (value !== '') {
            if (self.isModify) {
              if (self.tenantList.some(t => t.username === self.formData.username && t.tenantId !== self.formData.tenantId)) {
                callback(new Error('登录账号已存在'))
              }
            } else {
              if (self.tenantList.some(t => t.username === self.formData.username)) {
                callback(new Error('登录账号已存在'))
              }
            }
          }
          callback()
        }
      }
      let validateTenantCode = (rule, value, callback) => {
        let self = this
        if (value === '' || value === null) {
          callback(new Error('请输入租户编码'))
        } else {
          if (value !== '') {
            if (self.isModify) {
              if (self.tenantList.some(t => t.tenantCode === self.formData.tenantCode && t.tenantId !== self.formData.tenantId)) {
                callback(new Error('租户编码已存在'))
              }
            } else {
              if (self.tenantList.some(t => t.tenantCode === self.formData.tenantCode)) {
                callback(new Error('租户编码已存在'))
              }
            }
          }
          callback()
        }
      }
      let validateTenantName = (rule, value, callback) => {
        if (value === '' || value === null) {
          callback(new Error('请输入租户名称'))
        } else {
          if (value !== '') {
            if (this.isModify) {
              if (this.tenantList.some(t => t.tenantName === this.formData.tenantName && t.tenantId !== this.formData.tenantId)) {
                callback(new Error('租户名称已存在'))
              }
            } else {
              if (this.tenantList.some(t => t.tenantName === this.formData.tenantName)) {
                callback(new Error('租户名称已存在'))
              }
            }
          }
          callback()
        }
      }
      let validateSelectName = (rule, value, callback) => {
        if (value === '' || value === null) {
          if (this.isModify) {
            callback(new Error('请选择管理员姓名'))
          } else {
            callback(new Error('请输入管理员姓名'))
          }
        } else {
          callback()
        }
      }
      return {
        isAuth: true,
        screenHeight: '800px',
        params: {
          tenantId: '',
          keyWords: '',
        },
        tenantList: [],
        loading: false,
        dialogVisible: false,
        btnDisabled: false,
        active: 0,
        stepsData: [
          {
            index: 1,
            value: '用户信息',
          },
          {
            index: 2,
            value: '指定管理员', // 群组管理
          },
          // {
          //   index: 3,
          //   value: '完成',
          // },
        ],
        isCreateRC: false,
        tenantLevelSel: [],
        // systemList: [],
        formLabelWidth: '120px',
        registrationCode: '',
        formData: {
          tenantCode: '',
          tenantName: '',
          tenantDesc: '',
          tenantLevelId: '',
          // systemListSel: [],
          name: '', // 中文
          username: '', // 拼音
          phoneNumber: '',
          email: '',
          password: '',
        },
        formRules: {
          tenantCode: [
            {
              required: true,
              validator: validateTenantCode,
              // message: '请输入租户编码',
              trigger: 'blur',
            },
          ],
          tenantName: [
            {
              required: true,
              validator: validateTenantName,
              // message: '请输入租户名称',
              trigger: 'blur',
            },
          ],
          tenantLevelId: [
            {
              required: true,
              message: '请选择租户级别',
              trigger: 'change',
            },
          ],
          // systemListSel: [
          //   {
          //     required: true,
          //     message: '请选择系统名称',
          //     trigger: 'change',
          //   },
          // ],
          name: [
            {
              required: true,
              validator: validateSelectName,
              // message: '请输入管理员姓名',
              trigger: 'blur',
            },
          ],

          username: [
            {
              required: true,
              validator: validateUserName,
              // message: '请输入登录账号',
              trigger: 'blur',
            },
          ],
          password: [
            {
              required: true,
              message: '请输入默认密码',
              trigger: 'blur',
            },
          ],
        },
        isModify: false,
        hasUserList: true, // 当前租户，是否有管理员数据userList
        oldFormData: null,
      }
    },

    created () {
      this.getClientHeight()
      this.getTenantList()
    },

    methods: {
      getClientHeight () {
        /*
        * 头：50
        * 间距：20 去掉
        * 页面头高 55
        */
        let height = 125
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight
        this.screenHeight = clientHeight - height + 'px'
      },
      // 获取租户列表
      getTenantList () {
        this.loading = true
        this.client && (this.$apollo.client = this.client)
        this.$apollo.query({
          query: TENANT_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: this.params,
          },
        }).then(respData => {
          this.loading = false
          this.tenantList = []
          let curGetData = respData.data.data
          this.tenantList = curGetData
        }).catch(err => {
          this.loading = false
          let code = err.graphQLErrors[0].extensions.code
          if (code === '403') {
            this.isAuth = false
          } else {
            ElMessage.error({message: err.message || '请求失败请重试'})
          }
        })
      },
      // 获取租户级别
      getTenantLevel () {
        this.$apollo.query({
          query: TENANT_LEVEL,
          fetchPolicy: 'no-cache',
        }).then(respData => {
          this.tenantLevelSel = []
          let curGetData = respData.data.data
          this.tenantLevelSel = curGetData
        }).catch(err => {
          let code = err.graphQLErrors[0].extensions.code
          if (code === '403') {
            this.isAuth = false
          } else {
            ElMessage.error({message: err.message || '请求失败请重试'})
          }
        })
      },
      // 获取系统列表
      getSystemList () {
        this.$apollo.query({
          query: SYSTEM_LIST,
          fetchPolicy: 'no-cache',
        }).then(respData => {
          this.systemList = []
          let curGetData = respData.data.data
          this.systemList = curGetData
        }).catch(err => {
          let code = err.graphQLErrors[0].extensions.code
          if (code === '403') {
            this.isAuth = false
          } else {
            ElMessage.error({message: err.message || '请求失败请重试'})
          }
        })
      },
      // 编辑时：获取某条租户
      getTenantById (id) {
        this.$apollo.query({
          query: TENANT_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              tenantId: id,
              keyWords: '',
            },
          },
        }).then(respData => {
          let dataResult = respData.data.data
          if (dataResult.length > 0) {
            let data = dataResult[0]
            this.formData = {
              tenantId: data.tenantId,
              tenantCode: data.tenantCode,
              tenantName: data.tenantName,
              tenantDesc: data.tenantDesc,
              username: data.username,
              name: data.managerName,
              phoneNumber: data.managerPhone,
              email: data.managerMail,
              password: data.password,
              tenantLevelId: data.tenantLevelId,
              // systemListSel: data.systemListSel,
            }
          }
          this.active = 0
          this.hasUserList = true
          this.isModify = true
          this.dialogVisible = true
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      search (val) {
        // this.clearParams()
        this.params.keyWords = val
        this.getTenantList()
      },
      clearParams () {
        this.params = {
          tenantId: '',
          keyWords: '',
        }
      },
      handleCancel (formName) {
        this.dialogVisible = false
        this.isModify = false
        this.clearFormData()
        this.$refs[formName].resetFields()
      },
      clearFormData () {
        this.formData = {
          tenantId: '',
          tenantCode: '',
          tenantName: '',
          tenantDesc: '',
          name: '', // 中文
          username: '', // 拼音
          phoneNumber: '',
          email: '',
          password: '',
        }
      },
      handleOperation (oper, data) {
        switch (oper) {
          case 1:
            // 新建操作
            this.$apollo.query({
              query: CHECK_CREATE_TENANT_COUNT,
              fetchPolicy: 'no-cache',
            }).then(respData => {
              if (respData) {
                if (respData.data.data) {
                  this.getTenantLevel()
                  // this.getSystemList()
                  this.clearFormData()
                  this.active = 0
                  if (this.formData.tenantId) {
                    delete this.formData.tenantId
                  }
                  this.isModify = false
                  this.hasUserList = false
                  this.dialogVisible = true
                } else {
                  ElMessage.warning('当前可新建租户数量已达上限，请联系管理员升级')
                }
              }
            })
            break
          case 2:
            // 编辑操作
            // this.getSystemList()
            this.getTenantLevel()
            this.getTenantById(data.tenantId)
            break
          case 3:
            // 启用/禁用
            let startParam = {
              tenantId: [data.tenantId],
              isEnable: data.status,
            }
            this.$apollo.mutate({
              mutation: UPDATE_TENANT_STATUS,
              variables: {
                input: Object.assign({}, startParam),
              },
            }).then((data) => {
              this.getTenantList()
            }).catch((err) => {
              ElMessage.error({message: err.message || '请求失败请重试'})
            })
            break
          default:
            console.log('')
        }
      },
      handleNext () {
        this.active++
      },
      handlePre () {
        this.active--
      },
      closeCreateRC (val) {
        this.isCreateRC = val
      },
      handleSubmit (formName) {
        this.oldFormData = cloneDeep(this.formData)
        this.btnDisabled = true
        this.formData.enabled = true // demo环境不需要，后端大兴项目有维护该字段，不加会出现：租户管理禁止登录
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.isModify) {
              if (this.tenantList.some(t => t.tenantCode === this.formData.tenantCode && t.tenantId !== this.formData.tenantId)) {
                ElMessage.warning('租户编码已存在!')
                return
              }
              this.$apollo.mutate({
                mutation: UPDATE_TENANT,
                variables: {
                  input: this.formData,
                },
              }).then((data) => {
                this.btnDisabled = false
                let isActiveRegistrationCode = data.data.data
                this.getTenantList()
                this.$refs[formName].resetFields()
                if (isActiveRegistrationCode !== 'already') {
                  this.registrationCode = isActiveRegistrationCode
                  this.isCreateRC = true
                }
                this.dialogVisible = false
              }).catch((err) => {
                this.formData = this.oldFormData
                this.btnDisabled = false
                ElMessage.error({message: err.message || '请求失败请重试'})
              })
            } else {
              if (this.tenantList.some(t => t.tenantCode === this.formData.tenantCode)) {
                ElMessage.warning('租户编码已存在!')
                return
              }
              // this.formData.tenantLevelId = 0
              this.$apollo.mutate({
                mutation: SAVE_TENANT,
                variables: {
                  input: this.formData,
                },
              }).then((data) => {
                this.btnDisabled = false
                this.getTenantList()
                this.$refs[formName].resetFields()
                this.registrationCode = data.data.data
                this.isCreateRC = true
                this.dialogVisible = false
              }).catch((err) => {
                this.formData = this.oldFormData
                this.btnDisabled = false
                ElMessage.error({message: err.message || '请求失败请重试'})
              })
            }
          } else {
            this.btnDisabled = false
          }
        })
      },
      // 没用到
      limitLetter () {
        this.formData.username = this.formData.username.replace(/[^a-zA-z]/g, '')
      },
      /* 管理员搜索弹出 start */
      handleSelectUser (item) {
        let curItemArr = JSON.stringify(item) === '{}' // Object.keys(curMDResult.data[0])
        // console.log('aaa', item, curItemArr)
        if (curItemArr) {
          this.hasUserList = false
        } else {
          this.hasUserList = true
          this.formData.name = item.name
          this.formData.username = item.username
          this.formData.phoneNumber = item.phoneNumber
          this.formData.email = item.email
          this.formData.password = item.password
        }
      },
      /* 管理员搜索弹出 end */
    },
  }
</script>

<style lang="scss">
  .tenant-list-view {
    // > ::before {
    //   content: '';
    //   position: fixed;
    //   z-index: 10;
    //   top: 50px;
    //   width: 100%;
    //   border-top: 20px solid theme('colors.gray.lighter');
    // }

    .mr30 {
      margin-right: 30px;
    }

    .my-main {
      @apply bg-white;
      margin-top: 55px;
      padding: 20px;
    }

    .dialogVisible {

      .el-dialog__body {
        padding: 30px 20px 30px 100px;
        min-height: 367px;

        .codeItem {
          .el-form-item__content {
            @apply flex items-center justify-center;
          }
        }

        .password-item {
          .el-input__suffix {
            top: -5px;
          }
        }

        .select-item {
          .el-input__suffix {
            top: 5px;
          }

          .is-focus {
            .el-input__suffix {
              top: -6px;
            }
          }
        }

        .el-input--suffix {
          width: 240px;
        }

        .el-textarea {
          height: 70px;

          .el-textarea__inner {
            height: 70px;
          }
        }
      }

      .el-dialog__footer {
        width: 680px;
      }
    }

    .el-tabs__item:hover, .el-tabs__item.is-active {
      @apply text-blue;
    }

    .el-tabs__active-bar {
      @apply bg-blue;
    }
  }
</style>
