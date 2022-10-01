import * as THREE from './libs/three.js-r132/build/three.module.js'
import { GLTFLoader } from './libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js'
// import { ARButton } from './libs/three.js-r132/examples/jsm/webxr/ARButton.js'

document.addEventListener('DOMContentLoaded', () => {
  const initialize = async () => {
    const arButton = document.querySelector("#ar-button");

    // check and request webxr session 
    const supported = navigator.xr && await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
      arButton.textContent = "Not Supported";
      arButton.disabled = true;
      return;
    }

    // build three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    
    let ocrWord = ocrWord.toLowerCase();
      switch (ocrWord) {
      case 'duck':
        loader.load('./assets/models/Duck.gltf', function (gltf) {
          let duck = gltf.scene.children[0];
          duck.scale.set(0.01, 0.01, 0.01);
          duck.position.set(0, -5, -5);
          scene.add(gltf.scene);
        });
        break;
      }
    }
    
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    renderer.xr.addEventListener("sessionstart", (e) => {
      console.log("session start");
    });

    

    renderer.xr.addEventListener("sessionend", () => {
      console.log("session end");
    });

    let currentSession = null;
    const start = async () => {
      currentSession = await navigator.xr.requestSession('immersive-ar', {
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      });

      renderer.xr.enabled = true;


      renderer.xr.setReferenceSpaceType('local');


      await renderer.xr.setSession(currentSession);
      arButton.textContent = "End";

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        
      });

      

    }
    const end = async () => {
      currentSession.end();
      renderer.setAnimationLoop(null);
      renderer.clear();
      arButton.style.display = "none";
    }
    arButton.addEventListener('click', () => {
      if (currentSession) {
        end();
      } else {
        start();
      }
    });
  initialize();
  
});

// Capture video frame
function captureVideoFrame(video, format) {
  if (typeof video === 'string') {
    video = document.querySelector(video);
  }
  format = format || 'jpeg';

  if (!video || (format !== 'png' && format !== 'jpeg')) {
    return false;
  }
  let canvas = document.createElement("CANVAS");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  let dataUri = canvas.toDataURL('image/' + format);
  let data = dataUri.split(',')[1];
  let mimeType = dataUri.split(';')[0].slice(5)
  let bytes = window.atob(data);
  let buf = new ArrayBuffer(bytes.length);
  let arr = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  let blob = new Blob([arr], {
    type: mimeType
  });
  return {
    blob: blob,
    dataUri: dataUri,
    format: format,
    width: canvas.width,
    height: canvas.height
  };
};

// OCR API
function writtenOCR(frame) {
  fetch('https://hf.space/embed/tomofi/MaskTextSpotterV3-OCR/+/api/predict/', {
  // fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBFe63SsyUnk07oPv27F8DHZJBSWSUCrrg', {
    method: "POST",
    body: JSON.stringify({
      data: ["data:" + frame],
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(
    function (response) {
      return response.json();
    })
    .then(function (json_response) {
      let arrayLength = json_response.data[1].data;

      console.log("arrayLength is: " + arrayLength);
      if (arrayLength == 0) {
        window.location.reload();
        let result = json_response.data[1].data[0][0];
        console.log("OCR is: " + result);
        return result;
      }
    })
}

