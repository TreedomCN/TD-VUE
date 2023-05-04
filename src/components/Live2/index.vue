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
    const img = new Image()
    img.src = `${process.env.BASE_URL}face.jpg`
    const frontCanvas = document.createElement('canvas')
    // const modelstring = process.env.BASE_URL + 'model.json'
    // console.log(process.env)
    // const modelUrl = require(`${modelstring}`)
    // console.dir(modelUrl)
    let tcPlayer, frontScene, modelNow, detector
    let prevX = 0; let prevY = 0
    // onMounted(() => {
    //   console.log('s', videoBox)
    // })
    const startDetect = async() => {
      const ctx = frontCanvas.getContext('2d')
      const video = document.querySelector('#live-video_html5_api')
      // console.log(ctx)
      ctx.drawImage(video, 0, 0)
      const estimationConfig = { flipHorizontal: false }
      const faces = await detector.estimateFaces(frontCanvas, estimationConfig)
      // const detector
      console.log('faces', faces)
      console.log(detector)
      if (faces.length > 0) {
        if (Math.abs(x - prevX) <= 10 && Math.abs(y - prevY) <= 10) return
        const x = faces[0].box.xMin
        prevX = x
        const y = faces[0].box.yMin
        prevY = y
        const width = faces[0].box.width
        const height = faces[0].box.height
        if (frontScene) {
          frontScene.scaleCube(width, height, x, y, faces[0].keypoints)
        }
      } else {
        if (frontScene && frontScene.cube) {
          frontScene.cube.visible = false
        }
      }
      // console.log(valid_detections.dataSync())
      // ctx.clearRect(0, 0, 750, 1600)
      // if (valid_detections === undefined || valid_detections_data < 1) {
      //   if (frontScene && frontScene.cube) {
      //     frontScene.cube.visible = false
      //   }
      //   return
      // } else {
      //   console.log(boxes_data)
      //   console.log(scores_data)
      //   console.log(classes_data)
      //   console.log(valid_detections_data)
      //   // console.log(res)
      //   // if (frontScene) {
      //   //   frontScene.scaleCube(width, height, x, y)
      //   // }
      // }
      // tf.dispose(res)
      // input.dispose()
      // })
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
          console.log(tcPlayer)
          if (frontScene && tcPlayer.videoWidth() !== 0 && canvasDom.value.width !== 0) return
          console.log(tcPlayer.videoWidth())
          canvasDom.value.width = tcPlayer.videoWidth()
          canvasDom.value.height = tcPlayer.videoHeight()
          frontCanvas.width = tcPlayer.videoWidth()
          frontCanvas.height = tcPlayer.videoHeight()
          resizeVideo()
          //   canvasDom.value.style.width = videoDom.value.getBoundingClientRect().width + 'px'
          //   canvasDom.value.style.height = videoDom.value.getBoundingClientRect().height + 'px'
          //   frontScene = 1
          frontScene = new FrontScene(canvasDom.value)
          frontScene.render()
          // startDetect()
          //   if (event.data.code === 1001) {
        //   console.log('videoWidth', videoBox.value.querySelector('.tcplayer video').getBoundingClientRect())
        //   console.log('videoHeight')
        //   }
        })
        tcPlayer.on('loadeddata', () => {
          console.log('123123123')
          setTimeout(() => {
            startDetect()
          }, 2000)
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
    // tf.loadGraphModel(`${process.env.BASE_URL}model.json`).then(model => {
    //   modelNow = model
    //   Toast.clear()
    //   liveData.isShowPlayBtn = true
    // })
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector
    const detectorConfig = {
      runtime: 'tfjs',
      detectorModelUrl: `${process.env.BASE_URL}model.json`
    };
    (async() => {
      detector = await faceDetection.createDetector(model, detectorConfig)
      modelNow = model
      // loadingTips.classList.remove('full');
      Toast.clear()
      liveData.isShowPlayBtn = true
    })()
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
