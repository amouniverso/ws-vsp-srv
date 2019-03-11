const WebSocket = require('ws');
const mic = require('../micrecorder/index.js');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WS server started.');
wss.on('connection', function connection(ws) {
    console.log('connected');
    ws.on('message', function incoming(message) {
        console.log('msg received: %s', message);
        if (message === 'START_REC') {
            mic.micInstance.start();
            ws.send('Recording...');
        }
        if (message === 'STOP_REC') {
            mic.micInstance.stop();
            ws.send('Recording stopped.');
            exit();
        }
    });
});

function exit() {
    wss.close();
}