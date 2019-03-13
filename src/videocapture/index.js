const cv = require('opencv4nodejs');

function startVideoCapture(ws) {
    const devicePort = 0;
    const vCap = new cv.VideoCapture(devicePort);

    // loop through the capture
    const delay = 120;
    let done = false;
    while (!done) {
        console.log('read');
        let frame = vCap.read();
        if (frame.empty) {
            vCap.reset();
            frame = vCap.read();
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
