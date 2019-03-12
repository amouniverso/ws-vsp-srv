const cv = require('opencv4nodejs');

function startVideoCapture(ws) {
    // open capture from webcam
    const devicePort = 0;
    const vCap = new cv.VideoCapture(devicePort);

    // loop through the capture
    const delay = 100;
    let done = false;
    while (!done) {
        console.log('read');
        let frame = vCap.read();
        // loop back to start on end of stream reached
        if (frame.empty) {
            console.log('empty');
            vCap.reset();
            frame = vCap.read();
        }
        // ...
        //cv.imshow('test frame', frame);
        //ws.send(frame.getData());
        ws.send(frame.getData());
        const key = cv.waitKey(delay);
        //done = key !== 255;
    }
}

module.exports = {
    startVideoCapture: startVideoCapture
};
