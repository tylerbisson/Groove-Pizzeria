///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP
function setupSounds(){
  ///////////////////////////////////////////////// Pizza 1

  //////////////////////////// hi hat
  var xhr = new XMLHttpRequest();
  xhr.open('get',
    'sounds/hihat.wav');
  xhr.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr.send();
  // var realBuffer;

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
    'sounds/clap.wav');
  xhr2.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr2.send();
  // var realBuffer2;

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
    'sounds/snare.wav');
  xhr3.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr3.send();
  // var realBuffer3;

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
    'sounds/low.wav');
  xhr4.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr4.send();
  // var realBuffer;

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
    'sounds/mid.wav');
  xhr5.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr5.send();
  // var realBuffer5;

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
    'sounds/hi.wav');
  xhr6.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr6.send();
  // var realBuffer6;

  xhr6.onload = function () {
    var audioData6 = xhr6.response;
    audioContext.decodeAudioData(audioData6, function (buffer6) {
      realBuffer6 = buffer6;
    },

      function (e) { console.log('Error with decoding audio data 6' + e.err); });
  };

  //////////////////////////// 
  var xhr7 = new XMLHttpRequest();
  xhr7.open('get',
    'sounds/wood1.wav');
  xhr7.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr7.send();
  // var realBuffer;

  xhr7.onload = function () {
    var audioData7 = xhr7.response;
    audioContext.decodeAudioData(audioData7, function (buffer7) {
      realBuffer7 = buffer7;
    },

      function (e) { console.log('Error with decoding audio data 7' + e.err); });
  };

  //////////////////////////// 
  var xhr8 = new XMLHttpRequest();
  xhr8.open('get',
    'sounds/wood2.wav');
  xhr8.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr8.send();
  // var realBuffer8;

  xhr8.onload = function () {
    var audioData8 = xhr8.response;
    audioContext.decodeAudioData(audioData8, function (buffer8) {
      realBuffer8 = buffer8;
    },

      function (e) { console.log('Error with decoding audio data 8' + e.err); });
  };

  //////////////////////////// 
  var xhr9 = new XMLHttpRequest();
  xhr9.open('get',
    'sounds/Wood_Block_High.wav');
  xhr9.responseType = 'arraybuffer'; // directly as an ArrayBuffer
  xhr9.send();
  // var realBuffer9;

  xhr9.onload = function () {
    var audioData9 = xhr9.response;
    audioContext.decodeAudioData(audioData9, function (buffer9) {
      realBuffer9 = buffer9;
    },

      function (e) { console.log('Error with decoding audio data 9' + e.err); });
  };
}
  ///////////////////////////////////////////////////////////////////// PLAY SAMPLE FUNCTION

  function playNote(noteTime, sampleNum) {
    var source = audioContext.createBufferSource();

    switch(sampleNum){
      case(1):
        source.buffer = realBuffer;
        break;
      case(2):
        source.buffer = realBuffer2;
        break;
      case(3):
        source.buffer = realBuffer3;
        break;
      case(4):
        source.buffer = realBuffer4;
        break;
      case(5):
        source.buffer = realBuffer5;
        break;
      case(6):
        source.buffer = realBuffer6;
        break;      
      case(7):
        source.buffer = realBuffer7;
        break;
      case(8):
        source.buffer = realBuffer8;
        break;
      case(9):
        source.buffer = realBuffer9;
        break;      
    }
    source.connect(audioContext.destination);
    source.start(noteTime);
  }
