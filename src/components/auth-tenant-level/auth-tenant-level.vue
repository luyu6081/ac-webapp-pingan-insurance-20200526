<template>
  <div class="auth-tenant-level-view">
    <el-dialog title="租户激活码"
        :visible.sync="isCreateRC"
        :close-on-click-modal="false"
        :show-close="false"
        width="600px"
        class="auth-tenant-level-dialog">
      <div>
        <span class="registration-code">{{curRegistrationCode}}</span>
        <span class="registration-tip">
          此注册码为用户登录该系统唯一凭证码,复制后登录可激活,请点击复制
        </span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="CopyRegistrationCode()">复制</el-button>
        <el-button @click="closeCreateRC()">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {
    Button,
    Dialog,
    Input,
    Message as ElMessage,
  } from 'element-ui'

  Vue.use(Button)
  Vue.use(Dialog)
  Vue.use(Input)

  export default {
    name: 'EjAuthTenantLevel',
    components: {},
    props: {
      isCreateRC: Boolean,
      registrationCode: String,
    },
    data () {
      return {
        curRegistrationCode: '',
      }
    },
    watch: {
      registrationCode (val) {
        this.curRegistrationCode = val
      },
    },
    created () {
    },

    methods: {
      CopyRegistrationCode () {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.setAttribute('value', this.registrationCode)
        input.select()
        if (document.execCommand('copy')) {
          document.execCommand('copy')
          ElMessage.info('复制成功')
        }
        document.body.removeChild(input)
      },
      closeCreateRC () {
        this.$emit('closeCreateRC', false)
      },
    },
  }
</script>
<style lang="scss">
  .auth-tenant-level-view {
    .text-center {
      text-align: center;
    }
    .auth-tenant-level-dialog {
      .el-dialog__header {
        text-align: center;
      }

      .el-dialog__body {
        padding: 50px;

        .registration-code {
          @apply text-blue;
        }

        .registration-tip {

        }
      }

      .el-dialog__footer {
        width: 600px;
        padding: 0px 20px 50px 20px;
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
</style>
