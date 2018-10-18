///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP

//////////////////////////// hi hat
var xhr = new XMLHttpRequest();
xhr.open('get',
'/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/hihat.wav');
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

//////////////////////////// snare
var xhr2 = new XMLHttpRequest();
xhr2.open('get',
'/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/snare.wav');
xhr2.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr2.send();
var realBuffer2;

xhr2.onload = function () {
  var audioData2 = xhr2.response;
  audioContext.decodeAudioData(audioData2, function (buffer2) {
    realBuffer2 = buffer2;
  },

function (e) { console.log('Error with decoding audio data' + e.err); });
};

///////////////////////////////////////////////////////////////////// PLAY SAMPLE FUNCTIONS

//////////////////////////// hi hat
function playNote(noteTime) {
  var source = audioContext.createBufferSource();
  source.buffer = realBuffer;
  source.connect(audioContext.destination);
  source.start(noteTime);
}

//////////////////////////// snare
function playNote2(noteTime) {
  var source = audioContext.createBufferSource();
  source.buffer = realBuffer2;
  source.connect(audioContext.destination);
  source.start(noteTime);
}
