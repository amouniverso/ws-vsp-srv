const cv = require('opencv4nodejs');
const path = require('path');
function startVideoCapture(ws) {
    const devicePort = 0;
    const vCap = new cv.VideoCapture(devicePort);

    // loop through the capture
    const delay = 30;
    let done = false;
    let count = 0;

    const faceClassifier = new cv.CascadeClassifier(cv.LBP_FRONTALFACE_IMPROVED); //LBP_FRONTALFACE_IMPROVED HAAR_FRONTALFACE_ALT2
    const eyesClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);

    let faceObjects = null;
    let eyesObjects = null;
    while (!done) {
        let frame = vCap.read();
        if (frame.empty) {
            vCap.reset();
            frame = vCap.read();
        }

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

        // const modelPath = path.resolve(__dirname, '../../../data/dnn/facenet');
        // const prototxt = path.resolve(modelPath, 'facenet.prototxt');
        // const modelFile = path.resolve(modelPath, 'res10_300x300_ssd_iter_140000.caffemodel');
        //
        // const net = new cv.readNetFromCaffe(prototxt, modelFile);
        // //(h, w) = image.shape[:2]
        // const blob = cv.blobFromImage(frame);
        // net.setInput(blob);
        // const detections = net.forward();
        // console.log(detections);

        //cv.imshow('test frame', frame);
        // convert image to rgba color space
        const frameRGBA = frame.channels === 1
            ? frame.cvtColor(cv.COLOR_GRAY2RGBA)
            : frame.cvtColor(cv.COLOR_BGR2RGBA);
        ws.send(frameRGBA.getData());
        console.log(count++);
        cv.waitKey(delay);
    }
}

module.exports = {
    startVideoCapture: startVideoCapture
};
