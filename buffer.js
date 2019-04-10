///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP

var xhr = new XMLHttpRequest();
xhr.open('get', '/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/click.wav');
xhr.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr.send();
var realBuffer;

xhr.onload = function () {
  var audioData = xhr.response;
  audioContext.decodeAudioData(audioData, function (buffer) {
    realBuffer = buffer;
  },

function (e) { console.log('Error with decoding audio data' + e.err); });
};
