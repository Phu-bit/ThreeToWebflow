/* eslint-disable */

import gsap from 'gsap'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import './styles/style.css'
import { getBody, getMouseBall,RapierDebugRenderer, loadModel } from './bodies.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import RAPIER from '@dimforge/rapier3d-compat'



//TODO
  // create loading scene
  //create info section,
  //start creating game. !!

THREE.ColorManagement.enabled = false;


/* Variables */
// const gltfLoader = new GLTFLoader()

let scene, camera, renderer, controls, canvas
let gravity, world, mouseball, rapierDebug
let mousePos = new THREE.Vector2()
let waterBottle;
let clock = new THREE.Clock()
let previousTime = 0;

const ballGeo = new THREE.IcosahedronGeometry(1,1)
const ballMat = new THREE.MeshStandardMaterial({color: 0xffffff})
const numBodies = 100;
const spawnDuration = 5; 
const bodies = []


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
  },
  physics: {
    enabled: false
  },
}

/* Physics */
async function physicsSetup(){

  await RAPIER.init() 
  gravity = new RAPIER.Vector3(0.0, -9.81, 0.0)
  world = new RAPIER.World(gravity)
  
  await loadModel()
  //bodies
  for (let i = 0; i < 30; i++) {
    const body = getBody(RAPIER, world, scene);
    bodies.push(body)
    // console.log(body.mesh.position);
    
    // scene.add(body.mesh)
  }

  //mouseball
  mouseball = getMouseBall(RAPIER, world);
  scene.add(mouseball.mesh)
  
  //debug
  parameters.enabled = true; 
  rapierDebug = RapierDebugRenderer(RAPIER, world);
  scene.add(rapierDebug.mesh)
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
  // loadModel()  
  await physicsSetup()

  createGeometry()
    
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
  // scene.background = new THREE.Color(0x267544)

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
  camera.position.set(0, 0, 12)
  camera.lookAt(new THREE.Vector3(0,0,0))
}

function initGUI() {
  const gui = new dat.GUI()
  gui.add(parameters, 'test').name('Test')
  gui.add(parameters.controls, 'enabled').name('Controls').onChange(() => {
    controls.enabled = parameters.controls.enabled
  })
  gui.add(parameters.physics, 'enabled').name('Physics Debug').onChange(() => {
    controls.enabled = parameters.physics.enabled
  })
}

function addLights(){

  lights.ambientlight = new THREE.AmbientLight(0xffffff, 1)
  // lights.pointLight = new THREE.PointLight(0xffffff, 20, 10)
  // lights.pointLight.position.set(1, 1, 3)
  scene.add(lights.ambientlight)
}

/* Event Listeners */
function addEventListeners(){
  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onTouchMove); 
}

function onTouchMove(event){
  if (event.touches.length > 0) {
    const touch = event.touches[0]
    mousePos.x = (event.touches.clientX / sizes.width) * 2 - 1
    mousePos.y = -(event.touches.clientY / sizes.height) * 2 + 1
  }
}

function onMouseMove(event){
  mousePos.x = (event.clientX / sizes.width) * 2 - 1
  mousePos.y = -(event.clientY / sizes.height) * 2 + 1
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

// function loadModel(){
//   gltfLoader.load(
//     'https://cdn.prod.website-files.com/67297b2f70f000c5845e68d7/673bf5a425533c6e03d285cf_Earth_in_a_Bottle_1119020232.glb.txt',
//     (gltf) => {
//       waterBottle = gltf.scene
//       waterBottle.scale.set(3,3,3)
//       waterBottle.position.set(0,-0.25,0)
      
//       // scene.add(waterBottle)
//     }
//   )
// }


/* Create Geometry */
function createGeometry() {

  /* Floor */

  // const floorBox = new THREE.Mesh(
  //   new THREE.BoxGeometry(20,.1,20),
  //   new THREE.MeshStandardMaterial({color: 0x6e6e6e})
  // )

  // floorBox.position.set(0,-3.5,0)
  // floorBox.rotation.set(Math.PI,Math.PI/2 * 0.5, 0)
  // scene.add(floorBox)
  

}


/* Animation */

function animate() {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Update physics
  world.step();
  // console.log(mouseball.mesh.position);

  mouseball.update(mousePos,camera)
  bodies.forEach(b => b.update())
  rapierDebug.update(parameters.physics.enabled)

  controls.update()

  renderer.render(scene, camera)
  window.requestAnimationFrame(animate)

}