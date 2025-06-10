import "./style.css"

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from "gsap";

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas")
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

let character = {
    instance: null,
    moveDistance: 5,
    jumpHeight: 1,
    isMoving: false,
    moveDuration: 0.2,
}

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.AgXToneMapping
renderer.toneMappingExposure = 5

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.castShadow = true
sun.position.set(50,75,0)
sun.shadow.camera.left = -170
sun.shadow.camera.right = 170
sun.shadow.camera.top = 100
sun.shadow.camera.bottom = -200
sun.shadow.normalBias = 1
scene.add( sun );

// const shadowHelper = new THREE.CameraHelper( sun.shadow.camera )
// scene.add(shadowHelper)
// const helper = new THREE.DirectionalLightHelper( sun, 5 );
// scene.add( helper );

const light = new THREE.AmbientLight(0x404040, 3)
scene.add( light )

const aspect = sizes.width / sizes.height

const camera = new THREE.OrthographicCamera( 
    -aspect * 50, 
    aspect * 50, 
    50, 
    -50, 1, 1000 );

const controls = new OrbitControls( camera, renderer.domElement );

const loader = new GLTFLoader();

loader.load( '../public/Portfolio.glb', function ( glb ) {
    glb.scene.traverse((child) => {
        if(child.isMesh){
            child.castShadow = true
            child.receiveShadow = true
        }

        // console.log(child.name)

        if (child.name === "Character_1"){
            character.instance = child
        }
    })
    scene.add( glb.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

camera.zoom = 2.46
camera.position.x = 63;
camera.position.y = 42;
camera.position.z = 150;

function handleResize(){
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    const aspect = sizes.width / sizes.height

    camera.left = -aspect * 50
    camera.right = aspect * 50
    camera.top = 50
    camera.bottom = -50

    camera.updateProjectionMatrix()

    renderer.setSize( sizes.width, sizes.height )
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function moveCharacter(targetPosition, targetRotation){
    character.isMoving = true

    const t1 = gsap.timeline({
        onComplete: () => {
            character.isMoving = false
        }
    })

    t1.to(character.instance.position, {
        x: targetPosition.x,
        z: targetPosition.z,
        duration: character.moveDuration
    })

    t1.to(character.instance.rotation, {
        y: targetRotation,
        duration: character.moveDuration
    }, 0)

    t1.to(character.instance.position, {
        y: character.instance.position.y + character.jumpHeight,
        duration: character.moveDuration / 2,
        yoyo: true,
        repeat: 1,
    }, 0)
}

function onkeydown(event) {
    if (character.isMoving) return

    const targetPosition = new THREE.Vector3().copy(character.instance.position)
    let targetRotation = 0

    switch(event.key.toLowerCase()){
        case "w":
        case "arrowup":
            targetPosition.z -= character.moveDistance
            targetRotation = Math.PI/2
            break
        case "s":
        case "arrowdown":
            targetPosition.z += character.moveDistance
            targetRotation = -Math.PI/2
            break
        case "a":
        case "arrowleft":
            targetPosition.x -= character.moveDistance
            targetRotation = Math.PI
            break
        case "d":
        case "arrowright":
            targetPosition.x += character.moveDistance
            targetRotation = 0
            break
        default:
            return
    }
    moveCharacter(targetPosition, targetRotation)
}

window.addEventListener("resize", handleResize)
window.addEventListener("keydown", onkeydown)

function animate() {
    // console.log(camera.position)
    // console.log(camera.zoom)
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );