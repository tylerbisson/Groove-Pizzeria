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

///////////////////////////////////////////////////////////////////// PLAY SAMPLE FUNCTION

function playNote(noteTime, sampleNum) {
  if (sampleNum == 1){
    var source1 = audioContext.createBufferSource();
    source1.buffer = realBuffer;
    source1.connect(audioContext.destination);
    source1.start(noteTime);
  }

  else if(sampleNum == 2){
    var source2 = audioContext.createBufferSource();
    source2.buffer = realBuffer2;
    source2.connect(audioContext.destination);
    source2.start(noteTime);
  }
}
