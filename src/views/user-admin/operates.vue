<template>
  <div class="operates-user-view">
    <el-container>
      <div class="user-slider">
        <ul class="slider-ul">
          <li v-for="(item, index) in sliderList" :key="index" :class="item.active ? 'active' : ''" @click="handleSlider(item)">
            <a :href="'#' + item.value">{{item.text}}</a>
          </li>
        </ul>
      </div>
      <div class="user-content">
        <div class="basic-info" id="basic-info">
          <h2>基本信息</h2>
          <el-form ref="formData" label-position="top" :model="formData" :rules="formRules">
            <el-row :gutter="30">
              <el-col :span="8">
                <el-form-item label="登录账户" :label-width="formLabelWidth" prop="username">
                  <el-input v-model.trim="formData.username" @blur.native="checkUserName" maxlength="20" placeholder="请输入登录账户" ref="userNameRef"/>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="默认密码" :label-width="formLabelWidth" prop="password" class="info-item">
                  <el-input v-model.trim="formData.password" maxlength="20" show-password placeholder="请输入默认密码"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="30">
              <el-col :span="8">
                <el-form-item label="用户状态" :label-width="formLabelWidth" prop="enabled">
                  <el-radio-group v-model="formData.enabled">
                    <el-radio :label="true">正常</el-radio>
                    <el-radio :label="false">禁用</el-radio>
                </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="用户姓名" :label-width="formLabelWidth" prop="name">
                  <el-input v-model.trim="formData.name" maxlength="20" placeholder="请输入用户姓名"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label-width="formLabelWidth" prop="userAvatar">
                  <el-upload
                      class="avatar-uploader"
                      v-ej-loading="is_avatar_uploading"
                      :action="actionUrl"
                      :data="{
                        serviceId: 'auth',
                        ttl: '-1',
                      }"
                      name="file"
                      :show-file-list="false"
                      :on-success="handleAvatarSuccess"
                      :before-upload="handleAvatarUpload">
                    <img v-if="formData.userAvatar" :src="formData.userAvatar" class="avatar">
                    <img v-else src="@/assets/imgs/icon-account.svg" class="avatar">
                    <!-- <i v-else class="el-icon-plus avatar-uploader-icon"></i> -->
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="30">
              <el-col :span="8">
                <el-form-item label="用户性别" :label-width="formLabelWidth" prop="userSex">
                  <el-radio-group v-model="formData.userSex">
                    <el-radio :label="1">女</el-radio>
                    <el-radio :label="0">男</el-radio>
                </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="出生日期" :label-width="formLabelWidth" prop="userBirthday">
                  <el-date-picker type="date" placeholder="选择日期" format="yyyy-MM-dd" v-model="formData.userBirthday" style="width: 100%;"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="机构名称" :label-width="formLabelWidth" prop="organizationIds">
                  <select-tree v-model="formData.organizationIds"
                    placeholder="请选择机构名称"
                    :props="sTProps"
                    :options="sTData"
                    @getValue="getValue"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="30">
              <el-col :span="8">
                <el-form-item label="工号" :label-width="formLabelWidth" prop="jobNumber">
                  <el-input v-model.trim="formData.jobNumber" maxlength="20" placeholder="请输入工号"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="职位" :label-width="formLabelWidth" prop="position">
                  <el-input v-model="formData.position" maxlength="20"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="职称" :label-width="formLabelWidth" prop="title">
                  <el-input v-model="formData.title" maxlength="20"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="30">
              <el-col :span="8">
                <el-form-item label="是否外协" :label-width="formLabelWidth" prop="isWaixie">
                  <el-radio-group v-model="formData.isWaixie">
                    <el-radio :label="0">否</el-radio>
                    <el-radio :label="1">是</el-radio>
                </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="归属单位" :label-width="formLabelWidth" prop="outsourcingCompany" v-show="formData.isWaixie === 1">
                  <el-input v-model="formData.outsourcingCompany" maxlength="20"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="归属单位联系电话" :label-width="formLabelWidth" prop="outsourcingPhone" v-show="formData.isWaixie === 1">
                  <el-input v-model="formData.outsourcingPhone" maxlength="20"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="30">
              <el-col :span="24">
                <el-form-item label="地址" :label-width="formLabelWidth" prop="userAddress">
                  <el-input type="textarea" v-model.trim="formData.userAddress" maxlength="150" show-word-limit resize="none"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div>
            <el-table ref="table" :data="contactList" class="my-table w-full">
              <el-table-column prop="contact" label="联系方式">
                <template slot-scope="scope">
                  {{scope.row.contact === 'FIXEDTELEPHONE' ? '固定电话' : (scope.row.contact === 'MOBILEPHONE' ? '移动电话' : (scope.row.contact === 'FAXNUMBER' ? '传真号码' : '邮箱'))}}
                </template>
              </el-table-column>
              <el-table-column prop="information" label="联系信息"/>
              <el-table-column prop="isPrimary" label="主联系方式">
                <template slot-scope="scope">
                  <div v-if="!scope.row.isPrimary">否</div>
                  <div v-else>是</div>
                </template>
              </el-table-column>
              <el-table-column prop="infoDesc" label="描述"/>
              <el-table-column label="操作" width="110">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="handleOper(1, scope.row)">编辑</el-button>
                  <el-button type="text" size="small" @click="handleOper(2, scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="add-contact-line" @click="handleAddContact"><i class="el-icon-plus"></i>联系信息</div>
        </div>
        <div class="role-info" id="role-info">
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
        <div class="group-info" id="group-info">
          <h2>分组关联</h2>
          <el-tag
              v-for="tag in groupList"
              :key="tag.groupId"
              @click="handleTagClickGroup(tag)" :ddd="tag.action">
              <span :groupId="tag.groupId" :class="tag.select ? 'select' : ''">
                {{tag.groupName}}
              </span>
          </el-tag>
        </div>
        <div class="signs-info" id="signs-info">
          <h2 class="mb10">个人签名</h2>
          <el-input type="textarea" v-model.trim="personalSignature" maxlength="150" show-word-limit resize="none"/>
        </div>
        <div class="user-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit('formData')" :disabled="isSubmitDisabled">提交</el-button>
        </div>
      </div>
      <el-dialog class="dialogVisible"
        :title="isModify ? '编辑联系信息' : '新建联系信息'"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :show-close="false" width="854px">
        <el-form label-position="top" :model="formContactData" ref="formContactData" :rules="formContactRules">
          <el-row>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="联系方式" :label-width="formLabelWidth" prop="contact">
                <el-select v-model="formContactData.contact" @change="contactChange">
                  <el-option v-for="item in selContactList"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7" class="mr30 pinline">
              <el-form-item label="联系信息" :label-width="formLabelWidth" prop="information">
                <el-input v-model.trim="formContactData.information" maxlength="50"/>
              </el-form-item>
            </el-col>
            <el-col :span="7" class="pinline">
              <el-form-item label="主联系方式" :label-width="formLabelWidth" prop="isPrimary">
                <el-radio-group v-model="formContactData.isPrimary" :disabled="isExistPrimary">
                  <el-radio :label="false">否</el-radio>
                  <el-radio :label="true">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述" prop="infoDesc">
            <el-input type="textarea" v-model.trim="formContactData.infoDesc" maxlength="150" show-word-limit resize="none"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleContactCancel('formContactData')">取消</el-button>
          <el-button type="primary" @click="handleContactSubmit('formContactData')">提交</el-button>
        </div>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Cascader,
    Col,
    Dialog,
    DatePicker,
    Form,
    FormItem,
    Input,
    Container,
    Message as ElMessage,
    MessageBox as ElMessageBox,
    Option,
    Popover,
    Radio,
    RadioGroup,
    Row,
    Select,
    Table,
    TableColumn,
    Tag,
    // Tree,
    Upload,
  } from 'element-ui'
  import {
    SelectTree,
  } from '@ej/ui'

  import runtimeArgs from '@/runtime-args'

  import {cloneDeep} from 'lodash'
  import {formatTime} from '@/utils'

  import SAVE_USER from '@/graphql/user/save_user.gql'
  import UPDATE_USER from '@/graphql/user/update_user.gql'
  import DELETE_AMBRY_BY_ID from '@/graphql/user/delete_ambry_by_id.gql'
  import USER_INFO from '@/graphql/user/user_info.gql'
  import CHECK_USER_NAME from '@/graphql/user/check_user_name.gql'
  import ROLE_LIST from '@/graphql/role/role_list.gql'
  import GROUP_LIST from '@/graphql/group/group_list.gql'
  import ORGANIZATION_LIST from '@/graphql/user/organization_list.gql'
  Vue.use(Button)
  Vue.use(Cascader)
  Vue.use(Col)
  Vue.use(Dialog)
  Vue.use(DatePicker)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)
  Vue.use(Container)
  // Vue.use(Loading)
  Vue.use(Option)
  Vue.use(Popover)
  Vue.use(Radio)
  Vue.use(RadioGroup)
  Vue.use(Row)
  Vue.use(Select)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Tag)
  Vue.use(Upload)

  const upDownUrl = runtimeArgs.VUE_APP_AUTH_FRONTIER_URL
  const uploadUrl = runtimeArgs.VUE_APP_AUTH_FRONTIER_URL + 'filesUpload'
  export default {
    name: 'operates-user',
    components: {
      SelectTree,
    },
    data () {
      var checkTitle = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入登录账户'))
        }
        // var isExistUser = this.checkUserName()
        this.checkUserName().then(res => {
          if (!res) {
            callback(new Error('该登录账户已存在'))
          } else {
            callback()
          }
        })
      }
      return {
        oldPassword: null,
        curUserId: null,
        sliderList: [
          {
            key: '1',
            value: 'basic-info',
            text: '基本信息',
            active: true,
          },
          {
            key: '2',
            value: 'role-info',
            text: '角色关联',
            active: false,
          },
          {
            key: '3',
            value: 'group-info',
            text: '分组关联',
            active: false,
          },
          {
            key: '4',
            value: 'signs-info',
            text: '个人签名',
            active: false,
          },
        ],
        formLabelWidth: '120px',
        is_avatar_uploading: false,
        actionUrl: uploadUrl,
        isModify: false,
        selContactList: [
          {
            value: 'FIXEDTELEPHONE',
            text: '固定电话',
          },
          {
            value: 'MOBILEPHONE',
            text: '移动电话',
          },
          {
            value: 'FAXNUMBER',
            text: '传真号码',
          },
          {
            value: 'MAILBOX',
            text: '邮箱',
          },
        ],
        formContactData: {
          information: '',
          contact: 'FIXEDTELEPHONE',
          isPrimary: true,
          infoDesc: '',
        },
        formContactRules: {
          information: [
            {
              required: true,
              message: '请输入联系信息',
              trigger: 'blur',
            },
          ],
          contact: [
            {
              required: true,
              message: '请选择联系方式',
              trigger: 'change',
            },
          ],
          isPrimary: [
            {
              required: true,
              message: '请选择主联系方式',
              trigger: 'change',
            },
          ],
        },
        isExistPrimary: false, // 添加联系方式时，判断是否已经存在主键联系方式
        dialogVisible: false,
        formData: {
          username: '',
          password: '',
          userAvatar: '',
          enabled: true,
          name: '',
          userSex: 1,
          userBirthday: '',
          jobNumber: '',
          position: '',
          title: '',
          isWaixie: 0,
          organizationIds: '',
          outsourcingCompany: '', // 归属单位
          outsourcingPhone: '',
          userAddress: '',
        },
        formRules: {
          username: [
            {
              required: true,
              validator: checkTitle,
              // message: '请输入登录账户',
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
          name: [
            {
              required: true,
              message: '请输入用户姓名',
              trigger: 'blur',
            },
          ],
          organizationIds: [
            {
              required: true,
              message: '请选择机构名称',
              trigger: 'change',
            },
          ],
          jobNumber: [{
            required: true,
            message: '请输入工号',
            trigger: 'blur',
          }],
        },
        // organizationList: [],
        isSubmitDisabled: false, // 单击提交按钮时，禁用该按钮，以便多次提交
        contactList: [], // 联系方式
        /* 角色关联start */
        roleList: [],
        /* 角色关联end */
        /* 分组关联start */
        groupList: [],
        /* 分组关联end */
        personalSignature: '', // 个人签名
        oldAvatarAambryId: '', // 头像id值，保存时需要用该id删除头像
        newAvatarAambryId: '',
        // 下拉框树
        sTProps: {
          value: 'id',
          label: 'organizationName',
          children: 'children',
        },
        sTData: [],
        isClearable: true, // 可清空（可选）
      }
    },

    created () {
      this.getRoleList()
      this.getGroupList()
      this.getOrganizationList()
      this.curUserId = this.$route.query.id
      if (this.curUserId) {
        this.getUserInfoById()
      }
    },

    methods: {
      getRoleList () {
        this.$apollo.query({
          query: ROLE_LIST,
          fetchPolicy: 'no-cache',
        }).then(respData => {
          let data = respData.data.data
          this.roleList = []
          if (data.length > 0) {
            this.roleList = data
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      getGroupList () {
        this.$apollo.query({
          query: GROUP_LIST,
          fetchPolicy: 'no-cache',
          variables: {
            input: {
              groupId: '',
              keyWords: '',
            },
          },
        }).then(respData => {
          let data = respData.data.data
          this.groupList = []
          if (data.length > 0) {
            this.groupList = data
          }
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
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
          self.contactList = []
          // 机构名称值
          let oIds = []
          curUserInfo.organizations.forEach(item => {
            oIds.push(item.organizationId)
          })
          // curUserInfo.userAvatar = 'https://jinxin.dev/pro/file-read-133.html'
          let getCurAvatar = ''
          if (curUserInfo.userAvatar) {
            getCurAvatar = curUserInfo.userAvatar.indexOf('fileDownload') < 0 ? `${upDownUrl}fileDownload?ambryId=${curUserInfo.userAvatar}&show=true` : curUserInfo.userAvatar
          } else {
            // getCurAvatar = 'http://5b0988e595225.cdn.sohucs.com/images/20170918/36341cb3b515496ca14bdf20c4dde876.jpeg'
          }
          self.formData = {
            username: curUserInfo.username,
            password: curUserInfo.password,
            userAvatar: getCurAvatar,
            enabled: curUserInfo.enabled,
            name: curUserInfo.name,
            userSex: curUserInfo.userSex,
            userBirthday: curUserInfo.userBirthday,
            jobNumber: curUserInfo.jobNumber,
            position: curUserInfo.position,
            title: curUserInfo.title,
            isWaixie: curUserInfo.outsourcingCompany !== '' ? 1 : 0,
            organizationIds: oIds[0], // curUserInfo.organizations,
            outsourcingCompany: curUserInfo.outsourcingCompany, // 归属单位
            outsourcingPhone: curUserInfo.outsourcingPhone,
            userAddress: curUserInfo.userAddress,
          }
          self.oldPassword = curUserInfo.password
          self.oldAvatarAambryId = curUserInfo.userAvatar
          self.formData.id = curUserInfo.userId
          self.personalSignature = curUserInfo.personalSignature
          curUserInfo.userInfoVOS.forEach(item => {
            self.contactList.push({
              contactId: Math.floor(Math.random() * 10),
              information: item.information,
              contact: item.contact,
              isPrimary: item.isPrimary,
              infoDesc: item.infoDesc,
            })
          })
          self.roleList.find(item => {
            curUserInfo.roles.find(litem => {
              if (item.id === litem.id) {
                item.select = true
              }
            })
          })
          self.groupList.find(item => {
            curUserInfo.groups.find(litem => {
              if (item.groupId === litem.groupId) {
                item.select = true
              }
            })
          })
        }).catch(err => {
          ElMessage.error({message: err.message || '请求失败请重试'})
        })
      },
      async checkUserName () {
        let data = await this.$apollo.query({
          query: CHECK_USER_NAME,
          variables: {
            username: this.formData.username,
            userId: this.curUserId,
          },
        })
        return data.data.data
      },
      async getOrganizationList () {
        let data = await this.$apollo.query({
          query: ORGANIZATION_LIST,
          fetchPolicy: 'no-cache',
        })
        if (data) {
          let curData = data.data.data
          this.sTData = this.covertChildrenData(curData)
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
      // 取值
      getValue (value) {
        this.formData.organizationIds = value
      },
      contactChange (val) {
        this.isExistPrimary = this.contactList.some(t => t.contact === val && t.isPrimary)
        this.formContactData.isPrimary = !this.isExistPrimary
      },
      handleAddContact () {
        this.isExistPrimary = this.contactList.some(t => t.contact === 'FIXEDTELEPHONE' && t.isPrimary)
        this.formContactData = {
          information: '',
          contact: 'FIXEDTELEPHONE',
          isPrimary: !this.isExistPrimary,
          infoDesc: '',
        }
        this.dialogVisible = true
        this.isModify = false
      },
      handleContactCancel (formName) {
        this.dialogVisible = false
        // this.isModify = false
        // this.$refs[formName].resetFields()
      },
      handleContactSubmit (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.isModify) {
              this.contactList.filter(item => {
                if (item.contactId === this.formContactData.contactId) {
                  item = this.formContactData
                }
              })
            } else {
              let curContactId = parseInt(Math.random() * 100) + 1
              if (this.contactList.some(t => t.contactId === curContactId)) {
                curContactId = parseInt(Math.random() * 100) + 1
              }
              this.formContactData.contactId = curContactId
              this.contactList.push(this.formContactData)
            }
            this.dialogVisible = false
          }
        })
      },
      handleOper (oper, data) {
        switch (oper) {
          case 1:
            // 编辑操作
            let isHasZ = this.contactList.some(t => t.isPrimary && t.contact === data.contact)
            let isCurHasZ = this.contactList.some(t => t.contactId === data.contactId && t.isPrimary && t.contact === data.contact)
            if (isCurHasZ) {
              this.isExistPrimary = false
            } else if (!isCurHasZ && isHasZ) {
              this.isExistPrimary = true
            } else {
              this.isExistPrimary = false
            }
            this.isModify = true
            this.contactList.filter(item => {
              if (item.contactId === data.contactId) {
                let mItem = item
                this.formContactData = mItem
                this.dialogVisible = true
              }
            })
            break
          case 2:
            // 删除操作
            let delIndex = ''
            this.contactList.forEach((item, index) => {
              if (item.contactId === data.contactId) {
                delIndex = index
              }
            })
            ElMessageBox.confirm('是否删除所选项？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true,
            }).then(() => {
              this.contactList.splice(delIndex, 1)
            }).catch(() => {
              ElMessage.info('已取消删除')
            })
            break
          default:
            console.log('')
        }
      },
      handleSlider (slider) {
        this.$nextTick(function () {
          this.sliderList.forEach(function (item) {
            item.active = false
          })
          slider.active = true
        })
      },
      handleAvatarSuccess (file) {
        this.is_avatar_uploading = false
        if (file.errno === '106') {
          ElMessage.error('上传头像失败')
        } else {
          this.newAvatarAambryId = file[0].ambryId
          let getAmbryUrl = `${upDownUrl}fileDownload?ambryId=${this.newAvatarAambryId}&show=true`
          this.formData.userAvatar = getAmbryUrl
          this.$refs['formData'].validateField('userAvatar')
        }
      },
      beforeAvatarUpload (file) {
        const isJPG = file.type === 'image/jpeg'
        const isPNG = file.type === 'image/png'
        const isGIF = file.type === 'image/gif'
        const isLt2M = file.size / 1024 / 1024 < 2
        let result = true
        if (!isJPG && !isPNG && !isGIF) {
          ElMessage.warning('上传头像大小只能是PNG/JPG/JIF格式')
          result = false
        }
        if (!isLt2M) {
          ElMessage.warning('上传头像大小不能超过2MB')
          result = false
        }
        return result
      },
      handleAvatarUpload (file) {
        if (this.beforeAvatarUpload(file)) {
          this.is_avatar_uploading = true
        }
        return this.beforeAvatarUpload(file)
      },
      /* 角色start */
      handleTagClick (tag) {
        let clickRArr = cloneDeep(this.roleList)
        clickRArr.map(item => {
          if (tag.id === item.id) {
            item.select = !tag.select
          }
        })
        this.roleList = clickRArr
      },
      /* 角色end */
      /* 分组start */
      handleTagClickGroup (tag) {
        let clickGArr = cloneDeep(this.groupList)
        clickGArr.map(item => {
          if (tag.groupId === item.groupId) {
            item.select = !tag.select
          }
        })
        this.groupList = clickGArr
      },
      /* 分组end */
      handleCancel () {
        this.$router.push({path: '/users/user', query: {pageNum: this.$route.query.pageNum, type: this.$route.query.type}})
      },
      /* 保存之前，先删除头像 */
      async handleDeleteAmbryById () {
        await this.$apollo.mutate({
          mutation: DELETE_AMBRY_BY_ID,
          fetchPolicy: 'no-cache',
          variables: {
            ambryId: this.oldAvatarAambryId,
          },
        })
      },
      changeStore () {
        // 更换头像时，根据（ambryId）删除之前的头像
        this.handleDeleteAmbryById()
        // 如果有更换头像，则更新store->userInfo中的avatar头像值
        if (this.$store.state.userData.avatar !== this.newAvatarAambryId) {
          this.$store.commit('setUserInfo', {
            userId: this.$store.state.userData.userId,
            tenantId: this.$store.state.userData.tenantId,
            tenantName: this.$store.state.userData.tenantName,
            name: this.$store.state.userData.name,
            avatar: this.newAvatarAambryId,
            permissionCodes: this.$store.state.userData.permissionCodes,
            tenantLevel: this.$store.state.userData.tenantLevel,
          })
        }
      },
      // 新增和编辑用户方法
      saveOrUpdateUser () {
        this.isSubmitDisabled = true
        delete this.formData.isWaixie
        this.contactList.forEach(item => {
          delete item.contactId
        })
        let roleIds = []
        this.roleList.forEach(item => {
          if (item.select) {
            roleIds.push(item.id)
          }
        })
        let groupIds = []
        this.groupList.forEach(item => {
          if (item.select) {
            groupIds.push(item.groupId)
          }
        })
        this.formData.userBirthday = formatTime(this.formData.userBirthday)
        this.formData.id = this.curUserId
        this.formData.oauthUserInfos = this.contactList
        this.formData.roleIds = roleIds
        this.formData.groupIds = groupIds
        this.formData.personalSignature = this.personalSignature
        // 修改用户更换头像
        if (this.newAvatarAambryId !== '' && this.oldAvatarAambryId !== this.newAvatarAambryId) {
          this.formData.userAvatar = this.newAvatarAambryId
        } else {
          this.formData.userAvatar = this.oldAvatarAambryId
        }
        if (this.curUserId) {
          if (this.formData.password === this.oldPassword) {
            this.formData.password = null
          }
          this.$apollo.mutate({
            mutation: UPDATE_USER,
            variables: {
              input: this.formData,
            },
          }).then((data) => {
            this.isSubmitDisabled = false
            // 修改的用户和当前登录用户相同，且更换头像
            if (this.$store.state.userData.userId === this.curUserId && this.newAvatarAambryId !== '' && this.oldAvatarAambryId !== this.newAvatarAambryId) {
              this.changeStore()
            }
            this.$router.push({path: '/users/user', query: {pageNum: this.$route.query.pageNum, type: this.$route.query.type}})
          }).catch((err) => {
            this.isSubmitDisabled = false
            ElMessage.error({message: err.message || '请求失败请重试'})
          })
        } else {
          this.$apollo.mutate({
            mutation: SAVE_USER,
            variables: {
              input: this.formData,
            },
          }).then((data) => {
            this.isSubmitDisabled = false
            this.$router.push({path: '/users/user', query: {pageNum: this.$route.query.pageNum, type: this.$route.query.type}})
          }).catch((err) => {
            this.isSubmitDisabled = false
            ElMessage.error({message: err.message || '请求失败请重试'})
          })
        }
      },
      handleSubmit (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // console.log(111, this.formData.userAvatar)
            if (this.formData.userAvatar && this.formData.userAvatar.indexOf('fileDownload') < 0) {
              ElMessage.warning('请重新上传用户头像')
              return
            }
            this.saveOrUpdateUser()
          }
        })
      },
    },
  }
</script>

<style lang="scss">
  .operates-user-view {
    @apply bg-white;

    .user-slider {
      margin-top: 20px;
      width: 239px;

      li {
        padding-left: 55px;
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        color: #333333;
        cursor: pointer;

        &.active, &:hover {
          color: #477DE9;
          background-color: #E2ECFF;
          box-shadow: 2px 2px 2px 0px rgba(0,0,0,0.15);
        }
      }
    }

    .mr30 {
      margin-right: 30px;
    }

    .mb10 {
      margin-bottom: 10px !important;
    }

    .user-content {
      padding: 0 26px 20px 26px;
      border-left: 2px solid #EEEEEE;
      flex: 1;

      h2 {
        margin: 20px 0 0 0;
        font-size: 16px;
        color: #333333;
      }

      .el-table {
        th {
          background-color: #F7F7F7;
        }
      }

      .add-contact-line {
        height: 24px;
        line-height: 24px;
        border: 1px dashed #477DE9;
        font-size: 12px;
        color: #333333;
        text-align: center;
        cursor: pointer;
      }

      /*角色关联样式*/
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

      .user-footer {
        margin: 20px 0;
        text-align: center;

        .el-button {
          padding: 0;
          width: 64px;
          height: 32px;
        }
      }
    }

    .dialogVisible {
      .el-dialog__body {
        padding: 30px 20px;
        .el-textarea {
          width: 770px;
          height: 157px;

          .el-textarea__inner {
            width: 770px;
            height: 157px;
            border-radius: 4px;
          }
        }
      }

      .el-dialog__footer {
        width: 770px;
        padding: 0px 5px 50px 20px;

        .el-button {
          padding: 0;
          width: 64px;
          height: 32px;
        }
      }
    }
    .el-form {
      margin: 10px 0 0 20px;

      .avatar-uploader {
        position: absolute !important;
        top: -90px;

        .el-upload {
          border: 1px dashed #d9d9d9;
          border-radius: 6px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .el-upload:hover {
          border-color: #409EFF;
        }

        .avatar-uploader-icon {
          font-size: 28px;
          color: #8c939d;
          width: 140px;
          height: 140px;
          line-height: 140px;
          text-align: center;
        }

        .avatar {
          width: 140px;
          height: 140px;
          opacity: 1 !important;
          display: block;
        }
      }

      .el-form-item__label {
        line-height: 15px;
        padding-bottom: 3px;
      }

      .el-form-item__content {
        line-height: 29px;

        .el-input--suffix {
          width: 240px;

          .el-input__suffix {
            top: 5px;
          }

          &.is-focus {
            .el-input__suffix {
              top: -6px;
            }
          }
        }

        .el-input__prefix {
          top: -6px;
        }
      }

      .el-input__inner {
        width: 240px;
        height: 28px;
        line-height: 28px;
        border-radius: 4px;
      }

      .info-item {
        .el-form-item__content {
          .el-input__suffix {
            top: -6px;
          }
        }
      }
    }
  }
</style>
