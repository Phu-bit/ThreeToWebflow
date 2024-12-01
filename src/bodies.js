/* eslint-disable */
import * as THREE from 'three'

const spacialCenter = new THREE.Vector3(0,0,0)

function getBody(RAPIER, world){
  const size = 1. + Math.random() * 0.1;
  const range = 10;
  const density = size * 0.039;

  let x = Math.random() * range - range * 0.5;
  let y = Math.random() * range - range * 0.5;
  let z = Math.random() * range - range * 0.5;
  
  //geometry
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size,1),
    new THREE.MeshStandardMaterial({
      color: 0x695dc9,
      flatShading: true
    })
  )
  mesh.position.set(x, y, z);

  //rigidbody
  let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);

  let rigid = world.createRigidBody(rigidBodyDesc);
  //collider
  let colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density);
  world.createCollider(colliderDesc,rigid);



  function update(){
    rigid.resetForces(true); 
    let { x, y, z } = rigid.translation();
    let pos = new THREE.Vector3(x, y, z);
    let dir = pos.clone().sub(spacialCenter).normalize();
    rigid.addForce(dir.multiplyScalar(-10), true);
    mesh.position.set(x, y, z);  }

  return {mesh, rigid, update};

}

function getMouseBall(RAPIER, world){
  
  //geometry
  const mouseSize = .5;
  const mouseLight = new THREE.PointLight(0xffffff,5);
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
  let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 3.0)
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

export {getBody, getMouseBall}