// establish vars
var canvas, ctx, source, context, analyser, fbc_array, rads,
	center_x, center_y, radius, radius_old, deltarad, shockwave,
	bars, bar_x, bar_y, bar_x_term, bar_y_term, bar_width,
	bar_height, react_x, react_y, intensity, rot, inputURL,
	JSONPThing, JSONResponse, soundCloudTrackName, audio, pause,
    isSeeking, loader;
var microphone = null;
var prevArray, prev_intensity, color;

// give vars an initial real value to validate
bars = 90;
react_x = 0;
react_y = 0;
radius = 0;
deltarad = 0;
shockwave = 0;
rot = 0;
intensity = 0;
pause = 1;
isSeeking = 0;

hue = 100;
hue_dif = 0;
saturation = 50;
lightness = 60;

sat_Direction = true;
light_Direction = true;

function initPage() {
	canvas = document.getElementById("visualizer_render");
	ctx = canvas.getContext("2d");

	audio = new Audio();
	audio.crossOrigin = "anonymous";
	audio.controls = true;
	audio.loop = false;
	audio.autoplay = false;


	context = new AudioContext();
	analyser = context.createAnalyser();

	// route audio playback
	fbc_array = new Uint8Array(analyser.frequencyBinCount);
    console.log(analyser.frequencyBinCount)
    console.log(fbc_array)
    console.log(context.sampleRate)
	handleButton2();
	frameLooper();

}

function resize_canvas() {
		canvas.width  = screen.width;
		canvas.height = screen.height;
}

function handleButton2(){
    "use strict";
    if (!navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support microphone input!");
        console.log('Your browser does not support microphone input!');
        return;
    }

    navigator.mediaDevices.getUserMedia({audio: true, video: false})
    .then(function(stream) {
        //hasSetupUserMedia = true;
        //convert audio stream to mediaStreamSource (node)
        microphone = context.createMediaStreamSource(stream);
        //create analyser

        if (analyser === null) analyser = context.createAnalyser();
        //connect microphone to analyser
        microphone.connect(analyser);
        //start updating
        //rafID = window.requestAnimationFrame( updateVisualization );
    })
    .catch(function(err) {
      /* handle the error */
        alert("Capturing microphone data failed! (currently only supported in Chrome & Firefox)");
        console.log('capturing microphone data failed!');
        console.log(err);
    });
}


function frameLooper() {
	resize_canvas(); // for some reason i have to resize the canvas every update or else the framerate decreases over time

	ctx.fillStyle = "rgba(0,0,0, 1)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	rot = rot + .005;

	react_x = 0;
	react_y = 0;

	intensity = 0;

	analyser.getByteFrequencyData(fbc_array);

	if(sat_Direction == true){
		saturation = saturation + .25;
	}

	else{
		saturation = saturation - .25;
	}

	if(light_Direction == true){
		lightness = lightness + .125;
	}

	else{
		lightness = lightness - .125;
	}

	if(saturation > 64){
		sat_Direction = false;
	}

	if(lightness > 64){
		light_Direction = false;
	}

	if(saturation < 50){
		sat_Direction = true;
	}

	if(lightness < 50){
		light_Direction = true;
	}
	hue_dif = hue_dif + 2;
	for (var i = 2; i < bars + 2; i++) {
		rads = Math.PI * 2 / bars;

		i_1 = 2 * i + 1;
		i_2 = 2 * i;
		i_1_val = Math.max((fbc_array[i_1]), 0);
		i_2_val = Math.max((fbc_array[i_2]), 0);
		if (i_1_val == NaN){
			i_1_val = 0;
		}
		if (i_2_val == NaN){
			i_2_val = 0;
		}
		i_val = (i_1_val+i_2_val)/2;


		bar_x = center_x + Math.cos(rads * i + rot) * (radius);
		bar_y = center_y + Math.sin(rads * i + rot) * (radius);

		bar_height = 15 + Math.min(99999, Math.max(i_val, 0));
        //if(bar_height == 0){
        //    bar_height = prevArray[i];
        //}
		bar_width = 3;

		bar_x_term = center_x + Math.cos(rads * i + rot) * (radius + bar_height);
		bar_y_term = center_y + Math.sin(rads * i + rot) * (radius + bar_height);

		ctx.save();
		hue = 1.5*i + hue_dif;
		color = "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)";

		var lineColor = color;

		ctx.strokeStyle = lineColor;
		ctx.lineWidth = bar_width;
		ctx.beginPath();
		ctx.moveTo(bar_x, bar_y);
		ctx.lineTo(bar_x_term, bar_y_term);
		ctx.stroke();


		intensity += bar_height;
	}
	prev_intensity = intensity;
	center_x = canvas.width / 2;
	center_y = canvas.height / 2;

	radius_old = radius;
    prevArray = fbc_array;
	radius =  75 + (intensity * 0.01);
    if(Math.abs(radius_old - radius) > 1 && radius > radius_old){
        radius = radius_old + 6;
    }
    if(radius > 150){
        radius = 150;
    }

	ctx.fillStyle = "rgba(255, 255, 255, 0)";
	ctx.beginPath();
	ctx.arc(center_x, center_y, radius + 2, 0, Math.PI * 2, false);
	ctx.fill();


	window.requestAnimationFrame(frameLooper);
}
