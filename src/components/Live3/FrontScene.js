
import { TRIANGULATION } from '../../assets/triangulation'
export default class FrontScene {
  constructor(canvasDom) {
    this.canvasDom = canvasDom
    this.renderer = new THREE.WebGLRenderer({ canvas: canvasDom, alpha: true })
    this.renderer.setSize(canvasDom.width, canvasDom.height, false)
    // this.renderer.logarithmicDepthBuffer = true
    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color(0x1c1c1c)
    this.camera = new THREE.PerspectiveCamera(20, canvasDom.width / canvasDom.height, 0.1, 1000)
    this.camera.position.set(0, 0.5, 0)
    this.clock = new THREE.Clock()
    this.addLight()
    this.addModel()
    this.VerticalThreshold = -10
    this.prevScale = 0
  }
  addGeom() {
    const geometry = new THREE.BufferGeometry()
    geometry.setIndex(TRIANGULATION)
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionBufferData, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs.map((item, index) => index % 2 ? item : 1 - item), 2))
    geometry.computeVertexNormals()
    return geometry
  }
  addLight() {
    var light = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
    directionalLight.position.set(-1, 0, 0)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
    // hemiLight.position.set( 0, 20, 0 );
    this.scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.2)
    dirLight.position.set(0, 40, 0)
    this.scene.add(dirLight)
  }
  async addModel() {
    const loader = new THREE.GLTFLoader()
    await loader.load(require('../../assets/bear.glb'), (obj) => {
      this.scene.add(obj.scene)
      this.mixer = new THREE.AnimationMixer(obj.scene)
      this.cube = obj.scene
      this.cube.position.set(2, 0, 0)
      console.log(this.cube.rotation)
      // this.cube.rotation.set(0, -Math.PI / 2, 0)
      console.log('addModel', obj.scene)
      const pinshen = this.cube.getObjectByName('Sketchfab_model')
      const box = new THREE.Box3().setFromObject(pinshen)
      const size = box.getSize(new THREE.Vector3())
      this.cube.sizeX = size.x
      this.morphTarget = this.findMorphTarget(this.cube)
      console.log('mo', this.morphTarget)
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
    this.cube.position.set(worldVector.x.toFixed(4) * 1, worldVector.y.toFixed(4) * 1, worldVector.z.toFixed(4) * 1)
    console.log('wordld', this.cube.position)
    // this.cube.position.set(2, 2, 2)
    var vFOV = THREE.Math.degToRad(this.camera.fov)

    // console.log('dist',camera.position.z - worldVector.z);
    // console.log('height',  2 * Math.tan( vFOV / 2 ) * Math.abs(worldVector.x))
    // console.log(Math.abs(Math.tan(20 * (Math.PI/360)*0.5/canvasDom.height * 2)));
    return worldVector
  }
  scaleCube(w, h, x, y, keyPoint, faceRig) {
    if (!this.cube) return
    const scale2 = this.getScale(keyPoint, 234, 454)
    const rotation = this.getRotation(keyPoint, 10, 50, 280)
    this.cube.rotation.setFromRotationMatrix(rotation)
    // this.cube.rotation.x = this.cube.rotation.x + (-Math.PI / 2)
    const defX = this.cube.rotation.x
    this.cube.rotation.x = -this.cube.rotation.z.toFixed(3) * 1
    this.cube.rotation.y = this.cube.rotation.y.toFixed(3) * 1
    this.cube.rotation.z = -defX.toFixed(3) * 1
    this.cube.rotateY(Math.PI)
    this.cube.rotateZ(Math.PI)
    // console.log(rotation)
    const worldVector = this.convertCoodsToThree(x + w / 2, y + h / 2)
    console.log('z3333', keyPoint[8].z)
    // this.cube.position.set(keyPoint[8].x, keyPoint[8].y, keyPoint[8].z)
    const ratio = w / this.canvasDom.width
    const scale = worldVector.x * ratio * ((1 / this.cube.sizeX) * 0.8 + 0.01)
    console.log('12321', scale, scale2 / 18)
    // scale = worldVector.x * ratio *3.577;
    const a = 0
    this.cube.scale.set((scale + a) * 1.3, (scale + a) * 1.3, (scale + a) * 1.3)
    // this.cube.scale.setScalar(scale2 / 18)
    if (this.morphTarget) {
      this.morphTarget['leftEye'] && this.morphTarget['leftEye'](1 - faceRig.eye.r)
      this.morphTarget['rightEye'] && this.morphTarget['rightEye'](1 - faceRig.eye.l)
      this.morphTarget['mouth'] && this.morphTarget['mouth'](faceRig.mouth.shape.A)
    }
    // this.cube.scale.set(scale2)
    this.cube.visible = true
  }
  getScale(coords, id0 = 0, id1 = 1) {
    const v1 = new THREE.Vector3(coords[id0].x, coords[id0].y, coords[id0].z)
    const v2 = new THREE.Vector3(coords[id1].x, coords[id1].y, coords[id1].z)
    return v1.distanceTo(v2)
  }

  findMorphTarget(nodes) {
    const morphTarget = {}
    const traverse = (node) => {
      if (node.type === 'Mesh' && (node).morphTargetInfluences) {
        const mesh = node
        Object.keys(mesh.morphTargetDictionary).forEach(key => {
          morphTarget[key] = (value) => {
            mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]] = value
          }
        })
      }
      node.children.forEach(traverse)
    }
    traverse(nodes)
    return morphTarget
  }
  getRotation(coords, top = 0, left = 1, right = 2) {
    const p0 = new THREE.Vector3(coords[top].x, coords[top].y, coords[top].z)
    const p1 = new THREE.Vector3(coords[left].x, coords[left].y, coords[left].z)
    const p2 = new THREE.Vector3(coords[right].x, coords[right].y, coords[right].z)
    const matrix = new THREE.Matrix4()
    const x = p1.clone().sub(p2).normalize()
    const y = p1.clone().add(p2).multiplyScalar(0.5).sub(p0).multiplyScalar(-1).normalize()
    const z = new THREE.Vector3().crossVectors(x, y).normalize()
    console.log('xxx', x)
    // matrix.makeBasis(x, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))
    matrix.makeBasis(x, y, z)
    return matrix.invert()
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
    // requestAnimationFrame(this.render.bind(this))
    // cube.rotation.x += 0.01;
    this.renderer.render(this.scene, this.camera)
    // console.log('rendering')
  }
}
