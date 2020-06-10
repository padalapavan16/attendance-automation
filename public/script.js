var res
var per
var std  = []
var isNotRepeat = true 
var obj
 if(sessionStorage.getItem('teacher name') == 'none' || sessionStorage.getItem('teacher name') == null || sessionStorage.getItem('teacher name') == '' || sessionStorage.getItem('teacher name') == undefined){
   while(true){
     alert(`you can't access this page`)
     document.querySelector('body').innerHTML = ''
   }
 }
else{
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)
async function start() {
  Webcam.set({
    width: 320,
    height: 240,
    image_format: 'png',
    jpeg_quality: 100
  });
  Webcam.attach('#my_camera');
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
            res = result.toString().split('(')[0]
            console.log(res);
            for(var i = 0;i<std.length;i++){
              if(res == std[i].name){
                isNotRepeat = false
                break
              }else{
                isNotRepeat = true
              }
            }
            if((isNotRepeat) && (res != 'unknown ')){
              var d = new Date()
              var h = d.getHours()
              var m = d.getMinutes()
              if((per == 'period 1') && ((h == 9  && m>40) || (h ==10) )){
              std.push({'name':res,time:'late'})
              obj = {'name':res,time:'late'}
              }
              else if((per == 'period 2') && ((h == 10  && m>30) || (h ==11) )){
                std.push({'name':res,time:'late'})
              obj = {'name':res,time:'late'}
              }
              else if((per == 'period 3') && ((h == 11  && m>20) || (h ==12) )){
                obj = {'name':res,time:'late'}
                std.push({'name':res,time:'late'})
                }
              else if((per == 'period 4') && (h == 12  && m>10)){
                obj = {'name':res,time:'late'}
                std.push({'name':res,time:'late'})
                  }
              else if((per == 'period 5') && (h == 14  && m>0)){
                obj = {'name':res,time:'late'}
                std.push({'name':res,time:'late'})
                    }
              else if((per == 'period 6') && ((h == 14  && m>50) || (h ==15) )){
                obj = {'name':res,time:'late'}
                std.push({'name':res,time:'late'})
                        }
              else if((per == 'period 7') && ((h == 15  && m>40) || (h ==16) )){
                obj = {'name':res,time:'late'}
                std.push({'name':res,time:'late'})
                    }
              else{
                obj = {'name':res,time:'in-time'}
                std.push({'name':res,time:'in-time'})
              }
              document.getElementById('count').innerHTML = std.length
              document.getElementById('details').innerHTML += `
              <tr>
                <td>${obj.name}</td>
                <td>${obj.time}</td>
              </tr>
              `
            }
          })
        })
    });
  }, 1000);
}
function loadLabeledImages() {
  const labels = ['pavan']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 4; i++) {
        let img = await faceapi.fetchImage(`./students_imgs/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        if(detections){
          descriptions.push(detections.descriptor)
        }
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
function setPeriod(){
  var d = new Date();
  var h = d.getHours()
  var m = d.getMinutes()
  if((h == 9 && m >30) || (h == 10 && m < 20)){
    per = 'period 1'
  }
  else if((h == 10 && m >20) || (h == 11 && m < 10)){
    per = 'period 2'
  }
  else if((h == 11 && m >10) || (h == 12 && m < 1)){
    per = 'period 3'
  }
  else if((h == 12 && m >2) || (h == 12 && m < 50)){
    per = 'period 4'
  }
  else if((h == 13 && m >50) || (h == 14 && m < 40)){
    per = 'period 5'
  }
  else if((h == 14 && m >40) || (h == 15 && m < 30)){
    per = 'period 6'
  }
  else if((h == 15 && m >30) || (h == 16 && m < 20)){
    per = 'period 7'
  }
  else{
    per = 'leisure'
  }
}
setPeriod()
document.getElementById('period').innerHTML = per
document.getElementById('teacher').innerHTML = sessionStorage.getItem('teacher name')
document.getElementById('submit').addEventListener('click',()=>{
  var t = sessionStorage.getItem('teacher name')
  var p = per
  const dmy = new Date()
  var d = dmy.getDate() + '/' + dmy.getMonth() + '/' + dmy.getFullYear()
  var a = std


fetch("/post", { 
  method: "POST", 
  body: JSON.stringify({'teacher':t,'period':p,'date':d,'attendance':a}), 
  headers: {"Content-type": "application/json; charset=UTF-8"} 
})  
.then(response => response.json())  
.then(json => console.log(json)); 
})
}