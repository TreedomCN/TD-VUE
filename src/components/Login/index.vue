<template>
  <div>
    <van-popup
      v-model:show="showPopup"
      round
      :close-on-click-overlay="false"
      :style="{ width: '80%' }"
    >
      <van-cell-group inset class="cell">
        <van-field
          v-model="username"
          center
          clearable
          label="用户名"
          placeholder="请输入用户名"
          maxlength="7"
        >
          <template #button>
            <van-button size="large" type="primary" @click="enterName">确认</van-button>
          </template>
        </van-field>
      </van-cell-group>
    </van-popup>
  </div>

</template>
<script>
import { reactive, toRefs } from 'vue'
import { Toast } from 'vant'
export default {
  name: 'LoginBox',
  setup() {
    const enterName = () => {
      if (contentList.username.trim() === '') {
        Toast('请输入名字')
        return
      }
      window.user.username = contentList.username
      contentList.showPopup = false
      var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0
      window.scrollTo(0, Math.max(scrollHeight, 0))
      document.body.scrollTop = 0
    }
    const contentList = reactive({
      showPopup: true,
      username: '',
      enterName: enterName
    })
    const ref = toRefs(contentList)
    return {
      ...ref
    }
  }
}
</script>
<style lang="less" scope>
.cell .van-field__label {
    // text-align: center;
    width: 4em;
}
.cell .van-cell {
    font-size: 30px;
    padding-top: 15px;
}
.cell .van-button {
    padding:80px 28px;
    font-size: 30px;
}
</style>
