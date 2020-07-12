<template>
  <div class="role-setting-view">
      <el-container>
        <el-aside class="my-aside">
          <div class="my-aside-main custom-tree-container">
            <ej-search-input v-model="filterText" placeholder="请输入检索信息"/>
            <div class="add-role-line" @click="handleSave('')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">
              <i class="el-icon-plus"></i>
              添加角色
            </div>
            <el-tree ref="userRoleTree"
              :data="treeData"
              :props="userRoleProps"
              @node-click="handleUserRole"
              :check-strictly="true"
              node-key="id"
              :expand-on-click-node="false"
              :filter-node-method="filterNode">
              <div class="custom-tree-node" slot-scope="{ node, data }">
                <div class="flex justify-between">
                  <span class="node-control" @dblclick="handleEdit(data)" v-if="$store.state.userData.permissionCodes.includes('ucManager')">{{ data.roleName }}</span>
                  <span class="node-control" v-else>{{ data.roleName }}</span>
                  <span v-show="$store.state.userData.permissionCodes.includes('ucManager')">
                    <el-button
                      type="text"
                      size="mini"
                      @click="() => handleSave(data)">
                      添加
                    </el-button>
                    <el-button
                      type="text"
                      size="mini"
                      :disabled="data.roleName === '管理员'"
                      @click="() => handleDel(node, data)">
                      删除
                    </el-button>
                  </span>
                </div>
              </div>
            </el-tree>
          </div>
        </el-aside>
        <el-main class="my-main" :style="{minHeight: screenHeight}" v-ej-loading="loading">
          <div class="functionCon" v-show="!isUserCon">
            <div class="collapseLR collapseLeft" @click="isUserCon=true"><i class="el-icon-arrow-right"></i><label>人员信息</label></div>
            <el-tabs v-model="activeTab" @tab-click="handleTabs">
              <el-tab-pane
                :key="index"
                v-for="(item, index) in systemList"
                :label="item.systemName"
                :name="item.appName"
              >
                {{item.content}}
              </el-tab-pane>
            </el-tabs>
            <div class="functionInfo">
              <div class="flex justify-between">
                <div class="functionTitle">功能权限</div>
                <a class="btn btn-normal" href="javascript:" @click="handleSetPermission" v-if="$store.state.userData.permissionCodes.includes('ucManager') && !aDisabled">保存</a>
                <a class="btn btn-disabled" href="javascript:" v-if="!$store.state.userData.permissionCodes.includes('ucManager') && !aDisabled">保存</a>
              </div>
              <div class="functionList">
                <el-tree
                  :data="funtionList"
                  show-checkbox
                  default-expand-all
                  node-key="permissionId"
                  ref="functionTree"
                  highlight-current
                  :props="defaultProps"
                  :expand-on-click-node="false"
                  :check-on-click-node="true">
                  <!-- :default-checked-keys="permissionChecks" -->
                </el-tree>
              </div>
            </div>
          </div>
          <div class="userCon" v-show="isUserCon">
            <div class="collapseLR collapseRight" @click="isUserCon=false"><i class="el-icon-arrow-left"></i><label>功能权限</label></div>
            <div class="userInfo">
              <div class="user-filter">
                <div class="user-search flex-1">
                  <ej-search-input
                    v-model="params.name"
                    placeholder="请输入检索信息"
                    @search="searchUser"/>
                </div>
                <div class="user-btn">
                  <a class="btn btn-normal" href="javascript:" @click="handleSetUsers" v-if="$store.state.userData.permissionCodes.includes('ucManager')">设置用户</a>
                </div>
              </div>
              <el-table
                class="my-table"
                ref="userRTable"
                :data="userList"
                style="width: 100%"
                @selection-change="selectionChange"
              >
                <el-table-column type="selection" width="60" v-if="$store.state.userData.permissionCodes.includes('ucManager')"/>
                <el-table-column prop="name" label="用户名称"/>
                <el-table-column prop="username" label="登录账号"/>
                <el-table-column prop="jobNumber" label="工号"/>
                <el-table-column prop="roleName" label="角色"/>
                <!-- <el-table-column prop="phoneNumber" label="联系电话"/> -->
              </el-table>
              <div class="my-pagination mt-sm">
                <common-pagination
                  :total="totalData"
                  :page-size="params.limit"
                  :current-page="params.offset"
                  @current-change="currentChange"/>
              </div>
            </div>
          </div>
        </el-main>
        <el-dialog class="dialogVisible"
          :title="isModify ? '编辑角色' : '新建角色'"
          :visible.sync="dialogVisible"
          :close-on-click-modal="false"
          :show-close="false"
          width="534px">
          <el-form :model="formData" ref="formData" :rules="formRules">
            <el-form-item label="父角色" :label-width="formLabelWidth" v-if="formData.parentId !== '0'">
              <label class="el-form-item__label">{{formData.parentName}}</label>
            </el-form-item>
            <el-form-item label="角色编码" :label-width="formLabelWidth" prop="roleCode" >
              <el-input v-model.trim="formData.roleCode" placeholder="请输入角色编码" maxlength="20"/>
            </el-form-item>
            <el-form-item label="角色名称" :label-width="formLabelWidth" prop="roleName" >
              <el-input v-model.trim="formData.roleName" placeholder="请输入角色名称" maxlength="20"/>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="handleRoleOper('formData', 1)">取消</el-button>
            <el-button type="primary" :disabled="btnDisabled" @click="handleRoleOper('formData', 2)">提交</el-button>
          </div>
        </el-dialog>
      </el-container>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Aside,
    Button,
    Container,
    Dialog,
    Form,
    FormItem,
    Header,
    Icon,
    Input,
    Main,
    Message as ElMessage,
    MessageBox as ElMessageBox,
    Table,
    TableColumn,
    Tabs,
    TabPane,
    Tree,
  } from 'element-ui'
  import {SearchInput, Loading} from '@ej/ui'
  import Pagination from '@/components/pagination'
  import {cloneDeep} from 'lodash'

  import ROLE_LIST from '@/graphql/role/role_list.gql'
  import ROLE_USER_LIST from '@/graphql/role/user_list_by_roleid.gql'
  import USER_LIST from '@/graphql/user/user_list.gql'
  import SAVEORUPDATE_USER_GROUP from '@/graphql/role/save_update_user_role.gql'
  import PERMISSION_LIST from '@/graphql/role/permission_list.gql'
  import SAVEORUPDATE_PERMISSION from '@/graphql/role/save_update_permission.gql'
  import SYSTEM_LIST from '@/graphql/role/system_list.gql'
  import SAVEORUPDATE_ROLE from '@/graphql/role/save_update_role.gql'
  import DELETE_ROLE from '@/graphql/role/delete_role.gql'
  import GET_USERINFO from '@/graphql/get_userinfo.gql'

  Vue.use(Aside)
  Vue.use(Button)
  Vue.use(Container)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Header)
  Vue.use(Icon)
  Vue.use(Input)
  Vue.use(Main)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Tree)
  Vue.use(SearchInput)
  Vue.use(Loading)
  Vue.use(Pagination)

  export default {
    name: 'role-setting',
    components: {},
    data () {
      var validateRoleCode = (rule, value, callback) => {
        // let self = this
        if (value === '') {
          callback(new Error('请输入角色编码'))
        } else {
          if (value !== '') {
            if (this.isModify) {
              if (this.noCovertTreeData.some(t => t.roleCode === this.formData.roleCode && t.id !== this.formData.id)) {
                callback(new Error('角色编码已存在'))
              }
            } else {
              if (this.noCovertTreeData.some(t => t.roleCode === this.formData.roleCode)) {
                callback(new Error('角色编码已存在'))
              }
            }
          }
          callback()
        }
      }
      var validateRoleName = (rule, value, callback) => {
        // let self = this
        if (value === '') {
          callback(new Error('请输入角色名称'))
        } else {
          if (value !== '') {
            if (this.isModify) {
              if (this.noCovertTreeData.some(t => t.roleName === this.formData.roleName && t.id !== this.formData.id)) {
                callback(new Error('角色名称已存在'))
              }
            } else {
              if (this.noCovertTreeData.some(t => t.roleName === this.formData.roleName)) {
                callback(new Error('角色名称已存在'))
              }
            }
          }
          callback()
        }
      }
      return {
        screenHeight: '800px',
        filterText: '',
        treeData: [],
        aDisabled: false,
        dialogVisible: false,
        btnDisabled: false,
        isModify: false,
        formLabelWidth: '120px',
        formData: {
          parentName: '',
          parentId: '',
          roleCode: '',
          roleName: '',
        },
        formRules: {
          roleCode: [
            {
              required: true,
              validator: validateRoleCode,
              // message: '请输入角色编码',
              trigger: 'blur',
            },
          ],
          roleName: [
            {
              required: true,
              validator: validateRoleName,
              // message: '请输入角色名称',
              trigger: 'blur',
            },
          ],
        },
        userRoleProps: {
          children: 'children',
          label: 'roleName',
        },
        // 设置用户
        params: {
          name: '',
          groupId: null,
          organizationId: null,
          limit: 10,
          offset: 1,
        },
        totalData: 0,
        userList: [],
        checkedUsers: [], // 获取当前角色下的选中用户
        systemList: [],
        selRoleId: '',
        selRoleName: '',
        activeTab: '',
        loading: false,
        isUserCon: false,
        defaultProps: {
          children: 'children',
          label: 'permissionName',
        },
        funtionList: [],
        getPIds: [], // 功能列表中父级数据
        permissionChecks: [],
        noCovertTreeData: [],
      }
    },

    computed: {},
    watch: {
      filterText (val) {
        this.$refs.userRoleTree.filter(val)
      },
    },

    created () {
      this.getClientHeight()
      let curSystemData = this.getSystemList()
      curSystemData.then(res => {
        this.getUserRoleTree()
      })
    },

    methods: {
      async getSystemList () {
        let systemParams = {
          appName: null,
        }
        let data = await this.$apollo.query({
          query: SYSTEM_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: Object.assign({}, systemParams),
          },
        })
        if (data) {
          let curData = data.data.data
          this.systemList = curData
          this.activeTab = curData[0].appName
          this.getPermissionList()
        }
      },
      async getUserRoleTree () {
        let data = await this.$apollo.query({
          query: ROLE_LIST,
          fetchPolicy: 'no-cache',
        })
        if (data) {
          let curData = data.data.data
          this.noCovertTreeData = curData
          this.treeData = this.covertChildrenData(curData)
          if (this.treeData.length > 0) {
            this.$nextTick(e => {
              this.$refs.userRoleTree.setCurrentKey(this.treeData[0].id)
            })
            this.handleUserRole(this.treeData[0])
          }
        }
      },
      // 设置用户 start
      searchUser (val) {
        this.params.name = val
        this.params.offset = 1
        // this.getUserListByRoleId()
        this.getUserList()
      },
      currentChange (val) {
        this.params.offset = val
        this.getUserList()
        // this.getUserListByRoleId()
      },
      getUserList () {
        this.userList = []
        this.$apollo.query({
          query: USER_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: this.params,
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
              })
              this.userList = cloneDeep(curDataList)
              this.getUserListByRoleId()
            } else {
              this.userList = []
            }
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getUserListByRoleId () {
        this.$apollo.query({
          query: ROLE_USER_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              roleId: this.selRoleId,
            },
          },
        }).then(respData => {
          let data = respData.data.data
          this.checkedUsers = []
          if (data.length > 0) {
            this.checkedUsers = data
          }
          this.$nextTick(function () {
            if (this.checkedUsers.length > 0) {
              this.checkedUsers.forEach(row => {
                this.userList.forEach(uitem => {
                  // console.log('ss', row.userId, row.userId === uitem.userId, uitem.userId)
                  if (row.userId === uitem.userId) {
                    // console.log('sss', uitem)
                    uitem.checked = true
                    this.$refs.userRTable.toggleRowSelection(uitem, true)
                  }
                })
              })
            }
          })
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      selectionChange (val) {
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
      handleSetUsers () {
        this.loading = true
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
          suUGParams.roleId = this.selRoleId
          suUGParams.deleteUserId = deleteUserId
          suUGParams.addUserId = addUserId
        } else if (deleteUserId.length > 0 && addUserId.length === 0) {
          suUGParams.roleId = this.selRoleId
          suUGParams.deleteUserId = deleteUserId
        } else if (addUserId.length > 0 && deleteUserId.length === 0) {
          suUGParams.roleId = this.selRoleId
          suUGParams.addUserId = addUserId
        } else if (addUserId.length === 0 && deleteUserId.length === 0) {
          suUGParams.roleId = this.selRoleId
        }
        // console.log('result', suUGParams)
        // return
        this.$apollo.mutate({
          mutation: SAVEORUPDATE_USER_GROUP,
          variables: {
            // userIds: userIds,
            // roleId: this.selRoleId,
            input: suUGParams,
          },
        }).then((data) => {
          this.loading = false
          ElMessage.success('设置用户成功！')
          this.getUserList()
        }).catch((err) => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      // 设置用户 end
      getPermissionList () {
        this.loading = true
        this.$apollo.query({
          query: PERMISSION_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: {
              roleId: this.selRoleId,
              appName: this.activeTab,
            },
          },
        }).then(respData => {
          this.loading = false
          let data = respData.data.data
          this.funtionList = []
          this.getPIds = []
          this.permissionChecks = []
          if (data.length > 0) {
            // 获取所有父级id
            for (let i = 0; i < data.length; i++) {
              this.getPIds.push(data[i].parentId)
            }
            this.funtionList = this.covertPermissionChildrenData(data)
            // 选中的Id中包含半选中节点/子节点：以下是去重半选中节点
            let curPCIds = this.permissionChecks
            let newCIds = []
            for (let d = 0; d < curPCIds.length; d++) {
              let permissionId = curPCIds[d]
              let isP = this.getPIds.includes(permissionId)
              if (!isP) {
                newCIds.push(permissionId)
              }
            }
            this.$nextTick(() => {
              this.$refs['functionTree'].setCheckedKeys(newCIds)
            })
          }
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getClientHeight () {
        /*
        * 头：50
        * 间距：20 去掉
        */
        let height = 70
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight
        this.screenHeight = clientHeight - height + 'px'
      },
      // 将数据转换成带children的（通过parentId）
      covertChildrenData (rows) {
        function exists (rows, parentId) {
          for (var i = 0; i < rows.length; i++) {
            if (rows[i].id === parentId.toString()) return true
          }
          return false
        }
        let nodes = []
        // get the top level nodes
        for (var j = 0; j < rows.length; j++) {
          let row = rows[j]
          if (!exists(rows, row.parentId)) {
            nodes.push(row)
          }
        }
        let parentNode = []
        for (var i = 0; i < nodes.length; i++) {
          parentNode.push(nodes[i])
        }
        while (parentNode.length) {
          let node = parentNode.shift()
          for (var x = 0; x < rows.length; x++) {
            let rowC = rows[x]
            if (rowC.parentId.toString() === node.id) {
              if (node.children) {
                node.children.push(rowC)
              } else {
                node.children = [rowC]
              }
              parentNode.push(rowC)
            }
          }
        }
        return nodes
      },
      covertPermissionChildrenData (rows) {
        function exists (rows, parentId) {
          for (var i = 0; i < rows.length; i++) {
            if (rows[i].permissionId === parentId) return true
          }
          return false
        }
        let nodes = []
        // get the top level nodes
        for (var j = 0; j < rows.length; j++) {
          let row = rows[j]
          if (!exists(rows, row.parentId)) {
            nodes.push(row)
          }
        }
        let parentNode = []
        for (var i = 0; i < nodes.length; i++) {
          parentNode.push(nodes[i])
        }
        while (parentNode.length) {
          let node = parentNode.shift()
          for (var x = 0; x < rows.length; x++) {
            let rowC = rows[x]
            if (!this.$store.state.userData.permissionCodes.includes('ucManager')) {
              rowC.disabled = true
            } else if (rowC.permissionName.indexOf('用户权限中心设置') >= 0 && this.selRoleName === '管理员') {
              rowC.disabled = true
            }
            if (rowC.flag) {
              this.permissionChecks.push(rowC.permissionId)
            }
            if (rowC.parentId === node.permissionId) {
              if (node.children) {
                node.children.push(rowC)
              } else {
                node.children = [rowC]
              }
              parentNode.push(rowC)
            }
          }
        }
        return nodes
      },
      handleUserRole (data) {
        // 权限
        this.selRoleId = data.id
        this.selRoleName = data.roleName
        this.getPermissionList()
        // 用户
        this.params.name = ''
        this.params.offset = 1
        // this.getUserListByRoleId()
        this.getUserList()
      },
      handleTabs () {
        this.getPermissionList()
      },
      getUserinfo () {
        this.$apollo.query({
          query: GET_USERINFO,
          fetchPolicy: 'no-cache',
        }).then(respData => {
          let data = respData.data.data
          this.$store.commit('setUserInfo', {
            tenantId: data.tenantId,
            tenantName: data.tenantName,
            name: data.name,
            username: data.username,
            avatar: data.userAvatar,
            permissionCodes: data.permissionCodes,
          })
        })
      },
      // 保存
      handleSetPermission () {
        this.aDisabled = true
        // 获取半选中父节点、子节点：合并
        let curPIds = this.$refs.functionTree.getHalfCheckedKeys()
        let curSIds = this.$refs.functionTree.getCheckedKeys()
        let curAlls = curPIds.concat(curSIds)
        this.$apollo.mutate({
          mutation: SAVEORUPDATE_PERMISSION,
          variables: {
            input: {
              permissionIds: curAlls, // this.$refs.functionTree.getCheckedKeys(),
              roleId: this.selRoleId,
              appName: this.activeTab,
            },
          },
        }).then((data) => {
          this.aDisabled = false
          this.getUserinfo()
          this.getPermissionList(this.selRoleId)
          ElMessage.success('保存成功')
        }).catch((err) => {
          this.aDisabled = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      filterNode (value, data) {
        if (!value) return true
        return data.roleName.indexOf(value) !== -1 || data.roleCode.indexOf(value) !== -1
      },
      handleSave (data) {
        this.formData.roleName = ''
        this.formData.roleCode = ''
        if (data) {
          if (data.parentId !== '0') {
            ElMessage.warning('角色层级不可超过两层')
            return
          }
          this.formData.parentId = data.id
          this.formData.parentName = data.roleName
          this.isModify = false
          this.dialogVisible = true
        } else {
          // 添加一级角色
          this.isModify = false
          this.formData.parentId = '0'
          this.dialogVisible = true
        }
      },
      handleEdit (data) {
        this.isModify = true
        this.formData = {
          id: data.id,
          parentName: '',
          parentId: data.parentId,
          roleCode: data.roleCode,
          roleName: data.roleName,
        }
        this.dialogVisible = true
      },
      handleDel (node, data) {
        let delIds = []; let childrenLenth = data.children ? data.children.length : ''
        delIds.push(data.id)
        if (data.children) {
          data.children.forEach(item => {
            delIds.push(item.id)
          })
        }
        ElMessageBox.confirm(childrenLenth ? '该项下有' + childrenLenth + '个子项,是否删除所有项？' : '是否删除该项？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true,
        }).then(() => {
          this.$apollo.mutate({
            mutation: DELETE_ROLE,
            variables: {
              input: delIds,
            },
          }).then((data) => {
            this.getUserRoleTree()
          }).catch((err) => {
            ElMessage.error({message: err.message || '请求失败请重试'})
          })
        }).catch(() => {
          ElMessage.info('已取消删除')
        })
      },
      handleRoleOper (formName, oper) {
        switch (oper) {
          case 1:
            this.dialogVisible = false
            this.$refs[formName].resetFields()
            break
          case 2:
            this.btnDisabled = true
            this.$refs[formName].validate((valid) => {
              if (valid) {
                // if (this.isModify) {
                //   if (this.treeData.some(t => t.roleName === this.formData.roleName && t.id !== this.formData.id)) {
                //     ElMessage.warning('角色编码已存在!')
                //     return
                //   }
                // } else {
                //   if (this.treeData.some(t => t.roleName === this.formData.roleName)) {
                //     ElMessage.warning('角色编码已存在!')
                //     return
                //   }
                // }
                if (this.formData.parentName || this.formData.parentName === '') {
                  delete this.formData.parentName
                }
                this.$apollo.mutate({
                  mutation: SAVEORUPDATE_ROLE,
                  variables: {
                    input: this.formData,
                  },
                }).then((data) => {
                  this.btnDisabled = false
                  this.$refs[formName].resetFields()
                  this.getUserRoleTree()
                  this.dialogVisible = false
                }).catch((err) => {
                  this.btnDisabled = false
                  ElMessage.error({message: err.message || '请求失败请重试'})
                })
              } else {
                this.btnDisabled = false
              }
            })
            break
          default:
            console.log(oper)
        }
      },
    },
  }
</script>

<style lang="scss">
  .role-setting-view {
    min-height: 698px;
    height: 100%;
    .collapseLR {
      width: 19px;
      height: 338px;
      padding-top: 119px;
      padding-left: 3px;
      border: 1px solid #D8DEE4;
      border-left: none;
      box-shadow: 0px 2px 4px 2px rgba(142,142,142,0.12);
      border-radius: 10px;
      font-size: 12px;
      color: #477DE9;
      @apply bg-white;
      cursor: pointer;
      i {
        width: 15px;
        height: 15px;
        font-size: 16px;
        color: #477DE9;
      }
      &.collapseLeft {
        margin-top: 52px;
        position: absolute;
        left: 0;
        top: 110px;
      }
      &.collapseRight {
        position: absolute;
        right: 0;
        top: 110px;
      }
    }
    .my-aside, .my-aside-main {
      width: 335px !important;
    }
    .my-aside-main {
      position: fixed;
      top: 70px;
      bottom: 0;
      .add-role-line {
        margin-top: 10px;
        height: 24px;
        line-height: 24px;
        border: 1px dashed #477DE9;
        font-size: 12px;
        color: #333333;
        text-align: center;
        cursor: pointer;
      }
      .is-current {
        color:rgb(71, 125, 233);
        background: #F5F5F5;
      }
      .is-expanded {
        &.is-current {
          .el-tree-node__children {
            color: #606266;
            background: #FFFFFF;
          }
        }
      }
    }
    .my-main {
      background: theme('colors.white');
      padding: 0;
    }
    .userCon {
      position: relative;
    }
    .functionCon {
      position: relative;
    }
    .functionInfo {
      margin: 0 30px 20px 30px;
      position: relative;
      .functionTitle {
        font-size: 14px;
      }
      .functionList {
        margin-left: 5px;
        .el-tree-node__expand-icon {
          // display: none;
        }
        .el-tree-node {
          margin-top: 25px;
        }
        .el-tree-node__children {
          .el-tree-node {
            margin-top: 18px;
            // float: left;
          }
        }
      }
    }
    .userInfo {
      margin: 15px 30px 20px 20px;
      .user-filter {
        @apply flex;
        width: 100%;
        .user-search {
          .ej-search-input {
            width: 500px !important;
          }
        }
        .user-btn {
          margin-top: 10px;
        }
      }
      .my-pagination {
        display: flex;
        flex-direction: row-reverse;
      }
    }
    .my-aside-main {
      overflow-y: auto;
      @apply bg-white;
      border-right: 2px solid theme('colors.gray.light');
      padding: 15px 20px 20px 20px;
      // .is-current {
      //   .el-tree-node__content {
      //     span {
      //       color: #477de9;
      //     }
      //   }
      // }
    }

    .my-main {
      .toast {
        display: flex;
        align-items: center;
        @apply bg-blue;
        height: 32px;
        border: 1px solid theme('colors.blue.default');
        border-radius: 4px;
        padding: 0 12px;
        font-size: theme('fontSize.sm');

        a {
          @apply text-blue;
          padding: 0 2px;
        }
      }
    }
    .dialogVisible {
      .el-dialog__body {
        min-height: 250px;
      }
      .el-form-item__label {
        line-height: 35px;
      }
      .el-dialog__footer {
        width: 534px;
      }
    }
  }

</style>
<style lang="scss">
  .role-setting-view {
    .el-tree {
      margin-top: 15px;
      .custom-tree-node {
        margin-right: 8px;
        width: 100%;
        line-height: 26px;
        .el-button+.el-button {
          outline: none;
        }
        .node-control {
          width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .el-tabs {
      margin: 0 10px;
      .el-tabs__active-bar {
        @apply bg-blue;
      }
      .el-tabs__item {
        text-align: center;
      }
      .el-tabs__item:hover, .el-tabs__item.is-active {
        @apply text-blue;
      }
    }
  }
</style>
