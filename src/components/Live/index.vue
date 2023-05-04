<template>
  <div class="live-player-box">
    <div id="live-player" ref="videoBox" class="live-player">
      <video id="live-video" ref="videoDom" playsinline webkit-playsinline />
    </div>
    <div class="three-canvas-box">
      <canvas ref="canvasDom" class="scene-canvas" />
    </div>
    <div v-show="isShowPlayBtn" class="btn-play" @click="playLive">点击播放</div>
  </div>
</template>
<script>
// import { TcPlayer } from '@/lib/TcPlayer-2.4.1.js'
import { reactive, toRefs, ref, onMounted, render } from 'vue'
import { Toast } from 'vant'
import FrontScene from './FrontScene.js'
export default {
  name: 'LivePlayer',
  setup() {
    const videoBox = ref(null)
    const videoDom = ref(null)
    const canvasDom = ref(null)
    const liveUrl = 'webrtc://tliveplay.treedom.cn/carlive2/car'
    let tcPlayer, frontScene, modelNow
    let prevX = 0; let prevY = 0
    // onMounted(() => {
    //   console.log('s', videoBox)
    // })
    const startDetect = () => {
    //   const ctx = canvasDom.value.getContext('2d')
      modelNow.detect(videoBox.value.querySelector('.tcplayer video')).then((predictions) => {
        console.log(predictions)
        // ctx.clearRect(0, 0, 750, 1600)
        const arr = predictions.filter(v => v.class === 'bottle')
        if (arr.length > 0) {
          const v = arr[0]
          if (Math.abs(x - prevX) <= 3 && Math.abs(y - prevY) <= 2) return
          const x = v.bbox[0]
          prevX = x
          const y = v.bbox[1]
          prevY = y
          const width = v.bbox[2]
          const height = v.bbox[3]
          const klass = v.class
          const score = v.score.toFixed(2)

          //   ctx.strokeStyle = '#00FFFF'
          //   ctx.lineWidth = 4
          //   ctx.strokeRect(v.bbox[0], v.bbox[1], width, height)

          //   // Draw the label background.
          //   ctx.fillStyle = '#00FFFF'
          //   const textWidth = ctx.measureText(klass + ':' + score).width
          //   const textHeight = parseInt('16px sans-serif', 10) // base 10
          //   ctx.fillRect(v.bbox[0], v.bbox[1], textWidth + 4, textHeight + 4)

          //   // let [x1, y1, , ] = boxes_data.slice(i * 4, (i + 1) * 4);
          //   // x1 *= canvasDom.width;
          //   // y1 *= canvasDom.height;
          //   // const klass = names[classes_data[i]];
          //   // const score = scores_data[i].toFixed(2);

          //   // Draw the text last to ensure it's on top.
          //   ctx.fillStyle = '#000000'
          //   ctx.fillText(klass + ':' + score, v.bbox[0], v.bbox[1])
          if (frontScene) {
            frontScene.scaleCube(width, height, x, y)
          }
        } else {
        //   ctx.clearRect(0, 0, 750, 1600)
          if (frontScene && frontScene.cube) {
            frontScene.cube.visible = false
          }
        }
      })
      requestAnimationFrame(startDetect)
    }
    const playLiveHandler = () => {
      liveData.isShowPlayBtn = false
      //   let hadCreate
      if (!tcPlayer) {
        tcPlayer = TCPlayer('live-video', {
          controls: false
        }) // player-container-id 为播放器容器 ID，必须与 html 中一致
        tcPlayer.src(liveUrl) // url 播放地址
        tcPlayer.on('timeupdate', (event) => {
        //   console.log('123')
          if (frontScene && tcPlayer.videoWidth() !== 0 && canvasDom.value.width !== 0) return
          console.log(tcPlayer.videoWidth())
          canvasDom.value.width = tcPlayer.videoWidth()
          canvasDom.value.height = tcPlayer.videoHeight()
          resizeVideo()
          //   canvasDom.value.style.width = videoDom.value.getBoundingClientRect().width + 'px'
          //   canvasDom.value.style.height = videoDom.value.getBoundingClientRect().height + 'px'
          //   frontScene = 1
          frontScene = new FrontScene(canvasDom.value)
          frontScene.render()
          //   if (event.data.code === 1001) {
        //   console.log('videoWidth', videoBox.value.querySelector('.tcplayer video').getBoundingClientRect())
        //   console.log('videoHeight')
        //   }
        })
        tcPlayer.on('loadeddata', () => {
          console.log('123123123')
          startDetect()
        })
        tcPlayer.play()
      } else {

      }
    }
    // const weights = '/trans2/model.json';
    Toast.loading({
      message: '加载中...',
      //   forbidClick: true,
      duration: 0
    //   loadingType: 'spinner'
    })
    cocoSsd.load().then(model => {
      modelNow = model
      Toast.clear()
      liveData.isShowPlayBtn = true
    })
    const resizeVideo = () => {
      const width = innerWidth
      const height = innerHeight
      if (width > height) {
        const ratio = (height / width).toFixed(2)
        videoBox.value.querySelector('.tcplayer').style.paddingTop = `${ratio * 100}%`
        canvasDom.value.style.width = `${ratio * 100 * 1.29 + 2.37}%`
      } else {
        videoBox.value.querySelector('.tcplayer').style.paddingTop = `${75}%`
        canvasDom.value.style.width = 100 + '%'
      }
      console.log('width', videoDom.value.getBoundingClientRect())
      //   canvasDom.value.style.width = videoDom.value.getBoundingClientRect().width + 'px'
      //   canvasDom.value.style.height = videoDom.value.getBoundingClientRect().height + 'px'
      if (frontScene) frontScene.resizeScene()
    }
    window.onresize = () => {
      resizeVideo()
      setTimeout(() => {
        resizeVideo()
      }, 300)
    }
    // const playLiveHandler = () => {
    //   liveData.isShowPlayBtn = false
    //   if (!tcPlayer) {
    //     const options = {
    //       webrtc: liveUrl,
    //       live: true,
    //       width: '640px',
    //       height: '480px',
    //       autoplay: true,
    //       x5_player: true,
    //       x5_type: 'h5-page',
    //       x5_fullscreen: true,
    //       x5_orientation: 0,
    //       controls: 'none',
    //       wording: {
    //         2032: '请求视频失败，请检查网络',
    //         2048: '请求文件失败，可能是网络错误或者跨域问题'
    //       },
    //       webrtcConfig: {
    //         connectRetryCount: 10
    //       },
    //       listener: function(msg) {
    //         if (msg.type === 'webrtcstatupdate') {
    //           if (videoDom === null) {
    //             videoDom = videoBox.value.querySelector('video')
    //             // videoDom = videoBox
    //             console.log(videoDom)
    //             // setTimeout(() => {
    //             //   hideLoadingTips()
    //             // }, 2000)
    //             // detectFrame(videoDom, modelNow);
    //           }
    //         }
    //       }
    //     }
    //     tcPlayer = new TcPlayer('live-player', options)
    //   } else {

    //   }
    // }

    const liveData = reactive({
      isShowPlayBtn: false,
      playLive: playLiveHandler
    })
    const refs = toRefs(liveData)
    return {
      ...refs,
      videoBox,
      videoDom,
      canvasDom
    }
  }
}
</script>
<style lang="less">
    .live-player-box {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
    }
    .live-player {
        position: absolute;
        // width: 100vh;
        // height: 100vw;
        width:100%;
        // height: 100%;
        margin: 0 auto;
        top: 50%;
        left: 50%;
        // transform-origin: left top;
        background: #000;
        overflow: hidden;
        transform: rotate(0deg) translate(-50%,-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        #live-video {
            // position: absolute;
            // top:50%;
            // left: 50%;
            // transform: translate(-50%,-50%);
            // width: 100vw;
            // height: 100vh;
            // width: 750px;
            width: 100%;
            max-width: 100%;
            height: 0;
            padding-top: 75%;
            // width: 100PX;
            // height: 100PX;
            // width: 100%;
            // max-width: 100%;
            // height: 0;
            // padding-top: 56.25%; /* 计算方式：播放器以16：9的比率显示，这里的值为 9/16 * 100 = 56.25  */
        }
    }
    .three-canvas-box {
         position: absolute;
        // width: 100vh;
        // height: 100vw;
        width:100%;
        // height: 100%;
        margin: 0 auto;
        top: 50%;
        left: 50%;
        // transform-origin: left top;

        overflow: hidden;
        transform: rotate(0deg) translate(-50%,-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        canvas {
            width: 100%;
            max-width: 100%;
            // height: 0;
            // padding-top: 75%;
            // width: 100PX;
            // height: 100PX;
            // background: #fff;
        }
    }
    .btn-play {
        // display: none;
        position: absolute;
        padding: 5px 10px;
        color: white;
        /* width: 80px;
        height: 40px; */
        background: grey;
        border-radius: 10px;
        font-size: 40px;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        white-space: nowrap;
    }
</style>
