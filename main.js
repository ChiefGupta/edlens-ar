import * as THREE from './libs/three.js-r132/build/three.module.js';
import {GLTFLoader} from './libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js'
import {ARButton} from './libs/three.js-r132/examples/jsm/webxr/ARButton.js'

document.addEventListener('DOMContentLoaded', () => {
  const initialize = async () => {
    // let frame = captureVideoFrame("video", "png");
    // frame = frame.dataUri;
    // let ocrResult = writtenOCR(frame);

    // create AR object

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2);
    const reticleMaterial = new THREE.MeshBasicMaterial();
    const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } });
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(arButton);

    const controller = renderer.xr.getController(0);
    scene.add(controller);
    const loader = new GLTFLoader();
    controller.addEventListener('select', () => {
      loader.load('./assets/models/Duck.gltf', function(gltf) {
        let duck = gltf.scene.children[0];
        duck.scale.set(0.01, 0.01, 0.01);
        duck.position.set(0, 0, -5);
        duck.position.applyMatrix4(controller.matrixWorld);
        duck.quaternion.setFromRotationMatrix(controller.matrixWorld);
        scene.add(gltf.scene);
      })
    });

    renderer.xr.addEventListener("sessionstart", async (e) => {
      const session = renderer.xr.getSession();
      const viewerReferenceSpace = await session.requestReferenceSpace("viewer");
      const hitTestSource = await session.requestHitTestSource({ space: viewerReferenceSpace });

      renderer.setAnimationLoop((timestamp, frame) => {
        if (!frame) return;

        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length) {
          const hit = hitTestResults[0];
          const referenceSpace = renderer.xr.getReferenceSpace(); // ARButton requested 'local' reference space
          const hitPose = hit.getPose(referenceSpace);

          reticle.visible = true;
          reticle.matrix.fromArray(hitPose.transform.matrix);
        } else {
          reticle.visible = false;
        }

        renderer.render(scene, camera);
      });
    });

    renderer.xr.addEventListener("sessionend", () => {
      console.log("session end");
    });

  }
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
    // fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAUoNOlhCK2chd2UJGOZA4uYEHxztzuh4M', {
    method: "POST",
    body: JSON.stringify({
      "data": ["data:" + frame]
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
        // recognized.innerHTML = "Please scan one more time...";
        //     setTimeout(() => {
        //         container.setAttribute("style", "visibility: hidden");
        //         recognized.setAttribute("style", "visibility: hidden");
        //     }, 2000);
        // } else {
        let result = json_response.data[1].data[0][0];
        console.log("OCR is: " + result);
        return result;

        //     switch (result) {
        //         case "TAJMAHAL":
        //         case "Tajmahal":
        //         case "tajmahal":
        //             recognized.innerHTML = "Monument: " + result;
        //             break;
        //         default:
        //             recognized.innerHTML = "I see: " + result;
        //         // code block
        //     }
        //     setTimeout(() => {
        //         container.setAttribute("style", "visibility: hidden");
        //         recognized.setAttribute("style", "visibility: hidden");
        //     }, 2000);
        // }
      }
    })
}
