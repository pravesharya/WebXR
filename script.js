import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from 'OrbitControls';
// import { CSS3DRenderer } from "CSS3DRenderer";
// console.log(CSS3DRenderer);

let width = window.innerWidth;
let height = window.innerHeight;

const canvas = document.querySelector("#canvas");
const btnS = document.querySelector("#session");
const btnM = document.querySelector("#meshes");
const btnC = document.querySelector("#clear");
const mList = document.querySelector("#meshesList");
const btnM0 = document.querySelector("#m0");
const btnM1 = document.querySelector("#m1");
const btnM2 = document.querySelector("#m2");
const btnM3 = document.querySelector("#m3");
const btnM4 = document.querySelector("#m4");
const btnM5 = document.querySelector("#m5");
const formDiv = document.querySelector("#formDiv");

let webXrSupported, session, sessionActive;
let renderer, camera, scene, XR;
let size, geometry, material, mesh, mesheListVisible;
let gltfLoader, modelPath, model, modelSize, modelAnims;
let controller, isModel, modelReady;
let pinCorrect, formExist, form, input, actions, submit, close;

sessionActive = webXrSupported = isModel = false;
mesheListVisible = formExist = pinCorrect = false;
size = modelSize = 0.0025;

gltfLoader = new GLTFLoader();
modelPath = "./assets/duck/scene.gltf"; // default Model
isModel = modelReady = false;

async function loadModel() {
  try {
    const gltf = await gltfLoader.loadAsync(modelPath);
    model = gltf.scene;
    model.scale.set(modelSize, modelSize, modelSize);
    model.castShadow = true;
    modelReady = true;
    console.log("Model loaded successfully");
    model.lookAt(camera.position);

    // modelAnims = gltf.animations;
    // console.log("Animation : " + modelAnims);
    // const mixer = new THREE.AnimationMixer(model);
    // const action = mixer.clipAction(modelAnims[0]);
    // action.play();
  } catch (error) {
    console.error("Error loading model:", error);
    // Handle the error appropriately, e.g., display an error message
  }
}

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

  geometry = new THREE.BoxGeometry(size, size, size); // default Shape
  loadModel(); // default model

  console.log("Session STARTED");

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  controller = XR.getController(0);
  scene.add(controller);

  controller.addEventListener("select", async () => {
    if (isModel && modelReady) {
      console.log("placing Model : START");

      const clone = model.clone(); // Clone the loaded model
      clone.position.copy(controller.position);
      scene.add(clone);

      console.log("placing Model : END");
    } else {
      console.log("placing Shape : START");

      material = new THREE.MeshBasicMaterial({
        color: 0xffffff * Math.random(),
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(controller.position);
      scene.add(mesh);

      console.log("placing Shape : END");
    }
  });

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
}

function endSession() {
  session.end();
  renderer.clear();
  renderer.setAnimationLoop(null);
  sessionActive = false;
  console.log("Session ENDED");
}

btnS.addEventListener("click", () => {
  console.log("Session");

  if (sessionActive) {
    btnS.textContent = "START";
    btnM.style.display = "none";
    mList.style.right = "-100px";
    mesheListVisible = false;
    endSession();
  } else {
    btnS.textContent = "END";
    btnC.style.display = "block";
    btnM.style.display = "block";
    startSession();
  }
});

btnC.addEventListener("click", () => {
  console.log("Clear Scene");

  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
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

btnM3.addEventListener("click", () => {
  console.log("Duck");
  isModel = true;
  modelSize = 0.05;
});

btnM4.addEventListener("click", () => {
  console.log("CHK 1");
  checkPin(6969, 1);
});

btnM5.addEventListener("click", () => {
  console.log("CHK 2");
  checkPin(6969, 2);
});

function checkPin(pin, count) {
  formExist = true;
  form = document.createElement("form");
  form.classList.add("CC", "form");

  input = document.createElement("input");
  input.type = "text";
  input.maxLength = 4;
  input.pattern = "\\d{4}";
  input.placeholder = "Enter 4 digit code";
  input.classList.add("pin");

  submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "SUBMIT";
  submit.classList.add("pin");

  close = document.createElement("button");
  close.textContent = "X";
  close.classList.add("pin", "pinClose");

  actions = document.createElement("div");
  actions.appendChild(submit);
  actions.appendChild(close);
  actions.classList.add("pin", "CC");

  form.appendChild(input);
  form.appendChild(actions);

  formDiv.appendChild(form);
  formDiv.style.display = "block";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const userInput = input.value;
    if (userInput == pin) {
      console.log("Correct PIN");
      formDiv.removeChild(form);
      formDiv.style.display = "none";
      formExist = false;

      isModel = true;
      modelSize = 0.25;
      modelPath = `./assets/woman/beautiful_0${count}.glb`;
      loadModel();
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
