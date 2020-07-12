<template>
  <div class="user-list-view" v-if="isAuth">
    <el-header class="filter z-10">
      <div class="flex-1">
        <ej-search-input v-model="params.name" placeholder="请输入检索信息" @search="search"/>
      </div>
      <a class="btn btn-normal" href="javascript:" @click="handleOper(6, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">新建</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOper(1, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">删除</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOper(3, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">导出</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOper(4, '')" v-if="!$store.state.useBtnFlag">数据同步</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOper(5, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">下载模板</a>
    </el-header>
    <el-container>
      <el-aside class="my-aside">
        <div class="my-aside-main">
          <el-tabs v-model="activeTab"  @tab-click="handleTabClick">
            <el-tab-pane label="机构设置" name="organization">
              <el-tree ref="organTree" :data="treeData" :props="organizationProps" node-key="id" @node-click="handleOrganization" :expand-on-click-node="false"></el-tree>
            </el-tab-pane>
            <el-tab-pane label="分组设置" name="group">
              <el-tree ref="groupTree" :data="groupList" node-key="groupId" :props="groupProps" @node-click="handleGroup"></el-tree>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-aside>
      <el-main :style="{minHeight: screenHeight}" class="my-main">
        <div class="toast">
          <div class="mr-sm">已选择<a href="javascript:" @click="check('checked')">{{checkedList.length}}</a>项</div>
          <div>总共<a href="javascript:" @click="check('all')">{{total}}</a>个用户</div>
        </div>
        <div v-ej-loading="loading">
          <el-table
            class="my-table"
            ref="table"
            :data="userList"
            style="width: 100%"
            @selection-change="selectionChange"
          >
            <el-table-column type="selection" width="60" v-if="$store.state.userData.permissionCodes.includes('ucManager')"/>
            <el-table-column prop="name" label="用户姓名"/>
            <el-table-column prop="username" label="登录账号"/>
            <el-table-column prop="jobNumber" label="工号" width="80"/>
            <el-table-column prop="position" label="职位"/>
            <el-table-column prop="roleName" label="角色"/>
            <el-table-column prop="phoneNumber" label="联系电话" width="130"/>
            <el-table-column prop="email" label="邮箱地址"/>
            <el-table-column label="操作" width="60" v-if="$store.state.userData.permissionCodes.includes('ucManager') || !curBtnFlag">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleOper(7, scope.row.userId)" v-if="!curBtnFlag">角色设置</el-button>
                <el-button type="text" size="small" @click="handleOper(2, scope.row.userId)" v-if="$store.state.userData.permissionCodes.includes('ucManager')">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="my-pagination mt-sm" v-show="isTotal">
            <common-pagination
              :total="total"
              :page-size="params.limit"
              :current-page="currentPage"
              @current-change="getUserList"/>
          </div>
        </div>
      </el-main>
      <el-dialog class="dialogVisible"
        title="角色设置"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :show-close="false"
        width="700px">
        <div class="role-info">
          <h2>角色关联</h2>
          <el-tag
            v-for="tag in roleList"
            :key="tag.id"
            @click="handleTagClick(tag)">
            <span :id="tag.id" :class="tag.select ? 'select' : ''">
              {{tag.roleName}}
            </span>
          </el-tag>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel('formData')">取消</el-button>
          <el-button type="primary" :disabled="btnDisabled" @click="handleSubmit('formData')">提交</el-button>
        </div>
      </el-dialog>
    </el-container>
  </div>
  <div class="empty-content flex items-center justify-center" :style="{minHeight: screenHeight}" v-else>用户无权限</div>
</template>

<script>
  import Vue from 'vue'
  import {
    Aside,
    Button,
    Container,
    Dialog,
    Header,
    Main,
    Message as ElMessage,
    MessageBox as ElMessageBox,
    Table,
    TableColumn,
    Tabs,
    Tag,
    TabPane,
    Tree,
  } from 'element-ui'
  import {SearchInput, Loading} from '@ej/ui'

  import runtimeArgs from '@/runtime-args'

  import {cloneDeep} from 'lodash'
  import ORGANIZATION_LIST from '@/graphql/user/organization_list.gql'
  import GROUP_LIST from '@/graphql/group/group_list.gql'
  import USER_LIST from '@/graphql/user/user_list.gql'
  import DELETE_USER from '@/graphql/user/delete_user.gql'
  import CHECK_TENANT_LEVEL from '@/graphql/user/check_tenant_level.gql'
  import ROLE_LIST from '@/graphql/role/role_list.gql'
  import UPDATE_USERROLE_BY_ID from '@/graphql/user/update_userrole_by_id.gql'
  import DATA_SYNCH from '@/graphql/organization/data_synch.gql'
  import USER_INFO from '@/graphql/user/user_info.gql'
  // import {toTreeData} from '@/utils'

  import Pagination from '@/components/pagination'

  Vue.use(Aside)
  Vue.use(Button)
  Vue.use(Container)
  Vue.use(Dialog)
  Vue.use(Header)
  Vue.use(Main)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Tabs)
  Vue.use(Tag)
  Vue.use(TabPane)
  Vue.use(Tree)
  Vue.use(SearchInput)
  Vue.use(Pagination)
  Vue.use(Loading)

  export default {
    name: 'ListView',
    components: {},
    data () {
      return {
        // ucManager: this.$store.state.userData.permissionCodes.includes('ucManager'),
        curBtnFlag: runtimeArgs.VUE_APP_USE_BUTTON_FLAG, // cas机构/用户页面中：按钮使用权限 true为可使用 false为不可使用
        screenHeight: '800px',
        params: {
          name: '',
          groupId: null,
          organizationId: null,
          limit: 10,
          offset: 1,
        },
        userList: [],
        checkedList: [],
        cacheList: [],
        treeData: [],
        groupList: [],
        organizationProps: {
          children: 'children',
          label: 'organizationName',
        },
        groupProps: {
          children: 'children',
          label: 'groupName',
        },
        activeTab: 'organization',
        total: 0,
        isTotal: true,
        loading: false,
        isAuth: true,
        // visible: false,
        /* 角色关联start */
        dialogVisible: false,
        roleList: [],
        btnDisabled: false,
        curUserId: '',
        /* 角色关联end */
      }
    },

    computed: {
      currentPage () {
        return this.params.offset
      },
    },

    created () {
      this.getClientHeight()
      if (this.$route.query.type === 'group') {
        this.activeTab = 'group'
        this.getGroupList()
      } else {
        this.getOrganizationList()
      }
      this.getUserList()
    },

    methods: {
      async getOrganizationList () {
        let data = await this.$apollo.query({
          query: ORGANIZATION_LIST,
          fetchPolicy: 'no-cache',
        })
        if (data) {
          // let options = {
          //   id: 'id',
          //   parentId: 'parentId',
          //   name: 'organizationName',
          //   rootId: '0',
          // }
          // this.treeData = toTreeData(data.data.data, options) // 不是树
          this.treeData = this.covertChildrenData(data.data.data)
          // if (this.treeData.length > 0) {
          //   this.$nextTick(e => {
          //     this.$refs.organTree.setCurrentKey(this.treeData[0].id)
          //   })
          //   this.params.organizationId = this.treeData[0].id
          //   this.getUserList()
          // }
        }
      },
      // 将数据转换成带children的（通过parentId）
      covertChildrenData (rows) {
        function exists (rows, parentId) {
          for (var i = 0; i < rows.length; i++) {
            if (rows[i].id === parentId) return true
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
          nodes[i].level = 0
          parentNode.push(nodes[i])
        }
        while (parentNode.length) {
          let node = parentNode.shift()
          for (var x = 0; x < rows.length; x++) {
            let rowC = rows[x]
            if (rowC.parentId === node.id) {
              rowC.level = node.level + 1
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
      getUserList (page) {
        if (page) {
          this.params.offset = page
        } else {
          this.params.offset = this.$route.query.pageNum ? parseInt(this.$route.query.pageNum) : 1
        }
        this.loading = true
        this.$apollo.query({
          query: USER_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: Object.assign({}, this.params),
          },
        }).then(respData => {
          this.loading = false
          if (respData) {
            let data = respData.data.data
            this.total = data.total ? data.total : 0
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
              this.cacheList = cloneDeep(curDataList)
              this.$nextTick(() => {
                this.toggleRowSelection()
              })
            } else {
              this.userList = []
              this.cacheList = []
            }
          }
        }).catch((err) => {
          this.loading = false
          let code = err.graphQLErrors[0].extensions.code
          if (code === '403') {
            this.isAuth = false
          }
        })
      },
      getGroupList () {
        this.$apollo.query({
          query: GROUP_LIST,
          fetchPolicy: 'network-only',
        }).then(respData => {
          if (respData) {
            let data = respData.data.data
            this.groupList = data.map(it => {
              it.children = []
              return it
            })
            // if (this.groupList.length > 0) {
            //   this.$nextTick(e => {
            //     this.$refs.groupTree.setCurrentKey(this.groupList[0].groupId)
            //   })
            //   this.params.groupId = this.groupList[0].groupId
            //   this.getUserList()
            // }
          }
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
        this.clearParams()
        this.params.name = val
        this.getUserList()
      },
      show () {
        this.visible = true
        document.addEventListener('click', this.clearOrganizationParam, false)
      },
      hide () {
        this.visible = false
        document.removeEventListener('click', this.clearOrganizationParam, false)
      },
      clearOrganizationParam (e) {
        if (e.target.className === 'my-aside-main') {
          this.hide()
          this.$refs.organTree.setCurrentKey(this.organEmpty)
          let sss = document.getElementsByClassName('is-current')[0]
          if (sss) {
            document.getElementsByClassName('is-current')[0].className = 'el-tree-node is-focusable'
          }
          this.params.organizationId = null
          this.getUserList()
        }
      },
      handleOrganization (data) {
        this.params.organizationId = data.id
        this.getUserList()
        // if (this.visible) {
        //   this.hide()
        //   this.visible = true
        //   this.params.organizationId = data.id
        //   this.getUserList()
        // } else {
        //   this.show()
        //   this.visible = false
        //   this.params.organizationId = data.id
        //   this.getUserList()
        // }
      },
      handleGroup (data) {
        this.params.groupId = data.groupId
        this.getUserList()
      },
      selectionChange (selection) {
        if (this.timer) {
          clearTimeout(this.timer)
          this.timer = null
        }
        this.timer = setTimeout(() => {
          this.userList.forEach(item => {
            this.checkedList.forEach((cheItem, index) => {
              if (cheItem.userId === item.userId) {
                this.checkedList.splice(index, 1)
              }
            })
          })
          this.checkedList = this.checkedList.concat(selection)
        })
      },
      clearParams () {
        this.params = {
          name: '',
          groupId: null,
          organizationId: null,
          limit: 20,
          offset: 0,
        }
      },
      handleOper (oper, data) {
        switch (oper) {
          case 1:
            // 删除
            if (!this.checkedList.length) {
              ElMessage.warning('请选择要删除的用户！')
              return
            }
            ElMessageBox.confirm('是否删除所选项？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true,
            }).then(() => {
              let ids = this.checkedList.map(it => it.userId)
              this.$apollo.mutate({
                mutation: DELETE_USER,
                variables: {
                  input: ids,
                },
              }).then((data) => {
                this.checkedList = []
                this.getUserList()
              }).catch((err) => {
                ElMessage.error({message: err.message || '请求失败请重试'})
              })
            }).catch(() => {
              ElMessage.info('已取消删除')
            })
            break
          case 2:
            // 编辑
            this.$router.push({path: '/users/user/operates', query: {pageNum: this.params.offset, id: data, type: this.activeTab}})
            break
          case 3:
            // 导出
            break
          case 4:
            // 数据同步
            this.$apollo.mutate({
              mutation: DATA_SYNCH,
              fetchPolicy: 'no-cache',
              variables: {
                password: 'dfjx', // this.$store.state.userData.password,
              },
            }).then((data) => {
              if (data.data.data) {
                this.getUserList()
                ElMessage.success('数据同步完成')
              } else {
                ElMessage.error('数据同步失败')
              }
            }).catch((err) => {
              ElMessage.error({message: err.message || '请求失败请重试'})
            })
            break
          case 5:
            // 下载模板
            break
          case 6:
            // 新建
            this.$apollo.query({
              query: CHECK_TENANT_LEVEL,
              fetchPolicy: 'no-cache',
            }).then(respData => {
              if (respData) {
                if (respData.data.data) {
                  this.$router.push({path: '/users/user/operates', query: {pageNum: this.params.offset, type: this.activeTab}})
                } else {
                  ElMessage.warning('当前可新建用户数量已达上限，请联系管理员升级')
                }
              }
            })
            break
          case 7:
            // 角色设置
            this.getRoleList(data)
            break
          default:
            console.log('')
        }
      },
      /* 角色start */
      getUserInfoById () {
        let self = this
        self.$apollo.query({
          query: USER_INFO,
          fetchPolicy: 'network-only',
          variables: {
            input: [self.curUserId],
          },
        }).then(respData => {
          let curUserInfo = respData.data.data[0]
          self.roleList.find(item => {
            curUserInfo.roles.find(litem => {
              if (item.id === litem.id) {
                item.select = true
              }
            })
          })
          self.dialogVisible = true
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getPermissionCodesById () {
        this.$apollo.query({
          query: USER_INFO,
          fetchPolicy: 'network-only',
          variables: {
            input: [this.curUserId],
          },
        }).then(respData => {
          let curUserInfo = respData.data.data[0]
          // let curUserData = this.$store.state.userData
          if (this.$store.state.userData.userId === curUserInfo.userId) {
            this.$store.commit('setUserInfo', {
              userId: curUserInfo.userId,
              tenantId: this.$store.state.userData.tenantId,
              name: this.$store.state.userData.name,
              tenantName: this.$store.state.userData.tenantName,
              avatar: this.$store.state.userData.userAvatar,
              permissionCodes: curUserInfo.permissionCodes,
              tenantLevel: this.$store.state.userData.tenantLevel,
            })
            this.$store.commit('setUseBtnFlag', curUserInfo.permissionCodes.includes('ucManager') && runtimeArgs.VUE_APP_USE_BUTTON_FLAG)
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getRoleList (id) {
        this.curUserId = id
        this.$apollo.query({
          query: ROLE_LIST,
          fetchPolicy: 'no-cache',
        }).then(respData => {
          let data = respData.data.data
          this.roleList = []
          if (data.length > 0) {
            this.roleList = data
            this.getUserInfoById(this.curUserId)
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleTagClick (tag) {
        let clickRArr = cloneDeep(this.roleList)
        clickRArr.map(item => {
          if (tag.id === item.id) {
            item.select = !tag.select
          }
        })
        this.roleList = clickRArr
      },
      handleCancel (formName) {
        this.dialogVisible = false
      },
      handleSubmit () {
        let roleIds = []
        this.roleList.forEach(item => {
          if (item.select) {
            roleIds.push(item.id)
          }
        })
        this.$apollo.mutate({
          mutation: UPDATE_USERROLE_BY_ID,
          variables: {
            input: {
              roleIds: roleIds,
              id: this.curUserId,
            },
          },
        }).then((data) => {
          ElMessage.success('角色设置成功！')
          this.getUserList()
          this.dialogVisible = false
          this.getPermissionCodesById()
        }).catch((err) => {
          this.isSubmitDisabled = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      /* 角色end */
      handleTabClick (tab) {
        this.params.groupId = null
        this.params.organizationId = null
        if (this.activeTab === 'organization') {
          this.getOrganizationList()
        } else if (this.activeTab === 'group') {
          this.getGroupList()
        }
        this.getUserList()
      },
      check (val) {
        if (val === 'all') {
          this.userList = cloneDeep(this.cacheList)
          this.isTotal = true
        } else {
          this.userList = cloneDeep(this.checkedList)
          this.isTotal = false
        }
        this.$nextTick(() => {
          this.toggleRowSelection()
        })
      },
      toggleRowSelection () {
        if (this.userList && this.userList.length > 0) {
          this.userList.forEach(item => {
            this.checkedList.forEach(cheItem => {
              if (cheItem.userId === item.userId) {
                this.$refs.table.toggleRowSelection(item, true)
              }
            })
          })
        }
      },
    },
  }
</script>

<style lang="scss">
  .user-list-view {
    // > ::before {
    //   content: '';
    //   position: fixed;
    //   z-index: 10;
    //   top: 50px;
    //   width: 100%;
    //   border-top: 20px solid theme('colors.gray.lighter');
    // }

    /*角色关联样式*/
    .dialogVisible {
      .el-dialog__footer {
        width: 700px;
      }
    }
    .role-info, .group-info {
      position: relative;

      .add-wrap {
        display: none;
      }

      .el-tag {
        margin: 10px 10px 0 0;
        padding: 0 15px;
        height: 24px;
        line-height: 24px;
        color: #333333;
        font-size: 12px;
        background-color: #E2ECFF;
        border-color: #E2ECFF;
        border-radius: 50px 0 0 50px;
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.1);
        cursor: pointer;

        .select {
          color: #477DE9;
        }
      }
    }

    .my-aside, .my-aside-main {
      width: 335px !important;
    }

    .my-main {
      background: theme('colors.white');
      margin-top: 55px;
      padding: 10px 20px 20px 0;
    }
    .empty-content {
      flex: 1;
    }

    .my-aside-main {
      overflow-y: auto;
      position: fixed;
      top: 125px;
      bottom: 0;
      background: theme('colors.white');
      border-right: 2px solid theme('colors.gray.light');
      padding-right: 3px;
      padding-left: 20px;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
    }

    .my-main {
      .toast {
        display: flex;
        align-items: center;
        background: theme('colors.blue.lighter');
        height: 32px;
        border: 1px solid theme('colors.blue.default');
        border-radius: 4px;
        padding: 0 12px;
        font-size: theme('fontSize.sm');

        a {
          color: theme('colors.blue.default');
          padding: 0 2px;
        }
      }

      .my-pagination {
        display: flex;
        flex-direction: row-reverse;
      }
    }
  }

</style>
<style lang="scss">
  .user-list-view {
    .el-tree {
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
    .el-tabs__item:hover, .el-tabs__item.is-active {
      color: theme('colors.blue.default');
    }

    .el-tabs__active-bar {
      background-color: theme('colors.blue.default');
    }
  }
</style>
