const video = document.getElementById('targetVideo')
const imageUpload = document.getElementById('imageUpload')
const description
const faceMatcher
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

imageUpload.addEventListener('change', async () => {
    description = faceapi.LabeledFaceDescriptors("Duy", await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor())
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
})

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
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        })
    }, 100)
})