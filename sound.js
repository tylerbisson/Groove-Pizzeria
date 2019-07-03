///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP

let buffers = [];

function setupSounds(){
  let samplePaths = ['sounds/hihat.wav', 'sounds/clap.wav', 'sounds/snare.wav', 
  'sounds/low.wav', 'sounds/mid.wav', 'sounds/hi.wav', 'sounds/wood1.wav', 
    'sounds/wood2.wav', 'sounds/Wood_Block_High.wav', 'sounds/burp.wav',
    'sounds/noise.wav', 'sounds/crunch.wav'];

  buffers = [];
  
  samplePaths.forEach((path, i) => {
    let xhr = new XMLHttpRequest();
    xhr.open('get', path);
    xhr.responseType = 'arraybuffer'; // directly as an ArrayBuffer
    xhr.send();

    xhr.onload = function () {
      var audioData = xhr.response;
      audioContext.decodeAudioData(audioData, function (buffer) {
        buffers[i] = buffer;
      },
        function (e) { console.log('Error with decoding audio data 1' + e.err); });
    };
  });
}

  function playNote(noteTime, sampleNum) {
    var source = audioContext.createBufferSource();

    switch(sampleNum){
      case(1):
        source.buffer = buffers[0];
        break;
      case(2):
        source.buffer = buffers[1];
        break;
      case(3):
        source.buffer = buffers[2];
        break;
      case(4):
        source.buffer = buffers[3];
        break;
      case(5):
        source.buffer = buffers[4];
        break;
      case(6):
        source.buffer = buffers[5];
        break;      
      case(7):
        source.buffer = buffers[6];
        break;
      case(8):
        source.buffer = buffers[7];
        break;
      case(9):
        source.buffer = buffers[8];
        break;      
      case(10):
        source.buffer = buffers[9];
        break;
      case(11):
        source.buffer = buffers[10];
        break;
      case(12):
        source.buffer = buffers[11];
        break;      
    }
    source.connect(audioContext.destination);
    source.start(noteTime);
  }
