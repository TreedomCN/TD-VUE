<template>
  <div class="container">
    <LivePlayer />
    <AvatarBox :avatar-arr="avatarArr" />
    <div class="status-box">
      <div v-if="showJoinBtn" class="btn-join" @click="btnJoinHandler">进入控制房间</div>
      <div v-else class="out-join" @click="outJoinHandler">退出控制房间</div>
      <div v-show="isShowWaitNum" class="wait-num">前方还有<span>{{ waitNum }}</span>人</div>
    </div>
    <div v-if="hadJoinCtrl" class="camera-direction">
      <div class="horizontal" :style="`transform:rotate(${cameraAngel[0]}deg)`" />
      <!-- <div class="vertical" :style="`transform:rotate(${cameraAngel[1]}deg)`">
        <van-icon name="arrow" />
      </div> -->
    </div>
    <Controls v-if="hadJoinCtrl" />
    <LoginBox />
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { socket, init } from '@/utils/Socket'
import AvatarBox from '@/components/Avatar/index.vue'
import Controls from '@/components/Control/index.vue'
import LivePlayer from '@/components/Live3/index.vue'
import LoginBox from '@/components/Login/index.vue'
export default {
  name: 'Demo',
  components: {
    AvatarBox,
    Controls,
    LivePlayer,
    LoginBox
  },
  setup() {
    window.user = {}
    const joinHandler = () => {
      contentList.showJoinBtn = false
      init().then(() => {
        successLink()
      }, () => {
        contentList.showJoinBtn = true
      })
    }
    const successLink = () => {
      socket.addEventListener('message', (e) => {
        const event = JSON.parse(e.data)
        console.log(event)
        if (event.type === 'login' || event.type === 'logout') {
          console.log(event.type, event.names)
          if (event.type === 'login') {
            window.user.client_id = event.client_id
          }
          const startIndex = event.names.length
          // TODO 派对人数
          if (startIndex > 5) {
            contentList.waitNum = startIndex - 5
            startIndex === 5
            // contentList.isShowWaitNum = true
          }
          for (let i = 0; i < startIndex; i++) {
            contentList.avatarArr[i] = event.names[i]
          }
          console.log('nickname', event.client_list[window.user.client_id])
          console.log('no1', contentList.avatarArr[0])
          if (event.client_list[window.user.client_id] === contentList.avatarArr[0]) {
            contentList.hadJoinCtrl = true
          }
          if (startIndex < 5) {
            contentList.isShowWaitNum = false
            contentList.avatarArr.fill(undefined, startIndex, 6)
          }
        } else if (event.type === 'system' && event.content === '当前你成为小车管理员') {
          contentList.hadJoinCtrl = true
        } else if (event.type === 'angle') {
          console.log(event.content)
          const angleArr = event.content
          const horizontal = (angleArr[0] - 110)
          const vertical = angleArr[1] - 140
          contentList.cameraAngel = [horizontal, -vertical]
        }
      })
    }
    const outJoinHandler = () => {
      socket.close()
      contentList.showJoinBtn = true
      contentList.hadJoinCtrl = false
      contentList.avatarArr.fill(undefined, 0, 6)
    }
    const contentList = reactive({
      isShowWaitNum: false,
      hadJoinCtrl: false,
      showJoinBtn: true,
      waitNum: 0,
      btnJoinHandler: joinHandler,
      outJoinHandler: outJoinHandler,
      avatarArr: new Array(5),
      cameraAngel: [0, 0]
    })
    const ref = toRefs(contentList)
    return {
      ...ref
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100vw;
  height: 100vh;

  .status-box {
    position: absolute;
    top: 20px;
    right: 20px;
    padding-top: 40px;
    font-size: 20px;
  }
  .btn-join {
    width: 100px;
    height: 40px;
    background: khaki;
    border-radius: 20px;
    color: black;
    text-align: center;
    line-height: 40px;
    font-size: 15px;
  }
  .out-join {
    width: 100px;
    height: 40px;
    background: red;
    border-radius: 20px;
    color: white;
    text-align: center;
    line-height: 40px;
    font-size: 15px;
  }
  .wait-num {
    margin-top: 10px;
    color: white;
  }
}
.camera-direction {
  position: relative;
  width:80px;
  height: 122px;
  background: url('../assets/icon_car.png') no-repeat;
  background-size: 80px auto;
  background-position: center;
  white-space: nowrap;
  margin-left: 60px;
  margin-top: 20px;
  div {
    display: inline-block;
  }
  .horizontal {
    width:80px;
    height: 122px;
    background: url('../assets/icon_view.png') no-repeat;
    background-size: 80px auto;
    background-position: center;
  }
  .van-icon:before {
    color: wheat
  }
}
</style>
