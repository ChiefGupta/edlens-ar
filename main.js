import {loadGLTF} from "./libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/targets/musicband.mind',
      maxTrack: 2,
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    const raccoon = await loadGLTF('./assets/models/musicband-raccoon/scene.gltf');
    raccoon.scene.scale.set(0.1, 0.1, 0.1);
    raccoon.scene.position.set(0, -0.4, 0);

    const bear = await loadGLTF('./assets/models/musicband-bear/scene.gltf');
    bear.scene.scale.set(0.1, 0.1, 0.1);
    bear.scene.position.set(0, -0.4, 0);

    const raccoonAnchor = mindarThree.addAnchor(0);
    raccoonAnchor.group.add(raccoon.scene);

    const bearAnchor = mindarThree.addAnchor(1);
    bearAnchor.group.add(bear.scene);

    await mindarThree.start();
    // let frame = captureVideoFrame(camera, "png");
    // handwritingOCR(frame);
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});

// Capture video frame
function captureVideoFrame(video, format) {

  format = format || 'jpeg';

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

// Text/Handwriting OCR API
function handwritingOCR(frame) {
  fetch('https://hf.space/embed/tomofi/MaskTextSpotterV3-OCR/+/api/predict/', {
      //fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAUoNOlhCK2chd2UJGOZA4uYEHxztzuh4M', {
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
              recognized.innerHTML = "Please scan one more time...";
              setTimeout(() => {
                  container.setAttribute("style", "visibility: hidden");
                  recognized.setAttribute("style", "visibility: hidden");
              }, 2000);
          } else {
              let result = json_response.data[1].data[0][0];
              console.log("OCR is: " + result);

              switch (result) {
                  case "TAJMAHAL":
                  case "Tajmahal":
                  case "tajmahal":
                      //container.setAttribute("style", "visibility: visible");
                      //recognized.setAttribute("style", "visibility: visible");
                      //let ctx = recognized.getContext("2d");
                      //let img = document.getElementById("imgTaj");
                      //ctx.drawImage(img, 100, 100);
                      recognized.innerHTML = "Monument: " + result;
                      //document.getElementById("modelid").setAttribute("model", "");
                      //document.getElementById("modelid").setAttribute("model", "molId:pdb:" + result);
                      //document.getElementById("modelid").setAttribute("model" + result);


                      // code block
                      break;
                  default:
                      recognized.innerHTML = "I see: " + result;
                  // code block
              }

              // Change molecular structure based on pbd ID
              //document.getElementById("molStructure").setAttribute("glmol", "");
              //document.getElementById("molStructure").setAttribute("glmol", "molId:pdb:" + result);


              setTimeout(() => {
                  container.setAttribute("style", "visibility: hidden");
                  recognized.setAttribute("style", "visibility: hidden");
              }, 2000);
          }
      })
}
