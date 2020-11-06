const video = document.getElementById('targetVideo')
let descriptors = { desc1: null, desc2: null }

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    onSelectionChanged()
]).then(startVideo)

async function onSelectionChanged() {
    const input = await faceapi.fetchImage('/images/1.jpg')
    descriptors[`desc1`] = await faceapi.computeFaceDescriptor(input)
}


async function loadQueryImageFromUrl(url) {
    const img = await requestExternalImage($('#queryImgUrlInput').val())
    $('#queryImg').get(0).src = img.src
    updateQueryImageResults()
}

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} }).then(stream => {
        console.log(stream);
        video.srcObject = stream;
    }).catch(err => {
        console.error(err);
    })
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.height, height: video.width }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
})