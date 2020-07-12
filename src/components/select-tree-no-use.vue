<template>
  <el-select ref="ejSelect" :value="selValue" :placeholder="placeholder" :clearable="clearable" @clear="clearHandle" class="select-tree">
    <el-option :value="valueId" :label="selValue" class="selectTree">
      <el-tree id="tree-option"
        ref="ejSelectOptionTree"
        :data="treeData"
        :props="organProps"
        node-key="id"
        :default-expanded-keys="defaultExpandedKey"
        :expand-on-click-node="false"
        @node-click="handleNodeClick">
      </el-tree>
    </el-option>
  </el-select>
</template>
<script>
  import {Tree as ElTree} from 'element-ui'
  import ORGANIZATION_LIST from '@/graphql/user/organization_list.gql'
  export default {
    name: 'EjSelectTree',
    components: {
      ElTree,
    },
    props: {
      /* 初始值 */
      value: {
        type: Array,
        default: () => [],
      },
      placeholder: {
        type: String,
        default: '请选择',
      },
      /* 可清空选项 */
      clearable: {
        type: Boolean,
        default: () => { return true },
      },
    },
    data () {
      return {
        treeData: [],
        organProps: {
          value: 'id',
          label: 'organizationName',
          children: 'children',
        },
        valueId: '',
        selValue: '',
        defaultExpandedKey: [],
      }
    },
    created () {
      this.getOrganizationList()
    },
    mounted () {
      this.initHandle()
    },
    methods: {
      async getOrganizationList () {
        let data = await this.$apollo.query({
          query: ORGANIZATION_LIST,
          fetchPolicy: 'no-cache',
        })
        if (data) {
          let curData = data.data.data
          this.treeData = this.covertChildrenData(curData)
        }
      },
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
      // 初始化值
      initHandle () {
        if (this.valueId) {
          this.selValue = this.$refs.ejSelectOptionTree.getNode(this.valueId).data[this.organProps.label] // 初始化显示
          this.$refs.ejSelectOptionTree.setCurrentKey(this.valueId) // 设置默认选中
          this.defaultExpandedKey = [this.valueId] // 设置默认展开
        }
        this.$nextTick(() => {
          let scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0]
          let scrollBar = document.querySelectorAll('.el-scrollbar .el-scrollbar__bar')
          scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
          scrollBar.forEach(ele => {
            ele.style.width = 0
          })
        })
      },
      // 清除选中
      clearHandle () {
        this.selValue = ''
        this.valueId = null
        this.defaultExpandedKey = []
        this.clearSelected()
        this.$emit('getValue', [])
      },
      /* 清空选中样式 */
      clearSelected () {
        let allNode = document.querySelectorAll('#tree-option .el-tree-node')
        allNode.forEach((element) => element.classList.remove('is-current'))
      },
      // 切换选项
      handleNodeClick (node) {
        this.selValue = node[this.organProps.label]
        this.valueId = node[this.organProps.value]
        this.$emit('getValue', [this.valueId])
        this.defaultExpandedKey = []
        this.$refs.ejSelect.handleClose()
      },
    },
    watch: {
      value () {
        this.valueId = this.value.length > 0 ? this.value[0] : ''
        this.initHandle()
      },
    },
  }
</script>
<style lang="scss">
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
  // .el-tree >>>.is-current .el-tree-node__label{
  //   color: #409EFF;
  //   font-weight: 700;
  // }
  // .el-tree >>>.is-current .el-tree-node__children .el-tree-node__label{
  //   color:#606266;
  //   font-weight: normal;
  // }
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
</style>
<style scoped>
  .el-scrollbar .el-scrollbar__view .selectTree{
    height: auto;
    max-height: 274px;
    padding: 0;
    overflow: hidden;
    overflow-y: auto;
  }
</style>
