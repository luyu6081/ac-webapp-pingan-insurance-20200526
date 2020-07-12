<template>
  <div class="auth-tenant-active-view">
    <el-dialog :title="isPlatFormExpired ? '过期提示' : (isPlatFormChange ? '监测异常提示' : '租户激活码')"
        :visible.sync="isCreateATA"
        :close-on-click-modal="false"
        :show-close="false"
        width="600px"
        class="auth-tenant-active-dialog">
        <div v-if="isPlatFormExpired">
          <div class="error-tip">您当前租户所在的平台使用时间已过期<br />请联系平台管理员进行续费！</div>
        </div>
        <div v-if="isPlatFormChange">
          <div class="error-tip">监测出您当前租户所属的平台管理员信息发生变化<br />请联系平台管理员！</div>
        </div>
        <div v-if="!formData.tenantLevelName && !isPlatFormExpired && !isPlatFormChange">
          <el-form ref="formData" label-position="top" :model="formData" :rules="formRules">
            <el-form-item
                label="请输入激活码"
                :label-width="formLabelWidth"
                prop="registrationCode">
              <el-input type="textarea" v-model="formData.registrationCode" resize="none"/>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="ActiveRegistrationCode('formData')">确定</el-button>
          </div>
        </div>
        <div v-if="formData.tenantLevelName && !isPlatFormExpired && !isPlatFormChange">
          <div class="active-tip">激活成功!</div>
          <br />
          <div class="active-tip">您当前的“租户级别”为：{{formData.tenantLevelName}}</div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="closeCreateATA">知道啦</el-button>
          </div>
        </div>
    </el-dialog>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Dialog,
    Form,
    FormItem,
    Input,
    Message as ElMessage,
  } from 'element-ui'

  import CHECK_ACTIVATION_CODE from '@/graphql/tenant/check_activation_code.gql'

  Vue.use(Button)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)

  export default {
    name: 'EjAuthTenantActive',
    components: {},
    props: {
      isCreateATA: Boolean,
      isPlatFormExpired: Boolean,
      isPlatFormChange: Boolean,
    },
    data () {
      return {
        formLabelWidth: '110px',
        formData: {
          registrationCode: '',
          tenantLevelName: '',
        },
        formRules: {
          registrationCode: [
            {
              required: true,
              message: '请输入激活码',
              trigger: 'blur',
            },
          ],
        },
      }
    },
    watch: {
    },
    created () {
    },

    methods: {
      closeCreateATA () {
        this.$emit('closeCreateATA', false)
      },
      ActiveRegistrationCode (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$apollo.query({
              query: CHECK_ACTIVATION_CODE,
              fetchPolicy: 'no-cache',
              variables: {
                activationCode: this.formData.registrationCode.replace(/\+/g, '%2B'),
              },
            }).then(respData => {
              let curData = respData.data.data
              this.formData.tenantLevelName = curData.tenantLevelName
              // 更新userInfo中的tenantLevel值
              this.$store.commit('setUserInfo', {
                tenantId: this.$store.state.userData.tenantId,
                name: this.$store.state.userData.name,
                avatar: this.$store.state.userData.avatar,
                permissionCodes: this.$store.state.userData.permissionCodes,
                tenantLevel: curData.tenantLevel,
              })
            }).catch(err => {
              let code = err.graphQLErrors[0].extensions.code
              if (code === '1407') {
                ElMessage.error('激活码验证失败，请联系平台管理员！')
              } else {
                ElMessage.error({message: err.message || '请求失败请重试'})
              }
            })
          }
        })
      },
    },
  }
</script>
<style lang="scss">
  .auth-tenant-active-view {
    .auth-tenant-active-dialog {
      .el-dialog__header {
        text-align: center;
      }

      .el-dialog__body {
        padding: 50px;

        .el-textarea__inner {
          height: 157px;
          border-radius: 4px;
        }

        .active-tip {
          @apply text-blue;

          font-size: 18px;
          text-align: center;
        }

        .error-tip {
          font-size: 16px;
          text-align: center;
          color: #ff0000;
        }

        .dialog-footer {
          padding: 30px 0 0 0;
          margin: 0 auto;
          text-align: center;

          .el-button {
            padding: 0;
            width: 64px;
            height: 32px;
          }
        }
      }
    }
  }
</style>
