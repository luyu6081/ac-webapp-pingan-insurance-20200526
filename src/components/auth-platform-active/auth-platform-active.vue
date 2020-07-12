<template>
  <div class="auth-platform-active-view">
    <el-dialog :title="isPlatFormChange ? '监测异常提示' : '平台激活码'"
        :visible.sync="isCreateAPA"
        :close-on-click-modal="false"
        :show-close="false"
        width="600px"
        class="auth-platform-active-dialog">
        <div v-if="isPlatFormChange">
          <div class="error-tip">监测出您当前的平台管理员信息发生变化<br />请联系服务提供商！</div>
        </div>
        <div v-if="!formData.platformLevelNum && !isPlatFormChange">
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
        <div v-if="formData.platformLevelNum && !isPlatFormChange">
          <div class="active-tip">激活成功!</div>
          <br />
          <div class="info-tip">
            <div class="info-tip-title">您当前“平台管理员”的级别：</div>
            可创建的租户数量：{{formData.platformLevelNum}}个<br />
            使用截止日期：{{formData.endTime}}
          </div>
          <br />
          <div class="level-tip">若要升级，请联系管理员！</div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="closeCreateAPA">知道啦</el-button>
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

  import CHECK_PLATFORM_ACTIVATION_CODE from '@/graphql/tenant/check_platform_activation_code.gql'

  Vue.use(Button)
  Vue.use(Dialog)
  Vue.use(Form)
  Vue.use(FormItem)
  Vue.use(Input)

  export default {
    name: 'EjAuthPlatformActive',
    components: {},
    props: {
      isCreateAPA: Boolean,
      isPlatFormChange: Boolean,
    },
    data () {
      return {
        formLabelWidth: '110px',
        formData: {
          registrationCode: '',
          platformLevelNum: '',
          endTime: '',
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
      closeCreateAPA () {
        this.$emit('closeCreateAPA', false)
      },
      ActiveRegistrationCode (formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$apollo.query({
              query: CHECK_PLATFORM_ACTIVATION_CODE,
              fetchPolicy: 'no-cache',
              variables: {
                activityCode: this.formData.registrationCode.replace(/\+/g, '%2B'),
              },
            }).then(respData => {
              let curData = respData.data.data
              this.formData.platformLevelNum = curData.tenantUseCount
              this.formData.endTime = curData.endTime.substring(0, 10)
            }).catch(err => {
              let code = err.graphQLErrors[0].extensions.code
              if (code === '1700') {
                ElMessage.error('平台时间已过期，请重新激活！')
              } else if (code === '1400') {
                ElMessage.error('激活码验证失败，请联系服务提供商！')
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
  .auth-platform-active-view {
    .auth-platform-active-dialog {
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

        .info-tip {
          .info-tip-title {
            @apply text-blue;

            font-size: 16px;
          }

          font-size: 14px;
          text-align: center;
        }

        .error-tip {
          font-size: 16px;
          text-align: center;
          color: #ff0000;
        }

        .level-tip {
          font-size: 14px;
          text-align: center;
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
