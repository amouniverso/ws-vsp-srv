const cv = require('opencv4nodejs');
const path = require('path');

// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// require('@tensorflow/tfjs-node');
// const faceapi = require('face-api.js');
//
// faceapi.nets.ssdMobilenetv1.loadFromDisk('./models').then((res) => {
//     console.log('LoadSuccess ' + res);
// });

const faceClassifier = new cv.CascadeClassifier(cv.LBP_FRONTALFACE_IMPROVED); //LBP_FRONTALFACE_IMPROVED HAAR_FRONTALFACE_ALT2
const eyesClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);
let faceObjects = null;
let eyesObjects = null;
let count = 0;

const modelPath = path.resolve(__dirname, '../../../dnn/facenet');
const prototxt = path.resolve(modelPath, 'deploy.prototxt');
const modelFile = path.resolve(modelPath, 'res10_300x300_ssd_iter_140000.caffemodel');
const net = new cv.readNetFromCaffe(prototxt, modelFile);

function startVideoCapture(ws) {
    const devicePort = 0;
    const vCap = new cv.VideoCapture(devicePort);

    // loop through the capture
    const delay = 1;
    let done = false;

    while (!done) {
        let frame = vCap.read();
        if (frame.empty) {
            vCap.reset();
            frame = vCap.read();
        }

        //openCVFaceDetection(frame);
        //facenetFaceDetection(frame);

        //cv.imshow('test frame', frame);
        sendPNG(ws, frame);
        cv.waitKey(delay);
    }
}

function sendRGBA(ws, frame) {
    // convert image to rgba color space
    const frameRGBA = frame.channels === 1
        ? frame.cvtColor(cv.COLOR_GRAY2RGBA)
        : frame.cvtColor(cv.COLOR_BGR2RGBA);
    ws.send(frameRGBA.getData());
}

function sendPNG(ws, frame) {
    const bufferPng = cv.imencode(".png", frame);
    ws.send(bufferPng);
}

function openCVFaceDetection(frame) {
    if (count === 10) {
        count = 0;
        const grayFrame = frame.bgrToGray();
        faceObjects = faceClassifier.detectMultiScale(grayFrame).objects;
        eyesObjects = eyesClassifier.detectMultiScale(grayFrame).objects;
    }

    if (faceObjects && faceObjects.length > 0) {
        frame.drawRectangle(faceObjects[0], new cv.Vec3(255, 255, 255), 4);
        if (eyesObjects && eyesObjects.length > 1) {
            frame.drawRectangle(eyesObjects[0], new cv.Vec3(0, 255, 0), 2);
            frame.drawRectangle(eyesObjects[1], new cv.Vec3(0, 255, 0), 2);
        }
    }
    count++;
}

function facenetFaceDetection(frame) {
    const blob = cv.blobFromImage(frame.resize(300, 300), 1.0, new cv.Size(300, 300),
        new cv.Vec3(104.0, 177.0, 123.0), false, false);
    net.setInput(blob);
    let outputBlob = net.forward();
    outputBlob = outputBlob.flattenFloat(outputBlob.sizes[2], outputBlob.sizes[3]);

    const results = Array(outputBlob.rows).fill(0)
        .map((res, i) => {
            const className = outputBlob.at(i, 1);
            const confidence = outputBlob.at(i, 2);
            const topLeft = new cv.Point2(
                outputBlob.at(i, 3) * frame.cols,
                outputBlob.at(i, 6) * frame.rows
            );
            const bottomRight = new cv.Point2(
                outputBlob.at(i, 5) * frame.cols,
                outputBlob.at(i, 4) * frame.rows
            );

            return ({
                className,
                confidence,
                topLeft,
                bottomRight
            })
        });

    frame.drawRectangle(results[0].topLeft, results[0].bottomRight, new cv.Vec3(0, 255, 0), 2);
}

module.exports = {
    startVideoCapture: startVideoCapture
};
