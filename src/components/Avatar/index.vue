<template>
  <div class="avatar-box">
    <div v-for="(item, id) in avatarArr" :key="id" class="avatar">
      <div v-if="item !== undefined" class="user">
        <van-image
          class="user-avatar"
          round
          width="1rem"
          height="1rem"
          :src="require('../../assets/cat.jpg')"
        />
        <span class="username">{{ item }}</span>
      </div>
      <svg v-else class="icon" style="width: 1rem;height: 1rem;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3840"><path d="M759.3 759.8m-200 0a200 200 0 1 0 400 0 200 200 0 1 0-400 0Z" fill="#898EA9" p-id="3841" /><path d="M659.3 743.8h200v32h-200z" fill="#FFFFFF" p-id="3842" /><path d="M743.3 659.8h32v200h-32z" fill="#FFFFFF" p-id="3843" /><path d="M925.8 337.4c-22.6-53.3-54.9-101.3-96-142.4s-89-73.4-142.4-96C632.1 75.6 573.5 63.8 513 63.8S393.9 75.6 338.6 99c-53.3 22.6-101.3 54.9-142.4 96s-73.4 89-96 142.4C76.8 392.7 65 451.3 65 511.8s11.8 119.1 35.2 174.4c22.6 53.3 54.9 101.3 96 142.4 41.1 41.1 89 73.4 142.4 96 55.2 23.4 113.9 35.2 174.4 35.2 22.8 0 45.8-1.7 68.2-5.2l15.8-2.4-4.8-31.6-15.8 2.4c-20.8 3.2-42.1 4.8-63.3 4.8-56.2 0-110.6-11-161.9-32.7-49.5-21-94-50.9-132.2-89.2-11.7-11.7-22.6-24-32.7-36.8 11.9-47.3 49-91.1 105.1-123.8 61-35.6 139.8-55.1 221.8-55.1 19.8 0 39.6 1.1 59 3.4l3.7-31.8c-20.5-2.4-41.6-3.6-62.7-3.6-87.6 0-172 21.1-237.9 59.5-54.3 31.6-93 73.1-112 119.3-12.9-20-24.1-41.1-33.4-63.2C108 622.4 97 568 97 511.8s11-110.6 32.7-161.9c21-49.5 50.9-94 89.2-132.2s82.7-68.2 132.2-89.2c51.3-21.7 105.8-32.7 161.9-32.7 56.2 0 110.6 11 161.9 32.7 49.5 21 94 50.9 132.2 89.2s68.2 82.7 89.2 132.2C918 401.2 929 455.6 929 511.8c0 21.3-1.6 42.8-4.8 63.7l-2.4 15.8 31.6 4.9 2.4-15.8c3.5-22.5 5.2-45.6 5.2-68.5 0-60.6-11.8-119.2-35.2-174.5z" fill="#00365B" p-id="3844" /><path d="M513 204.9c-81.2 0-147.1 65.9-147.1 147.1S431.8 499.1 513 499.1 660.1 433.3 660.1 352 594.2 204.9 513 204.9z m81.4 228.5c-21.7 21.7-50.6 33.7-81.4 33.7s-59.6-12-81.4-33.7c-21.7-21.7-33.7-50.6-33.7-81.4 0-30.7 12-59.6 33.7-81.4 21.7-21.7 50.6-33.7 81.4-33.7s59.6 12 81.4 33.7c21.7 21.7 33.7 50.6 33.7 81.4 0 30.8-12 59.7-33.7 81.4z" fill="#00365B" p-id="3845" /></svg>
    </div>
  </div>
</template>
<script>
import { reactive, toRefs } from 'vue'
export default {
  name: 'AvatarBox',
  props: ['avatarArr'],
  setup(props) {
    const avatarList = reactive({
      avatarArr: props.avatarArr
    })
    const ref = toRefs(avatarList)
    return {
      ...ref
    }
  }
}
</script>
<style lang="less" scoped>
.avatar-box {
    position: relative;
    display: inline-block;
    padding-left: 40px;
  }
  .user {
    position: relative;
  }
  .avatar {
    display: inline-block;
    margin: 20px 10px;
  }
  .user-avatar {
    vertical-align: middle;
    overflow: unset;
  }
  .username {
    font-size: 14px;
    color: white;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%)
  }
  .avatar:first-child .user-avatar {
    &::after {
      // position: absolute;
      white-space: nowrap;
      display: block;
      content: '当前控制者';
      color: white;
      width: 100%;
      font-size: 22px;
    }
  }
</style>
