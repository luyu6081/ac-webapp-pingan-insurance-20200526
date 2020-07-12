<template>
  <el-steps :active="currentValue">
    <el-step v-for="(item, index) in steps" :key="index" :title="item.value"></el-step>
  </el-steps>
</template>

<script>
  import Vue from 'vue'
  import {
    Step,
    Steps,
  } from 'element-ui'
  Vue.use(Steps)
  Vue.use(Step)
  export default {
    name: 'EjStepBar',
    props: {
      active: Number,
      steps: Array,
    },
    data () {
      return {
        currentValue: this.active,
      }
    },
    watch: {
      active (val) {
        this.currentValue = val
      },
    },
    methods: {
    },
  }
</script>
<style lang="scss">
  .el-steps {
    margin-bottom: 24px;
    width: 545px;

    .el-step__main {
      position: absolute;
      top: -9px;
      left: 25px;
      background-color: #fff;
    }

    .el-step.is-horizontal .el-step__line {
      margin-left: 30px;
      width: 90%;
      background-color: #E5E5E5;
      left: 10px;
    }

    .el-step__icon {
      width: 20px;
      height: 20px;
    }
    .el-step__icon.is-text {
      border: 1px solid;
    }

    .el-step__title {
      width: 85px;
      font-size: 16px;
      font-weight: normal;
    }

    .el-step__head.is-wait, .el-step__title {
      color: #9F9F9F;
      border-color: #A5A5A5;
    }

    .el-step__title.is-finish {
      color: #333333;
    }
    .el-step__head.is-finish {
      .el-step__icon {
        border-color: #477DE9;
        background-color: #ffffff;
        color: #477DE9;
      }
    }
    .el-step__title.is-process {
      color: #477DE9;
    }
    .el-step__head.is-process {
      .el-step__icon {
        border-color: #477DE9;
        background-color: #477DE9;
        color: #ffffff;
      }
    }
  }
</style>
