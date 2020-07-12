<template>
  <div class="shortcut-menu-view">
    <el-header class="filter z-10">
      <div class="flex-1">
        <ej-search-input v-model="params.keyWords"
          placeholder="请输入检索信息"
          @search="search"/>
      </div>
      <a class="btn btn-normal"
        href="javascript:"
        @click="handleOperation(1, '', 'parent')"
        v-if="$store.state.userData.permissionCodes.includes('ucManager')">
        新建分类
      </a>
    </el-header>
    <el-main :style="{minHeight: screenHeight}" class="my-main">
      <div v-ej-loading="loading">
        <el-table ref="table"
          :data="tableList"
          class="my-table"
          style="width: 100%"
          row-key="dataTypeId"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column prop="dataTypeName" label="分类"/>
          <el-table-column prop="url" label="系统地址"/>
          <el-table-column prop="jumpMode" label="跳转方式" width="120">
            <template slot-scope="scope">
              {{scope.row.jumpMode === 'NEWWINDOW' ? '新窗口' : (scope.row.jumpMode === 'null' ? '' : '当前窗口')}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="210" v-if="$store.state.userData.permissionCodes.includes('ucManager')">
            <template slot-scope="scope">
              <el-button type="text" size="small" :disabled="scope.row.dIndex === 0 || scope.row.cIndex === 0 || isMoveUpDownDisabled" @click="handleOperation(2, scope.row, 'up')">上移</el-button>
              <el-button type="text" size="small" :disabled="scope.row.dIndex === scope.row.cLength - 1 || scope.row.cIndex === scope.row.cLength - 1 || isMoveUpDownDisabled" @click="handleOperation(2, scope.row, 'down')">下移</el-button>
              <el-button type="text" size="small" @click="handleOperation(1, scope.row, 'child')" :disabled="scope.row.level !== 0">新增</el-button>
              <el-button type="text" size="small" @click="handleOperation(3, scope.row, '')">编辑</el-button>
              <el-button type="text" size="small" @click="handleOperation(4, scope.row, '')">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-dialog class="dialogVisible"
        :title="isModify ? '编辑' + dialogTitleText + '分类' : '新建' + dialogTitleText + '分类'"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :show-close="false"
        width="734px">
        <el-form label-position="right" :model="formData" ref="formData" :rules="formRules">
          <el-form-item :label="dialogTitleText + '分类名称'" :label-width="formLabelWidth" prop="dataTypeName">
            <el-input v-model.trim="formData.dataTypeName" maxlength="20" placeholder="请输入分类名称"/>
          </el-form-item>
          <el-form-item :label="dialogTitleText + '分类地址'" :label-width="formLabelWidth" prop="url" v-if="isAddUrl">
            <el-input v-model.trim="formData.url" maxlength="100" placeholder="请输入分类地址"/>
          </el-form-item>
          <el-form-item :label="dialogTitleText + '分类跳转方式'" :label-width="formLabelWidth" prop="jumpMode">
            <el-radio-group v-model="formData.jumpMode">
              <el-radio :label="'null'">无</el-radio>
              <el-radio :label="'NEWWINDOW'">新窗口</el-radio>
              <el-radio :label="'CURRENTWINDOW'">当前窗口</el-radio>
            </el-radio-group>
          </el-form-item>
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
    Radio,
    RadioGroup,
    Table,
    TableColumn,
  } from 'element-ui'
  import {SearchInput, Loading} from '@ej/ui'
  import {cloneDeep} from 'lodash'
  import SHORTCUT_MENU_LIST from '@/graphql/shortcut-menu/shortcut_menu_list.gql'
  import SAVEORUPDATE_SHORTCUT_MENU from '@/graphql/shortcut-menu/save_or_update_shortcut_menu.gql'
  import DELETE_SHORTCUT_MENU from '@/graphql/shortcut-menu/delete_shortcut_menu.gql'
  import MOVE_SHORTCUT_MENU from '@/graphql/shortcut-menu/move_shortcut_menu.gql'

  Vue.use(Button)
  Vue.use(Col)
  Vue.use(Container)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Header)
  Vue.use(Input)
  Vue.use(Main)
  Vue.use(Radio)
  Vue.use(RadioGroup)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(SearchInput)
  Vue.use(Loading)

  export default {
    name: 'shortcut-menu-list',
    components: {},
    data () {
      let validateDataTypeName = (rule, value, callback) => {
        if (value === '' || value === null) {
          callback(new Error('请输入分类名称'))
        } else {
          if (value !== '') {
            if (this.isModify) {
              if (this.noCovertDataList.some(t => t.dataTypeName === this.formData.dataTypeName && t.dataTypeId !== this.formData.dataTypeId)) {
                callback(new Error('分类名称已存在'))
              }
            } else {
              if (this.noCovertDataList.some(t => t.dataTypeName === this.formData.dataTypeName)) {
                callback(new Error('分类名称已存在'))
              }
            }
          }
          callback()
        }
      }
      return {
        screenHeight: '800px',
        params: {
          dataTypeId: null,
          keyWords: '',
        },
        noCovertDataList: [], // 没转成children数据前
        tableList: [],
        loading: false,
        dialogVisible: false,
        btnDisabled: false,
        formLabelWidth: '130px',
        formData: {
          dataTypeName: '',
          url: '',
          level: 0,
          orderNumber: 0,
          jumpMode: 'null',
          parentId: 0,
        },
        formRules: {
          dataTypeName: [
            {
              required: true,
              validator: validateDataTypeName,
              // message: '请输入分类名称',
              trigger: 'blur',
            },
          ],
          url: [
            {
              required: true,
              message: '请输入分类地址',
              trigger: 'blur',
            },
          ],
        },
        isModify: false,
        isAddUrl: false, // 新增/编辑（分类和子分类）时是否显示“地址”
        isMoveUpDownDisabled: false,
        dialogTitleText: '', // 区别一级和二级分类，显示的文本内容
      }
    },

    computed: {},

    created () {
      this.getClientHeight()
      this.getShortcutMenuList()
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
      // 获取快捷菜单列表
      getShortcutMenuList () {
        this.loading = true
        this.client && (this.$apollo.client = this.client)
        this.$apollo.query({
          query: SHORTCUT_MENU_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: Object.assign({}, this.params),
          },
        }).then(respData => {
          this.loading = false
          this.tableList = []
          let data = respData.data.data
          if (data.length > 0) {
            this.noCovertDataList = data
            this.tableList = cloneDeep(this.covertChildrenData(data))
            // 添加索引号，方便给上/下移动判断是否禁用
            this.tableList.map((fitem, findex) => {
              fitem.dIndex = findex
              fitem.cLength = this.tableList.length
              if (fitem.children) {
                fitem.children.map((zitem, zindex) => {
                  zitem.cIndex = zindex
                  zitem.cLength = fitem.children.length
                })
              }
            })
          }
        }).catch(err => {
          this.loading = false
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      // 编辑时：获取某条租户
      getInfoById (id) {
        this.$apollo.query({
          query: SHORTCUT_MENU_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: {
              dataTypeId: id,
              keyWords: '',
            },
          },
        }).then(respData => {
          let sDataResult = respData.data.data
          if (sDataResult.length > 0) {
            let data = sDataResult[0]
            this.formData = {
              dataTypeId: data.dataTypeId,
              dataTypeName: data.dataTypeName,
              url: data.url,
              jumpMode: data.jumpMode,
              level: data.level,
              orderNumber: data.orderNumber,
              parentId: data.parentId,
            }
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      // 将数据转换成带children的（通过parentId）
      covertChildrenData (rows) {
        function exists (rows, parentId) {
          for (var i = 0; i < rows.length; i++) {
            if (rows[i].dataTypeId === parentId) return true
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
            if (rowC.parentId === node.dataTypeId) {
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
      search (val) {
        // this.clearParams()
        this.params.keyWords = val
        this.getShortcutMenuList()
      },
      clearParams () {
        this.params = {
          dataTypeId: '',
          keyWords: '',
        }
      },
      handleCancel (formName) {
        this.dialogVisible = false
        this.isModify = false
        this.$refs[formName].resetFields()
      },
      handleSubmit (formName) {
        this.btnDisabled = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.formData.jumpMode = this.formData.jumpMode !== 'null' ? this.formData.jumpMode : null
            this.$apollo.mutate({
              mutation: SAVEORUPDATE_SHORTCUT_MENU,
              variables: {
                input: Object.assign({}, this.formData),
              },
            }).then((data) => {
              this.btnDisabled = false
              this.getShortcutMenuList()
              this.dialogVisible = false
            }).catch((err) => {
              this.btnDisabled = false
              ElMessage.error({message: err.message || '请求失败请重试'})
            })
            this.$refs[formName].resetFields()
          } else {
            this.btnDisabled = false
          }
        })
      },
      handleMove (curParams) {
        this.$apollo.mutate({
          mutation: MOVE_SHORTCUT_MENU,
          variables: {
            input: Object.assign({}, curParams),
          },
        }).then((data) => {
          this.isMoveUpDownDisabled = false
          this.getShortcutMenuList()
        }).catch((err) => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      handleOperation (oper, data, kind) {
        let newTableList = cloneDeep(this.tableList)
        switch (oper) {
          case 1:
            // 新建分类: data==='parent' 新建子类data==='child'
            if (this.formData.dataTypeId) {
              delete this.formData.dataTypeId
            }
            if (kind === 'parent') {
              this.dialogTitleText = '一级'
              this.formData.parentId = '0'
              this.formData.level = 0
              this.formData.orderNumber = newTableList.length + 1
              this.isAddUrl = false
            } else {
              this.dialogTitleText = '二级'
              if (data.children) {
                this.formData.orderNumber = data.children.length + 1
              } else {
                this.formData.orderNumber = 1
              }
              this.formData.parentId = data.dataTypeId
              this.formData.level = 1
              this.isAddUrl = true
            }
            this.isModify = false
            this.dialogVisible = true
            break
          case 2:
            // 上移:up  下移:down
            this.isMoveUpDownDisabled = true
            let targetTopId = 0
            if (kind === 'up') {
              if (data.level === 0) {
                targetTopId = newTableList[data.dIndex - 1].dataTypeId
              } else {
                targetTopId = newTableList.find(i => { return i.dataTypeId === data.parentId }).children[data.cIndex - 1].dataTypeId
              }
            } else {
              if (data.level === 0) {
                targetTopId = newTableList[data.dIndex + 1].dataTypeId
              } else {
                targetTopId = newTableList.find(i => { return i.dataTypeId === data.parentId }).children[data.cIndex + 1].dataTypeId
              }
            }
            let moveParams = {
              sourceDataTypeId: data.dataTypeId, // 本次操作的dataTypeId
              targetDataTypeId: targetTopId, // 目标移动的dataTypeId
              moveOperation: kind === 'up', // true:上移 false:下移
            }
            this.handleMove(moveParams)
            break
          case 3:
            // 编辑
            this.isModify = true
            if (data.parentId === '0') {
              this.dialogTitleText = '一级'
            } else {
              this.dialogTitleText = '二级'
            }
            this.isAddUrl = data.level === 1
            this.dialogVisible = true
            this.getInfoById(data.dataTypeId)
            break
          case 4:
            // 删除
            let delIds = []; let childrenLenth = data.children ? data.children.length : ''
            delIds.push(data.dataTypeId)
            if (data.children) {
              data.children.forEach(item => {
                delIds.push(item.dataTypeId)
              })
            }
            ElMessageBox.confirm(childrenLenth ? '该项下有' + childrenLenth + '个子项,是否删除所有项？' : '是否删除该项？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true,
            }).then(() => {
              this.$apollo.mutate({
                mutation: DELETE_SHORTCUT_MENU,
                variables: {
                  input: delIds,
                },
              }).then((data) => {
                this.getShortcutMenuList()
              }).catch((err) => {
                ElMessage.error({message: err.message || '请求失败请重试'})
              })
            }).catch(() => {
              ElMessage.info('已取消删除')
            })
            break
          default:
            console.log('')
        }
      },
    },
  }
</script>

<style lang="scss">
  .shortcut-menu-view {
    .my-main {
      @apply bg-white;
      margin-top: 55px;
      padding: 20px;
    }
    .dialogVisible {
      .el-dialog__body {
        padding: 20px 147px;
        .el-form-item__label {
          line-height: 40px;
        }
      }
      .el-dialog__footer {
        width: 330px;
      }
    }
  }
</style>
