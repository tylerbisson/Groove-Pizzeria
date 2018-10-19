///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP

///////////////////////////////////////////////// Pizza 1

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

function (e) { console.log('Error with decoding audio data 1' + e.err); });
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

function (e) { console.log('Error with decoding audio data 2' + e.err); });
};

//////////////////////////// clap
var xhr3 = new XMLHttpRequest();
xhr3.open('get',
'/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/clap.wav');
xhr3.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr3.send();
var realBuffer3;

xhr3.onload = function () {
  var audioData3 = xhr3.response;
  audioContext.decodeAudioData(audioData3, function (buffer3) {
    realBuffer3 = buffer3;
  },

function (e) { console.log('Error with decoding audio data 3' + e.err); });
};

///////////////////////////////////////////////// Pizza 2

//////////////////////////// low
var xhr4 = new XMLHttpRequest();
xhr4.open('get',
'/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/low.wav');
xhr4.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr4.send();
var realBuffer;

xhr4.onload = function () {
  var audioData4 = xhr4.response;
  audioContext.decodeAudioData(audioData4, function (buffer4) {
    realBuffer4 = buffer4;
  },

function (e) { console.log('Error with decoding audio data 4' + e.err); });
};

//////////////////////////// mid
var xhr5 = new XMLHttpRequest();
xhr5.open('get',
'/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/mid.wav');
xhr5.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr5.send();
var realBuffer5;

xhr5.onload = function () {
  var audioData5 = xhr5.response;
  audioContext.decodeAudioData(audioData5, function (buffer5) {
    realBuffer5 = buffer5;
  },

function (e) { console.log('Error with decoding audio data 5' + e.err); });
};

//////////////////////////// clap
var xhr6 = new XMLHttpRequest();
xhr6.open('get',
'/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/hi.wav');
xhr6.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr6.send();
var realBuffer6;

xhr6.onload = function () {
  var audioData6 = xhr6.response;
  audioContext.decodeAudioData(audioData6, function (buffer6) {
    realBuffer6 = buffer6;
  },

function (e) { console.log('Error with decoding audio data 6' + e.err); });
};

///////////////////////////////////////////////////////////////////// PLAY SAMPLE FUNCTION

function playNote(noteTime, sampleNum) {

///////////////////////////////////////////////// Pizza 1
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

  else if(sampleNum == 3){
    var source3 = audioContext.createBufferSource();
    source3.buffer = realBuffer3;
    source3.connect(audioContext.destination);
    source3.start(noteTime);
  }

///////////////////////////////////////////////// Pizza 1
  else if (sampleNum == 4){
    var source4 = audioContext.createBufferSource();
    source4.buffer = realBuffer4;
    source4.connect(audioContext.destination);
    source4.start(noteTime);
  }

  else if(sampleNum == 5){
    var source5 = audioContext.createBufferSource();
    source5.buffer = realBuffer5;
    source5.connect(audioContext.destination);
    source5.start(noteTime);
  }

  else if(sampleNum == 6){
    var source6 = audioContext.createBufferSource();
    source6.buffer = realBuffer6;
    source6.connect(audioContext.destination);
    source6.start(noteTime);
  }
}
