import {loadGLTF} from "./libs/loader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    let frame = captureVideoFrame("video", "png");
    frame = frame.dataUri;
    let ocrResult = writtenOCR(frame);
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/kanji.mind',
      maxTrack: 5,
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    switch(ocrResult){
      case "Fox" : const raccoon = await loadGLTF('./assets/Fox.gltf');
      raccoon.scene.scale.set(0.1, 0.1, 0.1);
      raccoon.scene.position.set(0, -0.4, 0);
      const raccoonAnchor = mindarThree.addAnchor(0);
      raccoonAnchor.group.add(raccoon.scene)
      break;

      case "Duck" : const bear = await loadGLTF('./assets/Duck.gltf');
      bear.scene.scale.set(0.1, 0.1, 0.1);
      bear.scene.position.set(0, -0.4, 0);
      const bearAnchor = mindarThree.addAnchor(1);
      bearAnchor.group.add(bear.scene);
      break;
    }

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
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
      }})
}
