import * as THREE from "three";
// import { GLTFLoader } from "GLTFLoader";

let width = window.innerWidth;
let height = window.innerHeight;

const canvas = document.querySelector("#canvas");
const btnS = document.querySelector("#S");
const btnM = document.querySelector("#M");
const mList = document.querySelector("#meshesList");
const btnM0 = document.querySelector("#m0");
const btnM1 = document.querySelector("#m1");
const btnM2 = document.querySelector("#m2");
const formDiv = document.querySelector("#formDiv");

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

let webXrSupported, session, sessionActive;
let renderer, camera, scene, XR;
let size, geometry, material, mesh, mesheListVisible;
let controller;

sessionActive = webXrSupported = mesheListVisible = false;
size = 0.025;

async function setupScene() {
  console.log("ENTERED setupScene");

  // console.log(navigator.xr, navigator.xr.isSessionSupported);
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
  console.log("renderer success");

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 0.5);

  const light = new THREE.HemisphereLight(0xffffff, 10);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(0, 0.5, 0.5).normalize();
  scene.add(directionalLight);

  console.log("scene success");
}
setupScene();

async function startSession() {
  console.log("ENTERED startSession");

  sessionActive = true;
  session = await navigator.xr.requestSession("immersive-ar", {
    optionalFeatures: ["dom-overlay"],
    domOverlay: { root: document.body },
  });

  await XR.setReferenceSpaceType("local");
  await XR.setSession(session);

  controller = XR.getController(0);
  scene.add(controller);

  geometry = new THREE.BoxGeometry(size, size, size);
  controller.addEventListener("select", () => {
    console.log("Select");
    material = new THREE.MeshBasicMaterial({ color: 0xffffff * Math.random() });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(controller.position);
    scene.add(mesh);
  });

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

async function endSession() {
  console.log("ENTERED endSession");
  session.end();
  renderer.clear();
  renderer.setAnimationLoop(null);
  sessionActive = false;
}

btnS.addEventListener("click", () => {
  console.log("ENTERED btnS");

  if (sessionActive) {
    btnS.textContent = "START";
    btnM.style.display = "none";
    mList.style.right = "-100px";
    mesheListVisible = false;
    endSession();
  } else {
    btnS.textContent = "END";
    btnM.style.display = "block";
    startSession();
  }
});

btnM.addEventListener("click", () => {
  console.log("ENTERED btnM");

  if (mesheListVisible) {
    mList.style.right = "-100px";
    // mList.style.top = "-100vh";
    // if(formExist){
    //   formDiv.removeChild(form);
    //   formDiv.style.display = "none";
    //   formExist = false;
    // }
  } else {
    // mList.style.top = "10vh";
    mList.style.right = "8px";
  }
  mesheListVisible = !mesheListVisible;
});

btnM0.addEventListener("click", () => {
  console.log("Cube");
  geometry = new THREE.BoxGeometry(size, size, size);
});
btnM1.addEventListener("click", () => {
  console.log("Sphere");
  geometry = new THREE.SphereGeometry(size);
});
btnM2.addEventListener("click", () => {
  console.log("Cone");
  geometry = new THREE.ConeGeometry(size, size * 2);
});
