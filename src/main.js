/* eslint-disable */

import gsap from 'gsap'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import './styles/style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RapierPhysics } from 'three/examples/jsm/physics/RapierPhysics.js'

console.log(RapierPhysics);


THREE.ColorManagement.enabled = false;


/* Variables */
const gltfLoader = new GLTFLoader()

let scene, camera, renderer, controls, canvas
let physics
let waterBottle;
let clock = new THREE.Clock()
let previousTime = 0;

const ballGeo = new THREE.IcosahedronGeometry(1,1)
const ballMat = new THREE.MeshStandardMaterial({color: 0xffffff})



/* Parameters */

const lights = {

}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};


const parameters = {
  test : 'Test',
  controls: {
    enabled: false
  }
}

/* Physics */
async function physicsSetup(){

  physics = await RapierPhysics();
  
  physics.addScene(scene);


}

/* Init */

async function init() {
  addEventListeners()
  initGUI()
  initScene()
  initCamera()
  initRenderer()
  initControls()
  addLights()
  loadModel()  

  createGeometry()
  await physicsSetup()



  animate()


}

/* Main Functions */

init()


/* Utils */


function preloadAssets() {
  // Load assets here
}
function initScene() {
  canvas = document.querySelector('canvas.webgl');
  scene = new THREE.Scene();

}

function initControls() {
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enabled = parameters.controls.enabled;

}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({
      canvas: canvas, // canvas is already selected in initScene()
      alpha: true,
  });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 4, 7)
  camera.lookAt(new THREE.Vector3(0,0,0))
}

function initGUI() {
  const gui = new dat.GUI()
  gui.add(parameters, 'test').name('Test')
  gui.add(parameters.controls, 'enabled').name('Controls').onChange(() => {
    controls.enabled = parameters.controls.enabled
  })
}

function addLights(){

  lights.ambientlight = new THREE.AmbientLight(0xffffff, 1)
  lights.pointLight = new THREE.PointLight(0xffffff, 20, 10)
  lights.pointLight.position.set(1, 1, 3)
  scene.add(lights.ambientlight, lights.pointLight)
}

/* Event Listeners */
function addEventListeners(){
  window.addEventListener('resize', onResize);
}

function onResize(){

  window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
    
        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    
        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            
    })
}

/* Load Model */

function loadModel(){
  gltfLoader.load(
    'https://cdn.prod.website-files.com/67297b2f70f000c5845e68d7/673bf5a425533c6e03d285cf_Earth_in_a_Bottle_1119020232.glb.txt',
    (gltf) => {
      waterBottle = gltf.scene
      waterBottle.scale.set(3,3,3)
      waterBottle.position.set(0,-0.25,0)
      
      // scene.add(waterBottle)
    }
  )
}


/* Create Geometry */
function createGeometry() {

  /* Floor */

  const floorBox = new THREE.Mesh(
    new THREE.BoxGeometry(20,.1,20),
    new THREE.MeshStandardMaterial({color: 0x6e6e6e})
  )

  floorBox.position.set(0,-3.5,0)
  floorBox.rotation.set(Math.PI,Math.PI/2 * 0.5, 0)
  floorBox.userData.physics = { mass: 0 }
  scene.add(floorBox)
  
  /* Test Physics Ball */

  //TODO
    // get rid of floor
    // make balls attracted to center
    // give mouse collider 
    // make sure balls don't explode everywhere on spawn
    // figure out why its taking so long to load
    // replace balls with plastic water bottle model


  for (let i = 0; i < 10; i++) {
    const ball = new THREE.Mesh(ballGeo, ballMat)

    ball.position.set(i ,4,i)
  
    ball.userData.physics = { mass: 1 }
  
    scene.add(ball)
      
  }


}


/* Animation */

function animate() {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  
  if (waterBottle) {
    // Add any animation for the loaded model here
    waterBottle.rotation.y += 0.001
    lights.pointLight.position.x = Math.sin(elapsedTime) * 3
    lights.pointLight.position.z = Math.cos(elapsedTime) * 3

  }
  // mesh.rotation.z = mesh.rotation.z + 0.01
  // mesh.rotation.x = mesh.rotation.x + 0.01

  controls.update()

  renderer.render(scene, camera)
  window.requestAnimationFrame(animate)

}