const cv = require('opencv4nodejs');
function startVideoCapture(ws) {
    const devicePort = 0;
    const vCap = new cv.VideoCapture(devicePort);

    // loop through the capture
    const delay = 130;
    let done = false;
    while (!done) {
        //console.log('read');
        let frame = vCap.read();
        if (frame.empty) {
            vCap.reset();
            frame = vCap.read();
        }

        const faceClassifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        const eyesClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);

        const grayFrame = frame.bgrToGray();
        const faceObjects = faceClassifier.detectMultiScale(grayFrame).objects;
        const eyesObjects = eyesClassifier.detectMultiScale(grayFrame).objects;
        if (faceObjects && faceObjects.length > 0) {
            frame.drawRectangle(faceObjects[0], new cv.Vec3(255, 255, 255), 4);
        }
        if (eyesObjects && eyesObjects.length > 1) {
            frame.drawRectangle(eyesObjects[0], new cv.Vec3(0, 255, 0), 2);
            frame.drawRectangle(eyesObjects[1], new cv.Vec3(0, 255, 0), 2);
        }

        //cv.imshow('test frame', frame);
        // convert image to rgba color space
        const frameRGBA = frame.channels === 1
            ? frame.cvtColor(cv.COLOR_GRAY2RGBA)
            : frame.cvtColor(cv.COLOR_BGR2RGBA);
        ws.send(frameRGBA.getData());
        cv.waitKey(delay);
    }
}

module.exports = {
    startVideoCapture: startVideoCapture
};
