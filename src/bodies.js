/* eslint-disable */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const spacialCenter = new THREE.Vector3(0,0,0)
const gltfLoader = new GLTFLoader()
let bottleMesh, bottleBody, cylinderCollider

function loadModel() {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      'https://cdn.prod.website-files.com/67297b2f70f000c5845e68d7/674d3bfa1d4d5d0049de14d3_lowpolybottle.glb.txt',
      (gltf) => {
        const bottle = gltf.scene;
        bottleMesh = bottle.getObjectByName('bottle'); // Extract the bottle mesh
        if (bottleMesh) {
          resolve(bottleMesh);
        } else {
          reject(new Error('Bottle mesh not found in GLTF file.'));
        }
      },
      undefined,
      (error) => reject(error)
    );
  });
}


function RapierDebugRenderer(RAPIER, world, enabled){

  let mesh = new THREE.LineSegments(
    new THREE.BufferGeometry(), 
    new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true }))
  mesh.frustumCulled = false;
  

  function update(enabled){
    if (enabled) {
      const {vertices, colors} = world.debugRender();
      mesh.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
      mesh.visible = true
      
    }
    else {
      mesh.visible = false
    }
  }

  return {mesh, update};
  
}

function getBody(RAPIER, world, scene){
  const size = 1. + Math.random() * 0.1;
  const range = 10;
  const density = size * 0.01;

  let x = Math.random() * range - range * 0.5;
  let y = Math.random() * range - range * 0.5;
  let z = Math.random() * range - range * 0.5;
  
  // geometry
  // const mesh = new THREE.Mesh(
  //   new THREE.IcosahedronGeometry(size,1),
  //   new THREE.MeshStandardMaterial({
  //     color: 0x695dc9,
  //     flatShading: true
  //   })
  // )
  // mesh.position.set(x, y, z);
  // scene.add(mesh);

  //bottle
  let mesh;
  if (bottleMesh) {
    mesh = bottleMesh.clone(); // Clone the preloaded mesh
    // mesh.scale.set(size, size, size); // Adjust size if necessary
    mesh.position.set(x, y, z);
    scene.add(mesh); // Add to the scene
  } else {
    console.error('Bottle mesh is not loaded yet.');
    return null; // Return early if the bottle mesh isn't ready
  }
  
  //rigidbody
  let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
  let rigid = world.createRigidBody(rigidBodyDesc);
  //collider
  // let colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density); // Ball collider
  let colliderDesc = RAPIER.ColliderDesc.cylinder(2, 1).setDensity(density).setRestitution(0.5); // Cylinder collider
  world.createCollider(colliderDesc,rigid);

  function update() {
    // Reset forces to prevent drift
    rigid.resetForces(true);

    // Update position
    const { x, y, z } = rigid.translation();
    mesh.position.set(x, y, z);

    // Update rotation
    const rotation = rigid.rotation(); // Get the rotation quaternion
    mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

    // Apply additional forces if needed
    const pos = new THREE.Vector3(x, y, z);
    const dir = pos.clone().sub(spacialCenter).normalize();
    rigid.addForce(dir.multiplyScalar(-7), true);
  }

  return {mesh, rigid, update};

}

function getMouseBall(RAPIER, world){
  
  //geometry
  const mouseSize = .5;
  const mouseLight = new THREE.PointLight(0xffffff,10,25,1);
  const mouseMesh = new THREE.Mesh(  
    new THREE.IcosahedronGeometry(mouseSize, 8),
    new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffffff }),
  )
  mouseMesh.add(mouseLight)

  //rigidbody
  let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0,0,0)
  let mouseRigid = world.createRigidBody(bodyDesc)
  //collider
  let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 10.0).setRestitution(1.0)
  world.createCollider(dynamicCollider, mouseRigid);

  //update mouseball
  function update(mousePos,camera) {
    // Convert mouse position to world space
    const ndc = new THREE.Vector3(mousePos.x, mousePos.y, .978); // z = 0.5 (depth)
    ndc.unproject(camera); // Transform to world space

    // Set the translation of the rigid body
    mouseRigid.setTranslation({ x: ndc.x, y: ndc.y, z: ndc.z });
    const { x, y, z } = mouseRigid.translation();
    mouseMesh.position.set(x, y, z);
    
  }

  return { mesh:mouseMesh, update };

}

export {getBody, getMouseBall, RapierDebugRenderer, loadModel}