import * as THREE from "three";
// import { GLTFLoader } from "GLTFLoader";

let width = window.innerWidth;
let height = window.innerHeight;

const canvas = document.querySelector("#canvas");
const btnS = document.querySelector("#S");
// const btnF = document.querySelector("#F");
// const btnC = document.querySelector("#C");
// const filters = document.querySelector("#filters");
// const btnF0 = document.querySelector("#f0");
// const btnF1 = document.querySelector("#f1");
// const btnF2 = document.querySelector("#f2");
// const btnF3 = document.querySelector("#f3");
// const btnF4 = document.querySelector("#f4");
// const formDiv = document.querySelector("#formDiv");

// const gltfLoader = new GLTFLoader();
// const textureLoader = new THREE.TextureLoader();

// const modelPath = "./assets/eye0.glb";
// const occluderPath = "./assets/head_occluder.glb";

// let filtersVisible, form, formExist, is3D, screenShot;
// filtersVisible = formExist = false;
// is3D = true;

// let occluder, occluderAnchor, model, modelAnchor;
// let faceMesh, maskPath, maskTexture, count;
// count = 1;

let session, sessionActive, webXrSupported, renderer, camera, scene, XR,size;
sessionActive = webXrSupported = false;
size = 0.05;

async function setupScene() {
  console.log(navigator.xr, navigator.xr.isSessionSupported);
  webXrSupported =
    navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar"));
  if (!webXrSupported) {
    console.error("WebXR not supported");
    btnS.textContent = "WebXR NOT SUPPORTED";
    btnS.disabled = true;
    return;
  }

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.xr.enabled = true;
  XR = renderer.xr;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 0.5);

  const geometry = new THREE.BoxGeometry(size,size,size);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, -0.5);
  scene.add(cube);

  const light = new THREE.HemisphereLight(0xffffff, 10);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(0, 0.5, 0.5).normalize();
  scene.add(directionalLight);

  console.log(scene);
}
setupScene();

async function startSession() {
  sessionActive = true;
  session = await navigator.xr.requestSession("immersive-ar", {
    optionalFeatures: ["dom-overlay"],
    domOverlay: { root: document.querySelector("#controls") },
  });

  await XR.setReferenceSpaceType("local");
  await XR.setSession(session);

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

async function endSession() {
  session.end();
  renderer.clear();
  renderer.setAnimationLoop(null);
  sessionActive = false;
}

btnS.addEventListener("click", () => {
  if (sessionActive) {
    btnS.textContent = "START";
    endSession();
  } else {
    btnS.textContent = "END";
    startSession();
  }
});
