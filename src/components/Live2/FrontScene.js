
export default class FrontScene {
  constructor(canvasDom) {
    this.canvasDom = canvasDom
    this.renderer = new THREE.WebGLRenderer({ canvas: canvasDom, alpha: true })
    this.renderer.setSize(canvasDom.width, canvasDom.height, false)
    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color(0x1c1c1c)
    this.camera = new THREE.PerspectiveCamera(20, canvasDom.width / canvasDom.height, 0.1, 1000)
    this.camera.position.set(0, 0.5, 0)
    this.clock = new THREE.Clock()
    this.addLight()
    this.addModel()
    this.VerticalThreshold = -10
  }
  addLight() {
    var light = new THREE.AmbientLight(0xffffff, 0.65)
    this.scene.add(light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
    directionalLight.position.set(-1, 0, 0)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2)
    // hemiLight.position.set( 0, 20, 0 );
    this.scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff)
    dirLight.position.set(0, 20, 0)
    this.scene.add(dirLight)
  }
  async addModel() {
    const loader = new THREE.GLTFLoader()
    await loader.load(require('../../assets/lego.glb'), (obj) => {
      this.scene.add(obj.scene)
      this.mixer = new THREE.AnimationMixer(obj.scene)
      this.cube = obj.scene
      this.cube.position.set(2, 0, 0)
      console.log(this.cube.rotation)
      this.cube.rotation.set(0, -Math.PI / 2, 0)
      console.log('addModel', obj.scene)
      const pinshen = this.cube.getObjectByName('Sketchfab_model')
      const box = new THREE.Box3().setFromObject(pinshen)
      const size = box.getSize(new THREE.Vector3())
      this.cube.sizeX = size.x
      // const clip = obj.animations[0]
      // const action = this.mixer.clipAction(clip)
      // action.play()
      //   clip2
      this.cube.visible = false
      this.camera.lookAt(this.cube.position)
    })
  }
  convertCoodsToThree(px, py, pz = 0) {
    // px = 320;
    // py = 240;
    // console.log(canvasDom.getBoundingClientRect(), canvasDom.offsetWidth, canvasDom.offsetHeight);
    const x = (px / this.canvasDom.width) * 2 - 1
    const y = -(py / this.canvasDom.height) * 2 + 1
    // console.log(x,y)
    let worldVector = new THREE.Vector3()
    const stdCector = new THREE.Vector3(x, y, 0.5)
    // stdCector.unproject(camera);
    // stdCector.sub(camera.position.normalize());
    // var dis = (pz - camera.position.z) / stdCector.z;
    // worldVector.copy(camera.position).add(stdCector.multiplyScalar(dis))
    worldVector = stdCector.unproject(this.camera)
    // if (isRobot) worldVector.y = worldVector.y - 0.02
    this.cube.position.set(worldVector.x, worldVector.y, worldVector.z)
    // this.cube.position.set(2, 2, 2)
    var vFOV = THREE.Math.degToRad(this.camera.fov)

    // console.log('dist',camera.position.z - worldVector.z);
    // console.log('height',  2 * Math.tan( vFOV / 2 ) * Math.abs(worldVector.x))
    // console.log(Math.abs(Math.tan(20 * (Math.PI/360)*0.5/canvasDom.height * 2)));
    return worldVector
  }
  scaleCube(w, h, x, y, keyPoint) {
    if (!this.cube) return

    // 计算翻滚角
    const getRoll = (leftEyeX, leftEyeY, rightEyeX, rightEyeY) => {
      const dx = rightEyeX - leftEyeX
      const dy = rightEyeY - leftEyeY

      if (Math.abs(dx) < 0.0000001) {
        return 0
      } else {
        return Math.atan(dx / dy) * 180.0
      }
    }

    const getYaw = (noseX, faceX, faceWidth) => {
      const dx = noseX - faceX
      const rate = dx / (faceWidth * 0.5) - 1
      return Math.sin(rate) * 180 / 3.1415926
    }

    // 计算俯仰角
    const getPitch = (noseY, faceY, faceHigh) => {
      const dy = noseY - faceY
      const rate = dy / (faceHigh * 0.6) - 1
      return Math.sin(rate) * 180 / 3.1415926
    }
    // const getRotation = () => {
    //   const p0 = new THREE.Vector3(...coords[top])
    //   const p1 = new THREE.Vector3(...coords[left])
    //   const p2 = new THREE.Vector3(...coords[right])
    //   const matrix = new THREE.Matrix4()
    //   const x = p1.clone().sub(p2).normalize()
    //   const y = p1.clone().add(p2).multiplyScalar(0.5).sub(p0).multiplyScalar(-1).normalize()
    //   const z = new THREE.Vector3().crossVectors(x, y).normalize()
    //   matrix.makeBasis(x, y, z)
    //   return matrix.invert()
    // }
    // const roll = getRoll(keyPoint[1].x, keyPoint[1].y, keyPoint[0].x, keyPoint[0].y)
    // const yaw = getYaw(keyPoint[2].x, x, w)
    // const pitch = getPitch(keyPoint[2].y, y, h)
    const t = this.calculateVerticalDistance(keyPoint)
    const b = this.calculateEyeDistance(keyPoint)
    console.log(t, b)
    const yRadius = (b * 90 / 100 - 90) * 2

    this.cube.rotation.set(0, yRadius / 180 * Math.PI, 0)
    // this.cube.rotation.set(pitch / 100, -roll / 100, yaw / 100)
    const worldVector = this.convertCoodsToThree(x + w / 2, y + h / 2)
    const ratio = w / this.canvasDom.width
    const scale = worldVector.x * ratio * ((1 / this.cube.sizeX) * 0.46 + 0.01)
    console.log(scale)
    // scale = worldVector.x * ratio *3.577;
    const a = 0.00
    this.cube.scale.set((scale + a) * 2, (scale + a) * 2, (scale + a) * 2)
    this.cube.visible = true
  }
  calculateEyeDistance(pose) {
    const eyer = pose[0].x
    const eyel = pose[0].x
    const nose = pose[2].x
    const gapL = eyer - eyel
    const towardl = nose - eyel
    // const towardr = eyel - nose
    const towardsLeftnorm = towardl / gapL
    // const towardsRighttnorm = towardr / gapL

    let ModulusDistance = (towardsLeftnorm - 0.5) * 100
    if (ModulusDistance > 50) {
      ModulusDistance = 50
    } else if (ModulusDistance < -50) {
      ModulusDistance = -50
    }
    return ModulusDistance
  }
  calculateVerticalDistance = function(pose) {
    const earr = 100 * pose[4].y // right ear
    const nose = 100 * pose[2].y

    const difference = (earr - nose)
    const DellVerticalThreshold = (this.VerticalThreshold - difference)
    this.VerticalThreshold = (this.VerticalThreshold - DellVerticalThreshold * 0.001)
    if (this.VerticalThreshold > 10) {
      this.VerticalThreshold = 10
    } else if (this.VerticalThreshold < -20) {
      this.VerticalThreshold = -20
    }
    return this.VerticalThreshold
    // this.VerticalThreshold = clamp(this.VerticalThreshold, -20, 10)
  }
  resizeScene() {
    // console.log('resize')
    // if (innerWidth > innerHeight) {
    //   this.camera.aspect = this.canvasDom.height / this.canvasDom.width
    //   this.camera.updateProjectionMatrix()
    // //   this.renderer.setSize(this.canvasDom.height, this.canvasDom.width, false)
    // } else {
    //   this.camera.aspect = this.canvasDom.width / this.canvasDom.height
    //   this.camera.updateProjectionMatrix()
    // //   this.renderer.setSize(this.canvasDom.width, this.canvasDom.height, false)
    // }
  }
  render() {
    const dt = this.clock.getDelta()
    if (this.mixer) this.mixer.update(dt)
    requestAnimationFrame(this.render.bind(this))
    // cube.rotation.x += 0.01;
    this.renderer.render(this.scene, this.camera)
    // console.log('rendering')
  }
}
