<template>
  <div class="organization-list-view">
    <el-header class="filter z-10">
      <div class="flex-1">
        <ej-search-input v-model="params.keyWords"
          placeholder="请输入检索信息"
          @search="search"/>
      </div>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(1, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">新建</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(2, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">删除</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(3, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">导出</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(4, '')" v-if="!$store.state.useBtnFlag">数据同步</a>
      <a class="btn btn-normal" href="javascript:" @click="handleOperation(5, '')" v-if="$store.state.userData.permissionCodes.includes('ucManager')">下载模板</a>
    </el-header>
    <el-main :style="{minHeight: screenHeight}" class="my-main">
      <div v-ej-loading="loading">
        <el-table ref="tabelTree"
          :data="tableList"
          class="my-table"
          style="width: 100%"
          row-key="organizationId"
          sortable="custom"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          @sort-change="handleSortChange"
          @select-all="handleSelectionAllChange"
        >
          <!-- :default-sort = "{prop: 'organizationCode', order: 'ascending'}" && $store.state.userData.tenantLevel === 3 -->
          <el-table-column type="selection" width="60" v-if="$store.state.userData.permissionCodes.includes('ucManager')"/>
          <el-table-column prop="organizationCode" label="机构编码" sortable/>
          <el-table-column prop="organizationName" label="机构名称"/>
          <el-table-column prop="organizationAddress" label="机构地址"/>
          <el-table-column prop="managerName" label="负责人"/>
          <el-table-column prop="managerPhone" label="负责人电话"/>
          <el-table-column prop="managerMail" label="邮箱地址"/>
          <el-table-column label="操作" width="60" v-if="$store.state.userData.permissionCodes.includes('ucManager')">
            <template slot-scope="scope">
              <el-button type="text" size="small" :disabled="editBtnDisabled" @click="handleOperation(6, scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-dialog class="dialogVisible"
        :title="isModify ? '编辑机构' : '新建机构'"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :show-close="false"
        width="934px">
        <el-form label-position="top" :model="formData" :rules="formRules" ref="formData">
          <el-row>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="机构上一级" :label-width="formLabelWidth" prop="parentId">
                <select-tree v-model="formData.parentId"
                  placeholder="请选择机构名称"
                  :props="sTProps"
                  :options="sTData"
                  :clearable="isClearable"
                  @getValue="getValue"/>
              </el-form-item>
            </el-col>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="机构编码" :label-width="formLabelWidth" prop="organizationCode">
                <el-input v-model.trim="formData.organizationCode" maxlength="20" placeholder="请输入机构名称"/>
                <!-- <el-input-number v-model="formData.sort" :min="1" placeholder="请输入排序"></el-input-number> -->
              </el-form-item>
            </el-col>
            <el-col :span="7" class="pinline">
              <el-form-item label="机构名称" :label-width="formLabelWidth" prop="organizationName">
                <el-input v-model.trim="formData.organizationName" maxlength="20" placeholder="请输入机构名称"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="机构地址" :label-width="formLabelWidth" prop="organizationAddress">
                <el-input v-model.trim="formData.organizationAddress" maxlength="150" placeholder="请输入机构地址"/>
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
            <el-col :span="14" class="pinline">
              <el-form-item label="邮箱地址" prop="managerMail">
                <el-input v-model="formData.managerMail" disabled/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleCancel('formData')">取消</el-button>
          <el-button type="primary" :disabled="btnDisabled" @click="handleSubmit('formData')">提交</el-button>
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
    // Cascader,
    Col,
    Container,
    Dialog,
    Form,
    FormItem,
    Header,
    Input,
    InputNumber,
    Main,
    Message as ElMessage,
    MessageBox as ElMessageBox,
    Option,
    Select,
    Table,
    TableColumn,
    Tree,
  } from 'element-ui'
  import {
    SearchInput,
    Loading,
    SelectTree,
  } from '@ej/ui'
  import {cloneDeep} from 'lodash'
  import EjSelectUser from '@/components/select-user.vue'
  import ORGANIZATION_LIST from '@/graphql/organization/organization_list_nopagination.gql'
  import SAVEORUPDATE_ORGANIZATION from '@/graphql/organization/save_or_update_organization.gql'
  import DELETE_ORGANIZATION from '@/graphql/organization/delete_organization.gql'
  import DATA_SYNCH from '@/graphql/organization/data_synch.gql'
  import ORGANIZATION_LIST_TREE from '@/graphql/user/organization_list.gql'

  Vue.use(Container)
  // Vue.use(Cascader)
  Vue.use(Header)
  Vue.use(Main)
  Vue.use(SearchInput)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Loading)
  Vue.use(Dialog)
  Vue.use(Button)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Row)
  Vue.use(Col)
  Vue.use(Select)
  Vue.use(Option)
  Vue.use(InputNumber)
  Vue.use(Tree)

  export default {
    name: 'organization-list',
    components: {
      EjSelectUser,
      SelectTree,
    },
    data () {
      let validateOrganizationCode = (rule, value, callback) => {
        if (value === '' || value === null) {
          callback(new Error('请输入机构编码'))
        } else {
          if (value !== '') {
            if (this.isModify) {
              if (this.originData.some(t => t.organizationCode === this.formData.organizationCode && t.organizationId !== this.formData.organizationId)) {
                callback(new Error('机构编码已存在'))
              }
            } else {
              if (this.originData.some(t => t.organizationCode === this.formData.organizationCode)) {
                callback(new Error('机构编码已存在'))
              }
            }
          }
          callback()
        }
      }
      let validateOrganizationName = (rule, value, callback) => {
        if (value === '' || value === null) {
          callback(new Error('请输入机构名称'))
        } else {
          if (value !== '') {
            if (this.isModify) {
              if (this.originData.some(t => t.organizationName === this.formData.organizationName && t.organizationId !== this.formData.organizationId)) {
                callback(new Error('机构名称已存在'))
              }
            } else {
              if (this.originData.some(t => t.organizationName === this.formData.organizationName)) {
                callback(new Error('机构名称已存在'))
              }
            }
          }
          callback()
        }
      }
      return {
        editBtnDisabled: false,
        delLength: 0,
        delIds: [],
        // ucManager: this.$store.state.userData.permissionCodes.includes('ucManager'),
        screenHeight: '800px',
        params: {
          organizationId: '',
          keyWords: '',
          order: true,
        },
        btnDisabled: false,
        tableList: [],
        originData: [],
        loading: false,
        dialogVisible: false,
        formLabelWidth: '120px',
        oldPId: null,
        formData: {
          parentId: '0',
          organizationName: '',
          organizationCode: '',
          // sort: 1,
          organizationAddress: '',
          managerZName: '',
          managerName: '',
          managerPhone: '',
          managerMail: '',
          level: 0,
        },
        formRules: {
          parentId: [
            {
              required: true,
              message: '请选择机构上一级',
              trigger: 'change',
            },
          ],
          organizationCode: [
            {
              required: true,
              validator: validateOrganizationCode,
              // message: '请输入机构编码',
              trigger: 'blur',
            },
          ],
          organizationName: [
            {
              required: true,
              validator: validateOrganizationName,
              // message: '请输入机构名称',
              trigger: 'blur',
            },
          ],
          organizationAddress: [
            {
              required: true,
              message: '请输入机构地址',
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
        },
        isModify: false,
        // 下拉框树
        sTProps: {
          value: 'id',
          label: 'organizationName',
          children: 'children',
        },
        sTData: [],
        oldSTData: [], // 原始列表数据，选中时需要知道该节点的level
        isClearable: false, // 可清空（可选）
        rowItems: [],
        selectFlag: true,
      }
    },

    computed: {},

    created () {
      this.getClientHeight()
      this.getOrganizationList()
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
      // 获取机构列表
      getOrganizationList () {
        this.loading = true
        this.$apollo.query({
          query: ORGANIZATION_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: Object.assign({}, this.params),
          },
        }).then(respData => {
          this.loading = false
          this.tableList = []
          let data = respData.data.data
          this.originData = data
          this.tableList = this.covertChildrenData(data)
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      // 编辑时：获取某条机构
      getInfoById (id, level) {
        this.$apollo.query({
          query: ORGANIZATION_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              organizationId: id,
              keyWords: '',
              order: true,
            },
          },
        }).then(respData => {
          let oDataResult = respData.data.data
          if (oDataResult.length > 0) {
            let data = oDataResult[0]
            this.formData = {
              organizationId: data.organizationId,
              parentId: data.parentId,
              organizationName: data.organizationName,
              organizationCode: data.organizationCode,
              organizationAddress: data.organizationAddress,
              managerZName: data.managerName,
              managerName: data.username,
              managerPhone: data.managerPhone,
              managerMail: data.managerMail,
              level: level,
            }
            this.oldPId = data.parentId
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      // 新增和编辑时：获取父级的机构
      async getParentOrganization () {
        let data = await this.$apollo.query({
          query: ORGANIZATION_LIST_TREE,
          fetchPolicy: 'no-cache',
        })
        if (data) {
          let getPData = data.data.data
          let newPData = []
          let curData = []
          if (this.isModify) {
            // 编辑时，机构父级中的数据，不包含自己
            getPData.forEach(item => {
              if (item.id !== this.formData.id) {
                newPData.push(item)
              }
            })
            curData = cloneDeep(newPData)
          } else {
            curData = cloneDeep(getPData)
          }
          // console.log(666, curData)
          this.sTData = this.covertChildrenDataId(curData)
          this.sTData.unshift({
            id: '0',
            parentId: '0',
            organizationName: '无',
          })
          this.oldSTData = cloneDeep(this.sTData)
          this.editBtnDisabled = false
          this.dialogVisible = true
        }
      },
      // 将数据转换成带children的（通过parentId）
      covertChildrenData (rows,) {
        function exists (rows, parentId) {
          for (var i = 0; i < rows.length; i++) {
            if (rows[i].organizationId === parentId) return true
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
            if (rowC.parentId === node.organizationId) {
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
      covertChildrenDataId (rows,) {
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
      handleNodeClick (node) {
        this.selValue = node[this.parentProps.label]
        this.formData.level = node.level !== undefined ? (node.level + 1) : 0
        this.formData.parentId = node[this.parentProps.value]
        this.defaultExpandedKey = []
        this.$refs.ejSelect.handleClose()
        // console.log(this.formData.level)
        if (this.formData.level >= 4) {
          ElMessage.warning('机构层级不可超过四层')
          this.btnDisabled = true
        } else {
          this.btnDisabled = false
        }
      },
      /* 负责人搜索弹出 start */
      handleSelectUser (item) {
        this.formData.managerZName = item.name
        this.formData.managerName = item.username
        this.formData.managerPhone = item.phoneNumber
        this.formData.managerMail = item.email
      },
      /* 负责人搜索弹出 end */
      search (val) {
        this.params.keyWords = val
        this.getOrganizationList()
      },
      clearParams () {
        this.params = {
          organizationId: '',
          keyWords: '',
          order: true,
        }
      },
      clearFormData () {
        this.selValue = ''
        this.formData = {
          parentId: '0',
          organizationName: '',
          organizationCode: '',
          // sort: 1,
          organizationAddress: '',
          managerZName: '',
          managerName: '',
          managerPhone: '',
          managerMail: '',
        }
        this.btnDisabled = false
      },
      // 获取删除的数量、ID
      getDelIdsOrLength (list) {
        list.forEach(item => {
          this.delLength += 1
          this.delIds.push(item.organizationId)
          if (item.children && item.children.length) {
            this.getDelIdsOrLength(item.children)
          }
        })
      },
      handleOperation (oper, data) {
        switch (oper) {
          case 1:
            // 新建操作
            this.clearFormData()
            if (this.formData.organizationId) {
              delete this.formData.organizationId
            }
            this.getParentOrganization()
            this.isModify = false
            // this.dialogVisible = true
            break
          case 2:
            // 删除操作
            this.delLength = 0
            this.delIds = []
            if (!this.$refs.tabelTree.selection.length) {
              ElMessage.warning('请选择要删除的机构项！')
              return
            } else {
              this.getDelIdsOrLength(this.$refs.tabelTree.selection)
            }
            ElMessageBox.confirm(this.delLength > 1 ? '是否删除所选' + this.delLength + '项(含子机构)？' : '是否删除所选项？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true,
            }).then(() => {
              this.$apollo.mutate({
                mutation: DELETE_ORGANIZATION,
                variables: {
                  input: this.delIds,
                },
              }).then((data) => {
                this.getOrganizationList()
              }).catch((err) => {
                let code = err.graphQLErrors[0].extensions.code
                if (code === '505') {
                  ElMessage.error(err.graphQLErrors[0].message)
                } else {
                  ElMessage.error({message: err.message || '请求失败请重试'})
                }
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
            this.$apollo.mutate({
              mutation: DATA_SYNCH,
              fetchPolicy: 'no-cache',
              variables: {
                password: 'dfjx', // this.$store.state.userData.password,
              },
            }).then((data) => {
              if (data.data.data) {
                this.getOrganizationList()
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
          default:
            this.editBtnDisabled = true
            this.btnDisabled = false
            this.getParentOrganization()
            this.getInfoById(data.organizationId, data.level)
            this.isModify = true
            // this.dialogVisible = true
        }
      },
      handleCancel (formName) {
        this.dialogVisible = false
        this.isModify = false
        this.clearFormData()
        this.$refs[formName].resetFields()
      },
      // 更改项的信息获取
      getPInfoById (pid) {
        this.$apollo.query({
          query: ORGANIZATION_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              organizationId: pid,
              keyWords: '',
              order: true,
            },
          },
        }).then(respData => {
          let oDataResult = respData.data.data
          if (oDataResult.length > 0) {
            let data = oDataResult[0]
            // 父级id为0时，不修改
            if (data.parentId === '0') return
            data.parentId = this.oldPId
            if (data.username) {
              delete data.username
            }
            if (data.__typename) {
              delete data.__typename
            }
            this.updateOragan(data)
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      // 更改项的信息修改
      async updateOragan (data) {
        let udata = await this.$apollo.mutate({
          mutation: SAVEORUPDATE_ORGANIZATION,
          variables: {
            input: data,
          },
        })
        return udata.data.data
      },
      handleSubmit (formName) {
        this.btnDisabled = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // if (this.isModify) {
            //   if (this.originData.some(t => t.organizationCode === this.formData.organizationCode && t.organizationId !== this.formData.organizationId)) {
            //     ElMessage.warning('机构编码已存在!')
            //     this.btnDisabled = false
            //     return
            //   }
            //   if (this.originData.some(t => t.organizationName === this.formData.organizationName && t.organizationId !== this.formData.organizationId)) {
            //     ElMessage.warning('机构名称已存在!')
            //     this.btnDisabled = false
            //     return
            //   }
            // } else {
            //   if (this.originData.some(t => t.organizationCode === this.formData.organizationCode)) {
            //     ElMessage.warning('机构编码已存在!')
            //     this.btnDisabled = false
            //     return
            //   }
            //   if (this.originData.some(t => t.organizationName === this.formData.organizationName)) {
            //     ElMessage.warning('机构名称已存在!')
            //     this.btnDisabled = false
            //     return
            //   }
            // }
            // 当前父id不为0时，则把修改项的内容（父id和当前修改项更换）
            if (this.formData.parentId !== '0') {
              this.getPInfoById(this.formData.parentId)
            }
            if (this.formData.managerZName) {
              delete this.formData.managerZName
            }
            // this.formData.level = this.formData.parentId === '0' ? 0 : 1
            // console.log(111, this.formData)
            // return
            this.$apollo.mutate({
              mutation: SAVEORUPDATE_ORGANIZATION,
              variables: {
                input: this.formData,
              },
            }).then((data) => {
              this.btnDisabled = false
              this.getOrganizationList()
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
      handleSelectionAllChange (val) {
        this.rowItems = []
        this.allSelect(val)
        this.rowItems.forEach(row => {
          this.$refs.tabelTree.toggleRowSelection(row, this.selectFlag)
        })
        this.selectFlag = !this.selectFlag// 切换
      },
      allSelect (data) {
        for (let i = 0; i < data.length; i++) {
          this.rowItems.push(data[i])
          if (data[i].children !== undefined) {
            if (data[i].children.length > 0) {
              let childrenList = []
              childrenList = data[i].children
              this.allSelect(childrenList)
            }
          }
        }
      },
      handleSortChange (column) {
        this.params.order = column.order === 'ascending'
        this.getOrganizationList()
      },
      // 获取选中父级机构的节点
      GetLevelFromData (treeData, value) {
        let node = {}

        function each (data) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].id === value) {
              node = data[i]
              break
            } else if (data[i].children && data[i].children.length > 0) {
              return each(data[i].children)
            }
          }
        }

        each(treeData)
        return node
      },
      // 下拉框树 取值
      getValue (value) {
        this.formData.parentId = value
        let curNodeLevel = this.GetLevelFromData(this.oldSTData, value)
        this.formData.level = curNodeLevel.level !== undefined ? (curNodeLevel.level + 1) : 0
        // console.log(this.formData.level)
        if (this.formData.level >= 4) {
          ElMessage.warning('机构层级不可超过四层，请重新选择！')
          this.btnDisabled = true
        } else {
          this.btnDisabled = false
        }
      },
    },
  }
</script>

<style lang="scss">
  .organization-list-view {
    .mr30 {
      margin-right: 30px;
    }
    .my-main {
      @apply bg-white;
      margin-top: 55px;
      padding: 20px;
    }
  }
  .select-tree {
    .el-input__suffix, .el-input__suffix-inner {
      outline: none;
    }
    .is-focus {
      .el-icon-circle-close {
        line-height: 29px;
        margin-top: 5px;
      }
    }
  }
  .el-select-dropdown__item.selected{
    font-weight: normal;
  }
  ul li >>>.el-tree .el-tree-node__content{
    height:auto;
    padding: 0 20px;
  }
  .el-tree-node__label{
    font-weight: normal;
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
  .el-scrollbar .el-scrollbar__view .selectTree{
    height: auto;
    max-height: 274px;
    padding: 0;
    overflow: hidden;
    overflow-y: auto;
  }
</style>
