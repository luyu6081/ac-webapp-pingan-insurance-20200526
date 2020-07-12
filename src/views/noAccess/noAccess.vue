<template>
  <div class="noAccess-wrap">
    <div class="container">
      <div class="noAccess-col">
          <img src="@/assets/imgs/noAccess-icon.png" width="320" height="320" alt="">
      </div>
      <div class="noAccess-col">
        <div class="noAccess-text">
          <h2>无权访问</h2>
          <p>对不起，您暂无权限访问该功能，请联系管理员。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'noAccessView',
  }
</script>

<style lang="scss">
  .noAccess-wrap {
    height: 100%;
    height: 100vh;
    width: 100%;
    background-color:#0140CA;
    background: url('../../assets/imgs/noAccess-bg.png');
    background-size: 100%;
    position: relative;
    min-height:610px;
    min-width: 1038px;
    display: flex;
    .container {
      width: 680px;
      height: 320px;
      margin: auto;
      .noAccess-col {
        float: left;
        width: 340px;
        height: 100%;
        overflow: hidden;
        display: flex;
        position: relative;
      }
      .noAccess-text {
        padding: 30px;
        align-items: center;
        margin: auto;
      }
      .noAccess-text h2 {
        margin: 0 0 20px;
        font-size: 24px;
        font-weight: bold;
        line-height: 33px;
        height: 32px;
        color: #fff;
      }
      .noAccess-text p {
        font-size: 18px;
        color: #fff;
        line-height: 1.4em;
      }
    }
  }
</style>
