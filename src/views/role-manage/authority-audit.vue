<template>
  <div class="authority-audit-view">
    <el-container>
      <div class="functionCon" :style="{minHeight: screenHeight}">
        <el-tabs v-model="activeTabA" @tab-click="handleTabs">
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
          </div>
          <div class="functionList" v-ej-loading="loading">
            <el-tree
              :data="funtionList"
              show-checkbox
              default-expand-all
              node-key="permissionId"
              ref="functionTree"
              highlight-current
              :props="defaultProps"
              :expand-on-click-node="false"
              :default-checked-keys="permissionChecks">
            </el-tree>
          </div>
        </div>
      </div>
      <el-aside class="my-aside">
        <div class="my-aside-main">
          <ej-search-input v-model="filterText" placeholder="请输入检索信息"/>
          <!-- <menu-tree :data="treeData"
                 ref="userRoleTree"
                 class="filter-tree mt-6"
                 :filter-node-method="filterNode"
                 :render-content="renderContent"
                 :props="userRoleProps"
                 node-key="id"
                 :expand-on-click-node="false"
                 @node-click="handleUserRole"/> -->
          <el-tree
            ref="userRoleTree"
            :data="treeData"
            :props="userRoleProps"
            @node-click="handleUserRole"
            node-key="id"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"></el-tree>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Aside,
    Container,
    Message as ElMessage,
    Tabs,
    TabPane,
    Tree,
  } from 'element-ui'
  import {SearchInput, Loading} from '@ej/ui'
  // import MenuTree from '@/components/menu-tree/index'
  import ROLE_LIST from '@/graphql/role/role_list.gql'
  import PERMISSION_LIST from '@/graphql/role/permission_list.gql'
  import SYSTEM_LIST from '@/graphql/role/system_list.gql'

  Vue.use(Aside)
  Vue.use(Container)
  // Vue.use(MenuTree)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Tree)
  Vue.use(SearchInput)
  Vue.use(Loading)

  export default {
    name: 'authority-audit',
    components: {},
    data () {
      return {
        loading: false,
        screenHeight: '800px',
        filterText: '',
        treeData: [],
        userRoleProps: {
          children: 'children',
          label: 'roleName',
        },
        selRoleId: '',
        activeTabA: '',
        systemList: [],
        defaultProps: {
          children: 'children',
          label: 'permissionName',
        },
        funtionList: [],
        permissionChecks: [],
      }
    },

    created () {
      this.getClientHeight()
      let systemData = this.getSystemList()
      systemData.then(res => {
        this.getUserRoleTree()
      })
    },

    watch: {
      filterText (val) {
        this.$refs.userRoleTree.filter(val)
      },
    },

    methods: {
      getClientHeight () {
        /*
        * 头：50
        * 间距：20 去掉
        */
        let height = 70
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight
        this.screenHeight = clientHeight - height + 'px'
      },
      async getUserRoleTree () {
        let data = await this.$apollo.query({
          query: ROLE_LIST,
          fetchPolicy: 'no-cache',
        })
        if (data) {
          let curData = data.data.data
          this.treeData = this.covertChildrenData(curData)
          if (this.treeData.length > 0) {
            this.$nextTick(function () {
              this.$refs.userRoleTree.setCurrentKey(this.treeData[0].id)
            })
            this.handleUserRole(this.treeData[0])
          }
        }
      },
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
          this.activeTabA = curData[0].appName
          this.getPermissionList()
        }
      },
      getPermissionList () {
        this.loading = true
        this.$apollo.query({
          query: PERMISSION_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: {
              roleId: this.selRoleId,
              appName: this.activeTabA,
            },
          },
        }).then(respData => {
          this.loading = false
          let data = respData.data.data
          this.funtionList = []
          this.permissionChecks = []
          if (data.length > 0) {
            this.funtionList = this.covertPermissionChildrenData(data)
          }
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
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
        let pNodes = []
        // get the top level nodes
        for (var j = 0; j < rows.length; j++) {
          let row = rows[j]
          if (!exists(rows, row.parentId)) {
            pNodes.push(row)
          }
        }
        let pParentNode = []
        for (var i = 0; i < pNodes.length; i++) {
          pParentNode.push(pNodes[i])
        }
        while (pParentNode.length) {
          let node = pParentNode.shift()
          for (var x = 0; x < rows.length; x++) {
            let rowC = rows[x]
            rowC.disabled = true
            if (rowC.flag) {
              this.permissionChecks.push(rowC.permissionId)
            }
            if (rowC.parentId === node.permissionId) {
              if (node.children) {
                node.children.push(rowC)
              } else {
                node.children = [rowC]
              }
              pParentNode.push(rowC)
            }
          }
        }
        return pNodes
      },
      filterNode (value, data) {
        if (!value) return true
        return data.roleName.indexOf(value) !== -1 || data.roleCode.indexOf(value) !== -1
      },
      handleUserRole (data) {
        this.selRoleId = data.id
        this.getPermissionList()
      },
      handleTabs (tab, event) {
        this.getPermissionList()
      },
      // renderContent (h, {node, data, store}) {
      //   return (
      //     <span class="ml-4">{node.data.roleName}</span>
      //   )
      // },
    },
  }
</script>

<style lang="scss">
  .authority-audit-view {
    min-height: 698px;
    height: 100%;
    // > ::before {
    //   content: '';
    //   position: fixed;
    //   z-index: 10;
    //   top: 50px;
    //   width: 100%;
    //   border-top: 20px solid theme('colors.gray.lighter');
    // }
    .el-tree {
      margin-top: 15px;
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
    .my-aside, .my-aside-main {
      width: 335px !important;
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
    .my-aside-main {
      position: fixed;
      top: 70px;
      bottom: 0;
    }
    .functionCon {
      @apply bg-white;
      min-height: 498px;
      position: relative;
      display: block;
      -webkit-box-flex: 1;
      flex: 1;
      flex-basis: auto;
      overflow: auto;
      box-sizing: border-box;
    }
    .functionInfo {
      margin: 0 30px 20px 30px;
      position: relative;
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
    .my-aside-main {
      overflow-y: auto;
      @apply bg-white;
      border-left: 2px solid theme('colors.gray.light');
      padding: 15px 20px 20px 20px;
    }
  }

</style>
