import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
// import { CSS3DRenderer } from "CSS3DRenderer";
// console.log(CSS3DRenderer);

let width = window.innerWidth;
let height = window.innerHeight;

const canvas = document.querySelector("#canvas");
const btnS = document.querySelector("#session");
const btnM = document.querySelector("#meshes");
const mList = document.querySelector("#meshesList");
const btnM0 = document.querySelector("#m0");
const btnM1 = document.querySelector("#m1");
const btnM2 = document.querySelector("#m2");
const btnM3 = document.querySelector("#m3");
const btnM4 = document.querySelector("#m4");
const formDiv = document.querySelector("#formDiv");

let webXrSupported, session, sessionActive;
let renderer, camera, scene, XR;
let size, geometry, material, mesh, mesheListVisible;
let gltfLoader, modelPath, model, modelSize, modelAnims, isModel;
let controller, form, formExist, pinCorrect;

gltfLoader = new GLTFLoader();
modelPath = "./assets/duck/scene.gltf";

sessionActive =
  webXrSupported =
  mesheListVisible =
  isModel =
  formExist =
  pinCorrect =
    false;
size = modelSize = 0.025;

async function setupScene() {
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

  const lightH = new THREE.HemisphereLight(0xffffff, 10);
  scene.add(lightH);

  const lightD = new THREE.DirectionalLight(0xffffff, 2.5);
  lightD.position.set(0, 0.5, 0.5).normalize();
  scene.add(lightD);

  console.log("scene setup successfully");
}
setupScene();

async function startSession() {
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
    if (isModel) {
      model.position.copy(controller.position);
      scene.add(model);
    } else {
      material = new THREE.MeshBasicMaterial({
        color: 0xffffff * Math.random(),
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(controller.position);
      scene.add(mesh);
    }
  });

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  console.log("Session STARTED");
}

async function endSession() {
  session.end();
  renderer.clear();
  renderer.setAnimationLoop(null);
  sessionActive = false;
  console.log("Session ENDED");
}

btnS.addEventListener("click", () => {
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
  console.log("Mesh List");

  if (mesheListVisible) {
    mList.style.right = "-100px";
    if (formExist) {
      formDiv.removeChild(form);
      formDiv.style.display = "none";
      formExist = false;
    }
  } else {
    mList.style.right = "8px";
  }
  mesheListVisible = !mesheListVisible;
});

btnM0.addEventListener("click", () => {
  console.log("Cube");
  isModel = false;
  geometry = new THREE.BoxGeometry(size, size, size);
});
btnM1.addEventListener("click", () => {
  console.log("Sphere");
  isModel = false;
  geometry = new THREE.SphereGeometry(size);
});
btnM2.addEventListener("click", () => {
  console.log("Cone");
  isModel = false;
  geometry = new THREE.ConeGeometry(size, size * 2);
});

async function setModel(count) {
  isModel = true;
  switch (count) {
    case 0:
      modelPath = "./assets/duck/scene.gltf";
      modelSize = 0.05;
      break;
    case 1:
      modelPath = "./assets/woman/beautiful_01.glb";
      modelSize = 0.09;
      break;
    default:
      modelPath = "./assets/duck/scene.gltf";
      modelSize = 0.05;
      break;
  }

  const gltf = await new Promise((resolve) => {
    gltfLoader.load(modelPath, (gltf) => {
      resolve(gltf); // Resolve with entire gltf object, not just scene
    });
  });
  model = gltf.scene;
  console.log("model :" + model);
  
  model.scale.set(modelSize, modelSize, modelSize);
  model.castShadow = true;
  
  // modelAnims = gltf.animations;
  // console.log("Animation : " + modelAnims);
  // const mixer = new THREE.AnimationMixer(model);
  // const action = mixer.clipAction(modelAnims[0]);
  // action.play();
}

btnM3.addEventListener("click", async () => {
  console.log("Duck");
  setModel(0);
});

btnM4.addEventListener("click", async () => {
  console.log("CHK");
  checkPin(6969, 1);
});

function checkPin(pin, count) {
  formExist = true;
  form = document.createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";

  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 4;
  input.pattern = "\\d{4}";
  input.placeholder = "Enter 4 digit code";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "SUBMIT";

  const close = document.createElement("button");
  close.textContent = "[x]";

  form.appendChild(input);
  form.appendChild(submit);
  form.appendChild(close);
  formDiv.appendChild(form);
  formDiv.style.display = "block";

  input.style.backgroundColor = "white";
  submit.style.backgroundColor = "white";
  close.style.backgroundColor = "black";
  input.style.color = "black";
  submit.style.color = "black";
  close.style.color = "white";
  input.style.border = "1px black solid";
  submit.style.border = "1px black solid";
  close.style.border = "none";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const userInput = input.value;
    if (userInput == pin) {
      console.log("Correct PIN");
      formDiv.removeChild(form);
      formDiv.style.display = "none";
      formExist = false;
      setModel(count);
    } else {
      input.value = "";
      alert("Incorrect PIN ! Try again...");
    }
  });

  close.addEventListener("click", () => {
    formDiv.removeChild(form);
    formDiv.style.display = "none";
    formExist = false;
  });
}
