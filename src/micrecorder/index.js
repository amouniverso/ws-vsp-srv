var mic = require('mic');
var fs = require('fs');

var micInstance = mic({
    rate: '16000',
    channels: '1',
    debug: true,
    exitOnSilence: 0
});
var micInputStream = micInstance.getAudioStream();

var outputFileStream = fs.WriteStream('output.raw');

micInputStream.pipe(outputFileStream);

micInputStream.on('data', function(data) {
    console.log("Recieved Input Stream: " + data.length);
});

micInputStream.on('error', function(err) {
    console.log("Error in Input Stream: " + err);
});

micInputStream.on('startComplete', function() {
    console.log("Got SIGNAL startComplete");
});

micInputStream.on('stopComplete', function() {
    console.log("Got SIGNAL stopComplete");
});

micInputStream.on('pauseComplete', function() {
    console.log("Got SIGNAL pauseComplete");
});

micInputStream.on('resumeComplete', function() {
    console.log("Got SIGNAL resumeComplete");
});

micInputStream.on('silence', function() {
    console.log("Got SIGNAL silence");
});

micInputStream.on('processExitComplete', function() {
    console.log("Got SIGNAL processExitComplete");
});

module.exports = {
    micInstance: micInstance
};