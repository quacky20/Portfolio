import "./style.css"

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from "gsap";
import { Octree } from "three/addons/math/Octree.js"
import { Capsule } from "three/addons/math/Capsule.js"

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas")
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// PHYSICS
let GRAVITY = 30
const CAPSULE_RADIUS = 0.35
const CAPSULE_HEIGHT = 1
let JUMP_HEIGHT = 15
let MOVE_SPEED = 8

let character = {
    instance: null,
    isMoving: false,
    spawnPoint: new THREE.Vector3(),
}

const colliderOctree = new Octree()
const playerCollider = new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
    CAPSULE_RADIUS
)

let targetRotation = - Math.PI / 2
let playerVelocity = new THREE.Vector3
let playerOnFloor = false

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.AgXToneMapping
renderer.toneMappingExposure = 5

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.castShadow = true
sun.position.set(25,75,50)
sun.shadow.mapSize.width = 2048
sun.shadow.mapSize.height = 2048
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
// const controls = new OrbitControls( camera, renderer.domElement );

const modalContent = {
    "Project_1":{
        title: "Moodify – Your Mood, Your Music",
        content: "Moodify is a sleek AI-powered web app that personalizes your Spotify experience based on your mood. Built with React, Tailwind, and Flask, it offers mood-based music recommendations, real-time lyrics via Genius, playlist management, and a modern dark-themed UI. Powered by LLMs and the Spotify API, Moodify blends smart suggestions with a beautiful, responsive design.",
        linkText: "Visit Moodify on GitHub",
        link: "https://github.com/quacky20/moodify"
    },
    "Project_2":{
        title: "AirDraw. – Paint with Your Hands",
        content: "AirDraw is a creative virtual painting app that lets you draw in real-time using hand gestures. Built with Python, OpenCV, and Mediapipe, it features multiple brush sizes, color options, an eraser, and an intuitive help menu — all without touching a mouse or stylus.",
        linkText: "Visit AirDraw on GitHub",
        link: "https://github.com/quacky20/AirDraw"

    },
    "Project_3":{
        title: "Project 3",
        content: "To be added!",
        linkText: "Will add later!",
        link: "#"

    },
    "Project_4":{
        title: "Project 4",
        content: "To be added!",
        linkText: "Will add later!",
        link: "#"

    },
    "Project_5":{
        title: "Visit all my projects",
        content: "I love building creative, user-focused applications that blend AI, interactivity, and thoughtful design. From full-stack web apps and ML-powered tools to computer vision projects and agentic AI systems, my work reflects a passion for learning and innovation.",
        linkText: "Check out my projects on GitHub.",
        link: "https://github.com/quacky20"
    },
    "Skill_5":{
        title: "Skills",
        linkText: "Visit",
        content: "All skills"

    },
    "Character_2":{
        title: "You are SO annoying!"
    },
    "Instagram":{
        title: "Instagram",
        linkText: "Visit my Instagram",
        link: "https://instagram.com"
    },
    "Youtube":{
        title: "Youtube",
        linkText: "Check out my channel",
        link: "https://youtube.com"
    },
}

const modal = document.querySelector("#modal")
const modalTitle = document.querySelector("#modal-title")
const modalDescription = document.querySelector("#modal-project-description")
const modalExitButton = document.querySelector("#modal-exit-button")
const modalVisitButton = document.querySelector("#modal-visit-button")

function showModal(id){
    const content = modalContent[id]
    if (content){
        modalTitle.textContent = content.title
        modalDescription.textContent = content.content
        // modal.classList.toggle("hidden")
        modal.classList.remove("opacity-0", "invisible", "pointer-events-none");
        modal.classList.add("opacity-100", "visible", "pointer-events-auto");
        if (content.link){
            modalVisitButton.href = content.link
            modalVisitButton.classList.remove('hidden')
            if (content.linkText){
                modalVisitButton.textContent = content.linkText
            }
        }
        else{
            modalVisitButton.classList.add('hidden')
        }
    }
}

function hideModal(){
    // modal.classList.toggle("hidden")
    modal.classList.remove("opacity-100", "visible", "pointer-events-auto");
    modal.classList.add("opacity-0", "invisible", "pointer-events-none");
}

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

let showKeypad = false

function showKeys(){
    mobileControls.classList.remove('sm:hidden')
    mobileControls.classList.add('sm:block')
    showKeypad = true
}

function hideKeys(){
    mobileControls.classList.remove('sm:block')
    mobileControls.classList.add('sm:hidden')
    showKeypad = false
}

document.getElementById('toggle').addEventListener('change', (e) => {
    if (!showKeypad){
        showKeys()
    }
    else if (showKeypad){
        hideKeys()
    }
})

const jumpDist = document.getElementById('jump-dist')
const jumpDistVal = document.getElementById('jump-dist-val')
jumpDistVal.textContent = MOVE_SPEED
const jumpHeight = document.getElementById('jump-height')
const jumpHeightVal = document.getElementById('jump-height-val')
jumpHeightVal.textContent = JUMP_HEIGHT
const grav = document.getElementById('gravity')
const gravVal = document.getElementById('gravity-val')
gravVal.textContent = GRAVITY

const restoreBtn = document.getElementById('restore-btn')

restoreBtn.addEventListener("click", () => {
    MOVE_SPEED = 8
    JUMP_HEIGHT = 15
    GRAVITY = 30
    jumpDistVal.textContent = MOVE_SPEED
    jumpHeightVal.textContent = JUMP_HEIGHT
    gravVal.textContent = GRAVITY
    jumpDist.value = MOVE_SPEED
    jumpHeight.value = JUMP_HEIGHT
    grav.value = GRAVITY
    if (showKeypad){
        hideKeys()
    }
    document.getElementById('toggle').checked = false
})

jumpDist.addEventListener("input", () => {
    MOVE_SPEED = jumpDist.value
    // console.log(MOVE_SPEED)
    jumpDistVal.textContent = MOVE_SPEED
})

jumpHeight.addEventListener("input", () => {
    JUMP_HEIGHT = jumpHeight.value
    jumpHeightVal.textContent = JUMP_HEIGHT
})

grav.addEventListener("input", () => {
    GRAVITY = grav.value
    gravVal.textContent = GRAVITY
})

const respawnBtn = document.getElementById('respawn-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const helpBtn = document.getElementById('help-btn')
const settingsBtn = document.getElementById('settings-btn')
const instructionsPanel = document.getElementById('instruction-panel')
const settingsPanel = document.getElementById('settings-panel')

let showInstructions = false
let showSettings = false
let showEmail = false

helpBtn.addEventListener('click', (e) => {
    if (!showInstructions){
        if (showSettings){
            settingsPanel.classList.remove("opacity-100", "visible", "pointer-events-auto");
            settingsPanel.classList.add("opacity-0", "invisible", "pointer-events-none");
            showSettings = false
        }
        if(showEmail){
            emailModal.classList.remove("opacity-100", "visible", "pointer-events-auto");
            emailModal.classList.add("opacity-0", "invisible", "pointer-events-none");
        }
        instructionsPanel.classList.remove("opacity-0", "invisible", "pointer-events-none");
        instructionsPanel.classList.add("opacity-100", "visible", "pointer-events-auto");
        showInstructions = true
    }
    else{
        instructionsPanel.classList.remove("opacity-100", "visible", "pointer-events-auto");
        instructionsPanel.classList.add("opacity-0", "invisible", "pointer-events-none");
        showInstructions = false
    }
    
});

settingsBtn.addEventListener('click', (e) => {
    if (!showSettings){
        if (showInstructions){
            instructionsPanel.classList.remove("opacity-100", "visible", "pointer-events-auto");
            instructionsPanel.classList.add("opacity-0", "invisible", "pointer-events-none");
            showInstructions = false
        }
        if(showEmail){
            emailModal.classList.remove("opacity-100", "visible", "pointer-events-auto");
            emailModal.classList.add("opacity-0", "invisible", "pointer-events-none");
        }
        settingsPanel.classList.remove("opacity-0", "invisible", "pointer-events-none");
        settingsPanel.classList.add("opacity-100", "visible", "pointer-events-auto");
        showSettings = true
    }
    else{
        settingsPanel.classList.remove("opacity-100", "visible", "pointer-events-auto");
        settingsPanel.classList.add("opacity-0", "invisible", "pointer-events-none");
        showSettings = false
    }
});

respawnBtn.addEventListener('click', (e) => {
    respawnCharacter()
})

fullscreenBtn.addEventListener('click', (e) => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen failed:', err)
        })
        fullscreenBtn.textContent = '🗗 Exit Fullscreen'
    }
    else{
        document.exitFullscreen().catch(err => {
            console.log('Exit Fullscreen failed:', err)
        })
        fullscreenBtn.textContent = '⛶ Fullscreen'
    }
})

const DISCORD_USERNAME = "quacky_._"
const EMAILID = "armaneo2000@gmail.com"

const discordBtn = document.getElementById('discord-btn')
const emailBtn = document.getElementById('email-btn')
const emailModal = document.getElementById('email-modal')

discordBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(DISCORD_USERNAME).then(() => {
        const notification = document.createElement('div')
        notification.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all'
        notification.innerHTML = `
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                        Discord username copied: <strong>${DISCORD_USERNAME}</strong>
                    </div>
                `
        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.opacity = '0'
            notification.style.transform  = 'translate(0%, -100%)'
            setTimeout(() => {
                notification.remove()
            }, 300);
        }, 3000);
    }).catch(() => {
        alert(`Add me on Discord: ${DISCORD_USERNAME}`)
    })
})

function openEmailModal(){
    if (showSettings){
            settingsPanel.classList.remove("opacity-100", "visible", "pointer-events-auto");
            settingsPanel.classList.add("opacity-0", "invisible", "pointer-events-none");
            showSettings = false
        }
    if (showInstructions){
            instructionsPanel.classList.remove("opacity-100", "visible", "pointer-events-auto");
            instructionsPanel.classList.add("opacity-0", "invisible", "pointer-events-none");
            showInstructions = false
        }
    emailModal.classList.remove("opacity-0", "invisible", "pointer-events-none");
    emailModal.classList.add("opacity-100", "visible", "pointer-events-auto");
    document.getElementById('emailToCopy').textContent = EMAILID;
    showEmail = true
}

function closeEmailModal(){
    emailModal.classList.remove("opacity-100", "visible", "pointer-events-auto");
    emailModal.classList.add("opacity-0", "invisible", "pointer-events-none");
    showEmail = false
}

const closeEmailBtn = document.getElementById('emailModalCloseButton')
closeEmailBtn.addEventListener('click', closeEmailModal)

emailBtn.addEventListener('click', openEmailModal)

emailModal.addEventListener('click', (e) => {
    if (e.target === this) {
        closeEmailModal()
    }
})

function openDirectEmail() {
    const subject = 'Hello from your portfolio!'
    const body = 'Hi there!\n\nI found your portfolio and wanted to get in touch.\n\nBest regards,\n[Your name here]'
    const mailtoUrl = `mailto:${EMAILID}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
}

document.getElementById('copyButton').addEventListener('click', (e) => {
    navigator.clipboard.writeText(EMAILID).then(() => {
        const button = e.target
        const originalText = button.textContent
        button.textContent = 'Copied!'
        button.className = button.className.replace('text-white', 'text-gray-200');

        setTimeout(() => {
            button.textContent = originalText
            button.className = button.className.replace('text-gray-200', 'text-white')
        }, 2000);
    }).catch((error) => {
        console.log(error)
        alert('Could not copy email. Please select and copy manually.')
    })
})

document.getElementById('direct-email').addEventListener('click', openDirectEmail)

let intersectObject = ""
const intersectObjects = []
const intersectObjectsNames = [
    "Project_1",
    "Project_2",
    "Project_3",
    "Project_4",
    "Project_5",
    "Skill_5",
    "Dog",
    "Character_2",
    "Instagram",
    "Youtube"
]

const loadingManager = new THREE.LoadingManager()

const progressBar = document.getElementById('progress-bar')
const loadingScreen = document.getElementById('loading-screen')

loadingManager.onProgress = function(url, loaded, total){
    progressBar.value = (loaded / total) * 100
}

loadingManager.onLoad = function(){
    setTimeout(() => {
        loadingScreen.classList.remove("opacity-100", "visible", "pointer-events-auto");
        loadingScreen.classList.add("opacity-0", "invisible", "pointer-events-none");
    }, 1000);
}

const loader = new GLTFLoader(loadingManager);

loader.load( 'Portfolio7.glb', function ( glb ) {
    glb.scene.traverse((child) => {
        if(intersectObjectsNames.includes(child.name)){
            intersectObjects.push(child)
        }

        if(child.isMesh){
            child.castShadow = true
            child.receiveShadow = true
        }

        // console.log(child.name)
        // if (child.type === "Group") {
        //     console.log("Group:", child.name);
        // }

        if (child.name === "Character_1"){
            character.spawnPoint.copy(child.position)
            character.instance = child
            playerCollider.start.copy(child.position).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0))
            playerCollider.end.copy(child.position).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0))
        }
        if (child.name === "Collider"){
            colliderOctree.fromGraphNode(child)
            child.visible = false
        }
    })
    scene.add( glb.scene );
    // console.log(glb.scene)

}, undefined, function ( error ) {

  console.error( error );

} );

camera.zoom = 2.3   
camera.position.x = 63;
camera.position.y = 90;
camera.position.z = 150;
camera.updateProjectionMatrix()

const cameraOffset = new THREE.Vector3(63, 90, 150)

function onPointerMove( event ) {
	let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
        // Touch screen
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        // Mouse or pointer device
        clientX = event.clientX;
        clientY = event.clientY;
    }

    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;

    // console.log("Pointer NDC:", pointer.x.toFixed(2), pointer.y.toFixed(2));
}

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

function playerCollisions(){
    const result = colliderOctree.capsuleIntersect(playerCollider)
    playerOnFloor = false

    if (result) {
        playerOnFloor = result.normal.y > 0
        playerCollider.translate(result.normal.multiplyScalar(result.depth))

        if(playerOnFloor) {
            character.isMoving = false
            playerVelocity.x = 0
            playerVelocity.z = 0
        }
    }
}

function updatePlayer() {
    if (!character.instance) return

    if (character.instance.position.y < -20){
        respawnCharacter()
        return
    }

    if (!playerOnFloor) {
        playerVelocity.y -= GRAVITY * 0.04
    }

    playerCollider.translate(playerVelocity.clone().multiplyScalar(0.04))

    playerCollisions()

    character.instance.position.copy(playerCollider.start)
    character.instance.position.y -= CAPSULE_RADIUS

    character.instance.rotation.y = THREE.MathUtils.lerp(character.instance.rotation.y, targetRotation, 0.1)
}

function respawnCharacter(){
    character.instance.position.copy(character.spawnPoint).add(new THREE.Vector3(0, 10, 0))
    playerCollider.start.copy(character.spawnPoint).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0)).add(new THREE.Vector3(0, 5, 0))
    playerCollider.end.copy(character.spawnPoint).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0)).add(new THREE.Vector3(0, 5, 0))
    targetRotation = - Math.PI / 2

    playerVelocity.set(0, 0, 0)
    character.isMoving = false
}

function onkeydown(event) {
    if (event.key.toLowerCase() === "r"){
        respawnCharacter()
        return
    }

    if (character.isMoving) return

    switch(event.key.toLowerCase()){
        case "w":
        case "arrowup":
            playerVelocity.z -= MOVE_SPEED
            targetRotation = Math.PI/2
            break
        case "s":
        case "arrowdown":
            playerVelocity.z += MOVE_SPEED
            targetRotation = -Math.PI/2
            break
        case "a":
        case "arrowleft":
            playerVelocity.x -= MOVE_SPEED
            targetRotation = Math.PI
            break
        case "d":
        case "arrowright":
            playerVelocity.x += MOVE_SPEED
            targetRotation = 0
            break
        default:
            return
    }
    playerVelocity.y = JUMP_HEIGHT
    character.isMoving = true
}

let lastClickTime = 0
const CLICK_DELAY = 500

const mobileControls = document.getElementById('mobile-control')
const respawnMobile = document.getElementById('mobile-respawn')

mobileControls.addEventListener('click', (event) => {
    event.preventDefault()

    const now = Date.now()
    if (now - lastClickTime < CLICK_DELAY){
        return
    }
    lastClickTime = now

    switch(event.target.id){
        case 'mobile-up':
            playerVelocity.z -= MOVE_SPEED
            targetRotation = Math.PI/2
            break
        case 'mobile-down':
            playerVelocity.z += MOVE_SPEED
            targetRotation = -Math.PI/2
            break
        case 'mobile-left':
            playerVelocity.x -= MOVE_SPEED
            targetRotation = Math.PI
            break
        case 'mobile-right':
            playerVelocity.x += MOVE_SPEED
            targetRotation = 0
            break
        default:
            return
    }
    playerVelocity.y = JUMP_HEIGHT
    character.isMoving = true
})

respawnMobile.addEventListener('click', () => {
    respawnCharacter()
})

function onClick(event){
    const rect = canvas.getBoundingClientRect();
  
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update pointer vector
    pointer.set(x, y);

    // Update raycaster with the new pointer position
    // raycaster.setFromCamera(pointer, camera);

    // Perform raycasting against the intersectObjects array recursively
    // const intersects = raycaster.intersectObjects(intersectObjects, true);
    
    // console.log(intersectObject)

    if (intersectObject !== ""){
        showModal(intersectObject)
    }
}

window.addEventListener("resize", handleResize)
window.addEventListener("keydown", onkeydown)
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("touchmove", onPointerMove);
window.addEventListener("click", onClick)
modalExitButton.addEventListener("click", hideModal)

function animate() {
    updatePlayer()

    if (character.instance){
        const cameraTarget = new THREE.Vector3(character.instance.position.x + cameraOffset.x, cameraOffset.y, character.instance.position.z + cameraOffset.z)
        camera.position.copy(cameraTarget)
        camera.lookAt(
            character.instance.position.x,
            camera.position.y - cameraOffset.y,
            character.instance.position.z
        )
    }

    raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects( intersectObjects );

    if(intersects.length > 0){
        document.body.style.cursor = "pointer"
        // console.log("Intersected:", intersects[0].object);
        // console.log("Parent:", intersects[0].object.parent);
    }
    else{
        document.body.style.cursor = "default"
        intersectObject = ""
    }

	for ( let i = 0; i < intersects.length; i ++ ) {
        intersectObject = intersects[0].object.parent.name
	}

	renderer.render( scene, camera );

    // console.log(camera.position)
    // console.log(camera.zoom)
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );