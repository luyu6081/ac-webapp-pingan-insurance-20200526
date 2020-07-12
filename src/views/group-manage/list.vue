<template>
  <div class="group-list-view">
    <el-header class="filter z-10">
      <div class="flex-1">
        <ej-search-input
        v-model="params.keyWords"
        placeholder="请输入检索信息"
        @search="search"/>
      </div>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(1, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">新建</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(2, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">删除</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(3, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">导出</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(4, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager') && $store.state.useBtnFlag">数据同步</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(5, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">下载模板</a>
    </el-header>
    <el-main :style="{minHeight: screenHeight}" class="my-main">
      <div v-ej-loading="loading">
        <el-table
          class="my-table"
          ref="table"
          :data="tableList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="60" v-if="$store.state.userData.permissionCodes.includes('ucManager')"/>
          <el-table-column type="index" label="序号" width="80"/>
          <el-table-column prop="groupName" label="分组名称"/>
          <el-table-column prop="groupDesc" label="工作描述"/>
          <el-table-column prop="managerName" label="负责人"/>
          <el-table-column prop="managerPhone" label="负责人电话"/>
          <el-table-column prop="managerMail" label="邮箱地址"/>
          <el-table-column label="操作" width="130" v-if="$store.state.userData.permissionCodes.includes('ucManager')">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleOperation(6, scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="handleOperation(7, scope.row)">设置用户</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-dialog class="dialogVisible"
        :title="isModify ? '编辑分组' : '新建分组'"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :show-close="false" width="934px">
        <el-form label-position="top" :model="formData" :rules="formRules" ref="formData">
          <el-row>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="分组名称" :label-width="formLabelWidth" prop="groupName">
                <el-input v-model.trim="formData.groupName" maxlength="20" placeholder="请输入分组名称"/>
              </el-form-item>
            </el-col>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="负责人姓名" :label-width="formLabelWidth" prop="managerZName">
                <ej-select-user v-model="formData.managerZName" placeholder="请选择负责人姓名" @handleSelectUser="handleSelectUser"></ej-select-user>
              </el-form-item>
            </el-col>
            <el-col :span="7" class="pinline">
              <el-form-item label="登录账号" :label-width="formLabelWidth" prop="managerName">
                <el-input v-model="formData.managerName" disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="负责人电话" :label-width="formLabelWidth" prop="managerPhone">
                <el-input v-model="formData.managerPhone" disabled/>
              </el-form-item>
            </el-col>
            <el-col :span="14" class="mr30 pinline">
              <el-form-item label="邮箱地址" prop="managerMail">
                <el-input v-model="formData.managerMail" disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="工作描述" prop="groupDesc">
            <el-input type="textarea" v-model.trim="formData.groupDesc" resize="none" maxlength="255" show-word-limit placeholder="请输入工作描述"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel('formData')">取消</el-button>
          <el-button type="primary" :disabled="btnDisabled" @click="handleSubmit('formData')">提交</el-button>
        </div>
      </el-dialog>
      <el-dialog class="dialogVisible"
        title="批量添加用户"
        :visible.sync="userDialogVisible"
        :close-on-click-modal="false"
        :show-close="false" width="934px">
        <div class="user-search">
          <ej-search-input
            v-model="userParams.name"
            placeholder="请输入检索信息"
            @search="searchUser"/>
        </div>
        <el-table
          class="my-table"
          ref="userTable"
          :data="userList"
          style="width: 100%"
          @selection-change="selectionGChange"
        >
          <el-table-column type="selection" width="60" v-if="$store.state.userData.permissionCodes.includes('ucManager')"/>
          <el-table-column prop="name" label="用户名称"/>
          <el-table-column prop="username" label="登录账号"/>
          <el-table-column prop="jobNumber" label="工号"/>
          <el-table-column prop="groupName" label="分组"/>
          <!-- <el-table-column prop="groups" label="分组">
            <template slot-scope="scope">
              {{scope.row.groups.length > 0 ? ''}}
            </template>
          </el-table-column> -->
        </el-table>
        <div class="my-pagination mt-sm">
          <common-pagination
            :total="totalData"
            :page-size="userParams.limit"
            :current-page="userParams.offset"
            @current-change="currentChange"/>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleGCancel">取消</el-button>
          <el-button type="primary" :disabled="btnDisabled" @click="handleGSubmit">提交</el-button>
        </div>
      </el-dialog>
    </el-main>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Row,
    Col,
    Container,
    Dialog,
    Form,
    FormItem,
    Header,
    Input,
    Main,
    Message as ElMessage,
    MessageBox as ElMessageBox,
    Table,
    TableColumn,
  } from 'element-ui'
  import {SearchInput, Loading} from '@ej/ui'
  import Pagination from '@/components/pagination'
  import {cloneDeep} from 'lodash'
  import EjSelectUser from '@/components/select-user.vue'
  import GROUP_LIST from '@/graphql/group/group_list.gql'
  import SAVEORUPDATE_GROUP from '@/graphql/group/save_or_update_group.gql'
  import DELETE_GROUP from '@/graphql/group/delete_group.gql'
  import USER_LIST from '@/graphql/user/user_list.gql'
  import SAVEORUPDATE_USER_GROUP from '@/graphql/group/save_or_update_user_group.gql'
  import USER_BY_GROUPID from '@/graphql/group/user_by_groupid.gql'

  Vue.use(Button)
  Vue.use(Row)
  Vue.use(Col)
  Vue.use(Container)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Header)
  Vue.use(Input)
  Vue.use(Main)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(SearchInput)
  Vue.use(Loading)
  Vue.use(Pagination)

  export default {
    name: 'group-list',
    components: {
      EjSelectUser,
    },
    data () {
      let validateGroupName = (rule, value, callback) => {
        let self = this
        if (value === '' || value === null) {
          callback(new Error('请输入分组名称'))
        } else {
          if (value !== '') {
            if (self.isModify) {
              if (self.tableList.some(t => t.groupName === self.formData.groupName && t.groupId !== self.formData.groupId)) {
                callback(new Error('分组名称已存在'))
              }
            } else {
              if (self.tableList.some(t => t.groupName === self.formData.groupName)) {
                callback(new Error('分组名称已存在'))
              }
            }
          }
          callback()
        }
      }
      return {
        curGroupId: null,
        screenHeight: '800px',
        params: {
          groupId: '',
          limit: 20,
          offset: 0,
          keyWords: '',
        },
        tableList: [],
        checkedList: [],
        loading: false,
        btnDisabled: false,
        dialogVisible: false,
        formLabelWidth: '120px',
        formData: {
          groupName: '',
          groupDesc: '',
          managerZName: '',
          managerName: '',
          managerPhone: '',
          managerMail: '',
        },
        formRules: {
          groupName: [
            {
              required: true,
              validator: validateGroupName,
              // message: '请输入分组名称',
              trigger: 'blur',
            },
          ],
          managerZName: [
            {
              required: true,
              message: '请选择负责人姓名',
              trigger: 'change',
            },
          ],
          groupDesc: [
            {
              required: true,
              message: '请输入工作描述',
              trigger: 'blur',
            },
          ],
        },
        isModify: false,
        // 设置用户
        userDialogVisible: false,
        totalData: 0,
        userParams: {
          name: '',
          groupId: null,
          organizationId: null,
          limit: 10,
          offset: 1,
        },
        userList: [],
        checkedUsers: [], // 获取当前分组下的选中用户
      }
    },

    computed: {
    },

    created () {
      this.getClientHeight()
      this.getGroupList()
    },

    methods: {
      getGroupList (page) {
        this.loading = true
        this.$apollo.query({
          query: GROUP_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: Object.assign({}, this.params),
          },
        }).then(respData => {
          this.loading = false
          this.tableList = []
          let data = respData.data.data
          this.tableList = data
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
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
      search (val) {
        // this.clearParams()
        this.params.keyWords = val
        this.getGroupList()
      },
      clearParams () {
        this.params = {
          groupId: null,
          total: 0,
          limit: 20,
          offset: 0,
          keyWords: '',
        }
      },
      clearFormData () {
        this.formData = {
          groupName: '',
          groupDesc: '',
          managerZName: '',
          managerName: '',
          managerPhone: '',
          managerMail: '',
        }
      },
      // 编辑时：获取某条分组
      getInfoById (id) {
        this.$apollo.query({
          query: GROUP_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              groupId: id,
              keyWords: '',
            },
          },
        }).then(respData => {
          let gDataResult = respData.data.data
          if (gDataResult.length > 0) {
            let data = gDataResult[0]
            this.formData = {
              groupId: data.groupId,
              groupName: data.groupName,
              groupDesc: data.groupDesc,
              managerZName: data.managerName,
              managerName: data.username,
              managerPhone: data.managerPhone,
              managerMail: data.managerMail,
            }
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleOperation (oper, data) {
        switch (oper) {
          case 1:
            // 新建操作
            this.clearFormData()
            if (this.formData.groupId) {
              delete this.formData.groupId
            }
            this.isModify = false
            this.dialogVisible = true
            break
          case 2:
            // 删除操作
            if (!this.checkedList.length) {
              ElMessage.warning('请选择要删除的分组项！')
              return
            }
            ElMessageBox.confirm('是否删除所选项？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true,
            }).then(() => {
              let ids = this.checkedList.map(it => it.groupId)
              this.$apollo.mutate({
                mutation: DELETE_GROUP,
                variables: {
                  input: ids,
                },
              }).then((data) => {
                this.getGroupList()
              }).catch((err) => {
                ElMessage.error({message: err.message || '请求失败请重试'})
              })
            }).catch(() => {
              ElMessage.info('已取消删除')
            })
            break
          case 3:
            // 导出
            break
          case 4:
            // 数据同步
            break
          case 5:
            // 下载模板
            break
          case 6:
            // 编辑
            this.getInfoById(data.groupId)
            this.isModify = true
            this.dialogVisible = true
            break
          case 7:
            // 设置用户
            this.curGroupId = data.groupId
            // this.getUserByGroupId()
            this.userParams.name = ''
            this.userParams.offset = 1
            this.getUserList()
            break
          default:
            console.log()
        }
      },
      handleCancel (formName) {
        this.dialogVisible = false
        this.isModify = false
        this.clearFormData()
        this.$refs[formName].resetFields()
      },
      handleSubmit (formName) {
        this.btnDisabled = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.formData.managerZName) {
              delete this.formData.managerZName
            }
            this.$apollo.mutate({
              mutation: SAVEORUPDATE_GROUP,
              variables: {
                input: this.formData,
              },
            }).then((data) => {
              this.btnDisabled = false
              this.getGroupList()
              this.dialogVisible = false
              this.clearFormData()
              this.$refs[formName].resetFields()
            }).catch((err) => {
              this.btnDisabled = false
              ElMessage.error({message: err.message || '请求失败请重试'})
            })
          } else {
            this.btnDisabled = false
          }
        })
      },
      handleSelectionChange (val) {
        this.checkedList = val
      },
      /* 负责人搜索弹出 start */
      handleSelectUser (item) {
        this.formData.managerZName = item.name
        this.formData.managerName = item.username
        this.formData.managerPhone = item.phoneNumber
        this.formData.managerMail = item.email
      },
      /* 负责人搜索弹出 end */
      // 设置用户 start
      searchUser (val) {
        this.userParams.name = val
        this.userParams.offset = 1
        // this.getUserByGroupId()
        this.getUserList()
      },
      currentChange (val) {
        // console.log('currentChange', val)
        this.userParams.offset = val
        // this.getUserByGroupId()
        this.getUserList()
      },
      getUserList () {
        this.userList = []
        this.$apollo.query({
          query: USER_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: this.userParams,
            // input: {
            //   keyWords: this.userName_keyword,
            //   tenantId: this.$store.state.userData.tenantId,
            // },
          },
        }).then(respData => {
          if (respData) {
            let data = respData.data.data
            this.totalData = data.total ? data.total : 0
            let curData = data.data
            if (curData) {
              let curDataList = []
              curData.forEach(item => {
                // if (item.username !== 'data-manager') {
                //   curDataList.push(item)
                // }
                //  # 是否为系统用户 # true为系统用户：隐藏
                if (!item.systemUser) {
                  curDataList.push(item)
                }
                if (item.groups && item.groups.length > 0) {
                  let curGN = ''
                  item.groups.forEach(item => {
                    curGN = curGN + item.groupName + ','
                  })
                  curGN = curGN.substring(0, curGN.length - 1)
                  item.groupName = curGN
                }
              })
              this.userList = cloneDeep(curDataList)
              this.getUserByGroupId()
            } else {
              this.userList = []
            }
          }
          this.userDialogVisible = true
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getUserByGroupId () {
        this.checkedUsers = []
        this.$apollo.query({
          query: USER_BY_GROUPID,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              groupId: this.curGroupId,
              offset: this.userParams.offset,
              limit: this.userParams.limit,
              keyWords: this.userParams.name,
            },
          },
        }).then(respData => {
          let data = respData.data.data
          let curGData = data.data
          if (curGData.length > 0) {
            this.checkedUsers = curGData
          }
          this.$nextTick(function () {
            if (this.checkedUsers.length > 0) {
              this.checkedUsers.forEach(row => {
                this.userList.forEach(uitem => {
                  // console.log('ss', row.userId, row.userId === uitem.userId, uitem.userId)
                  if (row.userId === uitem.userId) {
                    // console.log('sss', uitem)
                    uitem.checked = true
                    this.$refs.userTable.toggleRowSelection(uitem, true)
                  }
                })
              })
            }
          })
          // this.getUserList()
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      selectionGChange (val) {
        this.userList.forEach(item => {
          item.checked = false
        })
        this.userList.forEach(item => {
          val.forEach(vItem => {
            if (item.userId === vItem.userId) {
              item.checked = true
            }
          })
        })
        // console.log('selectionGChange', this.userList)
      },
      handleGCancel () {
        this.userDialogVisible = false
      },
      // 取两个数组不同的
      getArrDifference (arr1, arr2) {
        return arr1.concat(arr2).filter(function (v, i, arr) {
          return arr.indexOf(v) === arr.lastIndexOf(v)
        })
      },
      // 取两个数组中相同的
      getArrEqual (arr1, arr2) {
        let newArr = []
        for (let i = 0; i < arr2.length; i++) {
          for (let j = 0; j < arr1.length; j++) {
            if (arr1[j] === arr2[i]) {
              newArr.push(arr1[j])
            }
          }
        }
        return newArr
      },
      handleGSubmit () {
        let addIds = []
        this.userList.forEach(item => {
          if (item.checked) {
            addIds.push(item)
          }
        })
        let delIds = []
        this.userList.forEach(item => {
          if (!item.checked) {
            delIds.push(item)
          }
        })
        let addUserId = []
        let gUserIds = this.checkedUsers.map(it => it.userId) // 获取的
        let cUserIds = this.userList.map(it => it.userId) // 原始值
        let asdd = this.getArrEqual(gUserIds, cUserIds)
        let ass = addIds.map(it => it.userId) // 原始值
        asdd.forEach((item, index) => {
          ass.forEach((aitem, cindex) => {
            if (item === aitem) {
              ass.splice(cindex, 1)
            }
          })
        })
        addUserId = ass
        let deleteUserId = []
        let dss = delIds.map(it => it.userId) // 原始值
        let dsdd = this.getArrEqual(dss, gUserIds)
        deleteUserId = dsdd
        // console.log('dssss', delIds, deleteUserId)
        let suUGParams = {}
        if (deleteUserId.length > 0 && addUserId.length > 0) {
          suUGParams.groupId = this.curGroupId
          suUGParams.deleteUserId = deleteUserId
          suUGParams.addUserId = addUserId
        } else if (deleteUserId.length > 0 && addUserId.length === 0) {
          suUGParams.groupId = this.curGroupId
          suUGParams.deleteUserId = deleteUserId
        } else if (addUserId.length > 0 && deleteUserId.length === 0) {
          suUGParams.groupId = this.curGroupId
          suUGParams.addUserId = addUserId
        } else if (addUserId.length === 0 && deleteUserId.length === 0) {
          suUGParams.groupId = this.curGroupId
        }
        // suUGParams.groupId = this.curGroupId
        // suUGParams.deleteUserId = deleteUserId.length > 0 ? deleteUserId : null
        // suUGParams.addUserId = addUserId.length > 0 ? addUserId : null
        // console.log('result', suUGParams)
        // return
        this.$apollo.mutate({
          mutation: SAVEORUPDATE_USER_GROUP,
          variables: {
            // userIds: userIds,
            // groupId: this.curGroupId,
            input: suUGParams,
          },
        }).then((data) => {
          ElMessage.success('设置用户成功！')
          this.userDialogVisible = false
        }).catch((err) => {
          this.userDialogVisible = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      // 设置用户 end
    },
  }
</script>

<style lang="scss">
  .group-list-view {
    .mr30 {
      margin-right: 30px;
    }

    .my-main {
      @apply bg-white;

      margin-top: 55px;
      padding: 20px;
    }

    .my-main {
      .my-pagination {
        display: flex;
        flex-direction: row-reverse;
      }
    }
    .dialogVisible {
      .el-dialog__body {
        padding: 40px 40px 20px 75px;
        min-height: 357px;

        .el-textarea {
          width: 770px;
          height: 157px;

          .el-textarea__inner {
            width: 770px;
            height: 157px;
            border-radius: 4px;
          }
        }
        .user-search {
          .ej-search-input {
            width: 288px !important;
            height: 38px !important;

            .el-input__inner {
              width: 288px !important;
              line-height: 36px !important;
              height: 38px !important;
            }
            .el-input__suffix {
              top: 0;
            }
          }
        }
      }
    }
    .my-table {
      // .el-table__body-wrapper {
      //   height: 500px;
      //   overflow-y: scroll;
      // }
      .my-pagination {
        display: flex;
        flex-direction: row-reverse;
      }
    }
  }
</style>
