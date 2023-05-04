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
import '@tensorflow/tfjs-core'
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/face_mesh'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
export default {
  name: 'LivePlayer',
  setup() {
    const videoBox = ref(null)
    const videoDom = ref(null)
    const canvasDom = ref(null)
    const liveUrl = 'webrtc://tliveplay.treedom.cn/carlive2/car'
    // const img = new Image()
    // img.src = `${process.env.BASE_URL}face.jpg`
    const count = 0
    const frontCanvas = document.createElement('canvas')
    // const modelstring = process.env.BASE_URL + 'model.json'
    // console.log(process.env)
    // const modelUrl = require(`${modelstring}`)
    // console.dir(modelUrl)
    let tcPlayer, frontScene, modelNow, detector
    let prevX = 0; let prevY = 0
    let prevW = 0; let prevH = 0
    // onMounted(() => {
    //   console.log('s', videoBox)
    // })
    function getFaceRig(prediction, video) {
      const faceRig = Kalidokit.Face.solve(coordsToXYZ(prediction), {
        runtime: 'tfjs', // `mediapipe` or `tfjs`
        video,
        imageSize: { height: 448, width: 800 },
        smoothBlink: true, // smooth left and right eye blink delays
        blinkSettings: [0.25, 0.75] // adjust upper and lower bound blink sensitivity
      })
      return faceRig
    }

    function coordsToXYZ(coords) {
      return coords.map(item => ({
        x: item.x,
        y: item.y,
        z: item.z
      }))
    }
    const startDetect = async() => {
      const ctx = frontCanvas.getContext('2d')
      const video = document.querySelector('#live-video_html5_api')
      // console.log(ctx)
      ctx.drawImage(video, 0, 0)
      const estimationConfig = { flipHorizontal: false, minDetectionConfidence: 0.1 }
      const faces = await detector.estimateFaces(frontCanvas, estimationConfig)
      // const detector
      console.log('faces', faces)
      // console.log(detector)
      if (faces.length > 0) {
        // if (Math.abs(x - prevX) <= 10 && Math.abs(y - prevY) <= 10) return
        let x = faces[0].box.xMin
        let y = faces[0].box.yMin
        let width = faces[0].box.width
        let height = faces[0].box.height
        console.log('x2w', Math.abs(x - prevX) <= 10)
        Math.abs(x - prevX) <= 10 ? x = prevX : prevX = x
        Math.abs(y - prevY) <= 10 ? y = prevY : prevY = y
        if (prevW !== 0 && Math.abs(width - prevW) <= 4) {
          width = prevW
        } else {
          prevW = width
        }
        if (prevH !== 0 && Math.abs(height - prevH) <= 4) {
          height = prevH
        } else {
          prevH = height
        }
        // Math.abs(width - prevW) <= 4 ? width = prevW : prevW = width
        // Math.abs(height - prevH) <= 4 ? height = prevH : prevH = height
        const faceRig = getFaceRig(faces[0].keypoints, frontCanvas)
        console.log('facerig', faceRig)
        if (frontScene) {
          frontScene.scaleCube(width, height, x, y, faces[0].keypoints, faceRig)
        }
      } else {
        if (frontScene && frontScene.cube) {
          frontScene.cube.visible = false
        }
      }
      if (frontScene && frontScene.cube) {
        frontScene.render()
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

    console.log(faceLandmarksDetection.SupportedModels)
    console.log(`${process.env.BASE_URL}face_landmarks/model.json`)
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
    console.log(model)
    const detectorConfig = {
      runtime: 'tfjs',
      detectorModelUrl: `${process.env.BASE_URL}blazeface/model.json`,
      landmarkModelUrl: `${process.env.BASE_URL}face_landmarks/model.json`
    };
    (async() => {
      // console.log('123', model)
      detector = await faceLandmarksDetection.createDetector(model, detectorConfig)
      // console.log(`${process.env.BASE_URL}face_landmarks/model.json`)
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
        // canvasDom.value.style.width = `${ratio * 100 * 1.29 + 2.37}%`
        canvasDom.value.style.width = `${ratio * 100 * 1.6 + 8.4}%`
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
