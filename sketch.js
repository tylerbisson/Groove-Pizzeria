var audioContext = new AudioContext();

// VARIABLE BANK
let initial_slice_angle;
let slice_angle;
let num_steps;
let num_teeth = 16;
let initial_tooth_angle = 22.5;
// 270 degrees is bc teeth are offset by quater right turn 
// i.e. 90 degrees, therefore, 12 o clock is at 270 rather than zero 
let steps = []; // STEP OBJECT ARRAY 
let tooth_angle = 270; 
let step; // STEP OBJECT 
let testCircleVar = 20;
let grey_tooth_angle = tooth_angle + initial_tooth_angle;
let BPM = 120;
let intervalRate = (((60 / ((BPM * 4) / num_teeth))) * 1000) / num_teeth;
let intervalVar;
let soundIntervalVar;
let soundIntervalRate = (60 / (BPM * 4) * 1000);
let externalStepIteratorVar = 0;
// let toothTimer1 = 0;
// let toothTimer2 = 0;
// let stepTimer1 = 0;
// let stepTimer2 = 0;
// let drawTimer1 = 0;
// let drawTimer2 = 0;

toothArcLength = 120;
toothAngleOffset = 90;
let pizzaDiam = ((toothArcLength * num_teeth) / (2 * Math.PI)) * 2;
toothOffset = 10;

///////////////////////////////////////////////////////////////////// AUDIO BUFFER SETUP 

var xhr = new XMLHttpRequest();
xhr.open('get', 
	"/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/click.wav");
xhr.responseType = 'arraybuffer'; // directly as an ArrayBuffer
xhr.send();
var realBuffer;

xhr.onload = function(){
	var audioData = xhr.response;
	audioContext.decodeAudioData(audioData, function(buffer) {
		realBuffer = buffer;

	},
	function(e){ console.log("Error with decoding audio data" + e.err); });
};

///////////////////////////////////////////////////////////////////// SET UP FUNCTION 
function setup() {
	createCanvas(1200, 1200);
	angleMode(DEGREES);
	slice_slider = createSlider(2, 16, 16);
	tooth_slider = createSlider(2, 16, 16);
	bpm_slider = createSlider(50, 200, 120);
	stepArrayMaker(16); // Initial step amount 
	slice_slider.input(updateSlices);
	tooth_slider.input(updateInitialTeeth);
	bpm_slider.mouseReleased(updateBPM);
	greeting = loadSound(
		"/Users/tylerbisson/Desktop/Thesis\ Project/Grooove-Pizzaria/sounds/groovepizzaria.wav",
		loaded); 
	// intervalVar = setInterval(incrementToothAngle, intervalRate);
	soundIntervalVar = setInterval(incrementSoundLauncher, soundIntervalRate);
}

function playBuffer(){
	var source = audioContext.createBufferSource();
	source.buffer = realBuffer;
	source.connect(audioContext.destination);
	source.start(0);
}

function loaded() {
	greeting.play();
}

function incrementSoundLauncher(){

	if (externalStepIteratorVar == 15){
		stepTimer2 = millis();
		stepTimer1 = stepTimer2;
	}
	if (steps[externalStepIteratorVar].beat_color == 0){
		// click.play();
		playBuffer();
	}
	if (externalStepIteratorVar < num_steps - 1){
		externalStepIteratorVar++;
	}
	else if (externalStepIteratorVar == num_steps - 1){
		externalStepIteratorVar = 0;
	}

	tooth_angle = (360/num_steps) * (externalStepIteratorVar + 1) - 90;

}

///////////////////////////////////////////////////////////////////// INCREMENT TOOTH ANGLE FUNCTION
// function incrementToothAngle(){

// 	tooth_angle = tooth_angle + 3.6;

// 	if (tooth_angle > 360){
// 		tooth_angle = 0;
// 		// toothTimer2 = millis();
// 		// toothTimer1 = toothTimer2;
// 	}
// }

///////////////////////////////////////////////////////////////////// UPDATE SLICES FUNCTION
function updateSlices(){
	stepArrayMaker(slice_slider.value());
	updateBPM();
	externalStepIteratorVar = 0;
} 

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateInitialTeeth(){
	initial_tooth_angle = 360/tooth_slider.value();
	updateBPM();
}

///////////////////////////////////////////////////////////////////// UPDATE INITIAL TEETH FUNCTION
function updateBPM(){
	BPM = bpm_slider.value();
	num_teeth = tooth_slider.value();
	intervalRate = (((60 / ((BPM * 4) / num_teeth))) * 1000) / num_teeth;
	myStopFunction();
	// intervalVar = setInterval(incrementToothAngle, intervalRate);
	let soundIntervalRate = (60 / (BPM * 4) * 1000);
	soundIntervalVar = setInterval(incrementSoundLauncher, soundIntervalRate);
}


///////////////////////////////////////////////////////////////////// MOUSE PRESSED FUNCTION
function myStopFunction(){
	clearInterval(intervalVar);
	clearInterval(soundIntervalVar);
}

///////////////////////////////////////////////////////////////////// MOUSE PRESSED FUNCTION
function mousePressed() {
	for (let step of steps) {
		step.clicked(mouseX, mouseY);
	}
}

///////////////////////////////////////////////////////////////////// STEP ARRAY MAKER FUNCTION 
function stepArrayMaker(num_slices){
	initial_slice_angle = 360/num_slices;
	slice_angle = initial_slice_angle;
	steps = [];
	i = 0;
	while(slice_angle < 361){
		let s = new Step(slice_angle);
		steps[i] = s;
		i++;
		slice_angle = slice_angle + initial_slice_angle;
	}
}

///////////////////////////////////////////////////////////////////// DRAW FUNCTION 
function draw() {
	background(230, 237, 233);
	translate(600,600);
	num_steps = slice_slider.value();
	num_teeth = tooth_slider.value();

	pizzaDiam = (toothArcLength * num_teeth) / (2 * Math.PI);

	strokeWeight(1);
	stroke(200);
	noFill();
	let clock = ellipse(0, 0, (pizzaDiam * 2));

	for (let step of steps){
		step.populate();
	}

	//populates teeth

	// BARS 2 - 16

	stroke(200);
	strokeWeight(5);

	line((pizzaDiam * cos(-toothAngleOffset)), 
		(pizzaDiam * sin(-toothAngleOffset)), 
		((pizzaDiam + toothOffset) * cos(-toothAngleOffset)), 
		((pizzaDiam + toothOffset) * sin(-toothAngleOffset)));

	line((pizzaDiam * cos(initial_tooth_angle -toothAngleOffset)), 
		(pizzaDiam * sin(initial_tooth_angle -toothAngleOffset)), 
		((pizzaDiam + toothOffset) * cos(initial_tooth_angle -toothAngleOffset)), 
		((pizzaDiam + toothOffset) * sin(initial_tooth_angle -toothAngleOffset)));

	if(initial_tooth_angle * 2 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 2) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 2) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 2) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 2) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 3 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 3) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 3) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 3) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 3) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 4 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 4) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 4) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 4) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 4) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 5 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 5) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 5) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 5) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 5) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 6 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 6) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 6) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 6) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 6) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 7 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 7) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 7) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 7) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 7) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 8 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 8) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 8) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 8) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 8) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 9 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 9) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 9) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 9) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 9) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 10 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 10) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 10) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 10) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 10) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 11 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 11) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 11) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 11) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 11) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 12 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 12) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 12) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 12) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 12) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 13 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 13) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 13) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 13) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 13) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 14 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 14) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 14) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 14) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 14) - toothAngleOffset)));
	}

	if(initial_tooth_angle * 15 < 360){
		line((pizzaDiam * cos((initial_tooth_angle * 15) - toothAngleOffset)), 
			(pizzaDiam * sin((initial_tooth_angle * 15) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * cos((initial_tooth_angle * 15) - toothAngleOffset)), 
			((pizzaDiam + toothOffset) * sin((initial_tooth_angle * 15) - toothAngleOffset)));
	}

	// PLAY HEAD 
	stroke(94, 163, 120);
	strokeWeight(10);
	line((pizzaDiam * cos(tooth_angle)), 
		(pizzaDiam * sin(tooth_angle)), 
		((pizzaDiam + toothOffset) * cos(tooth_angle)), 
		((pizzaDiam + toothOffset) * sin(tooth_angle)));
	
	// drawTimer2 = millis();

}//////////////////////////////////////////////////////////////////// END OF DRAW 

///////////////////////////////////////////////////////////////////// STEP CLASS
class Step {
	constructor(slice_angle){
		this.slice_angle = slice_angle;
		this.beat_color = 200;
	}

	populate(){
		stroke(200);
		line(0, 
			0, 
			(pizzaDiam * cos(this.slice_angle - 90)), 
			(pizzaDiam * sin(this.slice_angle - 90)));
		fill(this.beat_color);
		ellipse(((pizzaDiam * .75) * cos(this.slice_angle - 90)), 
			((pizzaDiam * .75) * sin(this.slice_angle - 90)), 
			10, 
			10);
	}

	clicked(px, py) {
		px = px - 600;
		py = py - 600;
		let d = dist(px, py, ((pizzaDiam * .75) * cos(this.slice_angle - 90)), ((pizzaDiam * .75) * sin(this.slice_angle - 90)));
		if (d < (pizzaDiam * .13)){ //.13 is to make flexible clicking zones for beats when pizza is resized
			if (this.beat_color == 200){
				this.beat_color = 0;
			}
			else if (this.beat_color == 0){
				this.beat_color = 200;
			} 
		}
	}
}






