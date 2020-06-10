var res
sessionStorage.setItem('teacher name', 'none')
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)
async function start() {
  Webcam.set({
    width: 600,
    height: 400,
    image_format: 'png',
    jpeg_quality: 100
  });
  Webcam.attach('#camera');
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  document.querySelector('div.loading').remove()
  setInterval(() => {
    Webcam.snap((data_uri) => {
      fetch(data_uri)
        .then(res => res.blob())
        .then(async (blob) => {
          const file = new File([blob], 'snap.png', blob)
          image = await faceapi.bufferToImage(file)
          const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
          const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor))
          results.forEach((result, i) => {
            res = result.toString().split("(")[0];
            console.log(res);
            if (res != 'unknown ') {
              $('#staticBackdrop').modal('show')
              document.getElementById('login').innerHTML = 'login as ' + res
              sessionStorage.setItem('teacher name', res)
            }
          })
        })
    });
  }, 1000);
}
document.getElementById('try').addEventListener('click', function () {
  document.getElementById('login').innerHTML = 'login as '
})
document.getElementById('login').addEventListener('click', function () {
  if (sessionStorage.getItem('teacher name') != 'none') {
    console.log(res);
    document.getElementById('anchor').href = '/main'
  } else {
    alert('face not recognized')
  }
})

function loadLabeledImages() {
  const labels = ['pavan']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 4; i++) {
        let img = await faceapi.fetchImage(`./teachers_imgs/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}