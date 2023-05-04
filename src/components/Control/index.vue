<template>
  <div class="control-direction">
    <div class="direction-key up" @touchstart.stop.prevent="invSendTxt('up')" @touchend="invSendTxt('stop')">
      <van-icon name="arrow-up" color="#000000" />
    </div>
    <div class="direction-key left" @touchstart.stop.prevent="invSendTxt('left')" @touchend="invSendTxt('stop')">
      <van-icon name="arrow-left" color="#000000" />
    </div>
    <div class="direction-key right" @touchstart.stop.prevent="invSendTxt('right')" @touchend="invSendTxt('stop')">
      <van-icon name="arrow" color="#000000" />
    </div>
    <div class="direction-key down" @touchstart.stop.prevent="invSendTxt('down')" @touchend="invSendTxt('stop')">
      <van-icon name="arrow-down" color="#000000" />
    </div>
    <div class="title">方向控制器</div>
  </div>
  <div class="control-camera">
    <div class="direction-key up camera-up" @touchstart="sendTxt('btop')">
      <van-icon name="arrow-up" color="#000000" />
    </div>
    <div class="direction-key down camera-down" @touchstart="sendTxt('bdown')">
      <van-icon name="arrow-down" color="#000000" />
    </div>
    <div class="direction-key left camera-left" @touchstart="sendTxt('bleft')">
      <van-icon name="arrow-left" color="#000000" />
    </div>
    <div class="direction-key right camera-right" @touchstart="sendTxt('bright')">
      <van-icon name="arrow" color="#000000" />
    </div>
    <div class="title">摄像头控制器</div>
  </div>
</template>

<script>
import { socket, send } from '@/utils/Socket.js'
export default {
  name: 'Controls',
  setup() {
    let inv = null
    const invSendTxt = (str) => {
      console.log(str)
      clearInterval(inv)
      if (str === 'stop') {
        socket.send(JSON.stringify({ 'type': 'car', 'client_name': window.user.username, 'room_id': 1, 'to_client_id': 0, 'content': 'stop' }))
        inv = null
      } else {
        inv = setInterval(() => {
          socket.send(JSON.stringify({ 'type': 'car', 'client_name': window.user.username, 'room_id': 1, 'to_client_id': 0, 'content': str }))
        }, 50)
      }
    }
    const sendTxt = (str) => {
      console.log(str)
      socket.send(JSON.stringify({ 'type': 'camera', 'client_name': window.user.username, 'room_id': 1, 'to_client_id': 0, 'content': str }))
    }
    return {
      sendTxt,
      invSendTxt
    }
  }
}
</script>
<style lang="less" scoped>
.control-direction {
    position: absolute;
    bottom: 20px;
    left: 80px;
    // background: aqua;
    text-align:center;
    width: 200px;
    height: 200px;
    font-size: 24px;
    color: white;
    transform: scale(1.5);
  }
  .control-camera {
    position: absolute;
    bottom: 20px;
    right: 80px;
    // background: gold;
    width: 200px;
    height: 200px;
    font-size: 24px;
    color: white;
    text-align:center;
     transform: scale(1.5);
  }
  .title {
    position: absolute;
    width: 100%;
    top: 150px;
    pointer-events: none;
  }
  .direction-key {
    position:absolute;
    width: 50px;
    height: 50px;
    background: goldenrod;
    i {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
  .up {
    top: 0;
    left: 50%;
    margin-left: -25px;
  }
  .left {
    top: 50px;
    left: 25px;
  }
  .right {
    top: 50px;
    right: 25px;
  }
  .down {
    top: 100px;
    left: 50%;
    margin-left: -25px;
  }
</style>
