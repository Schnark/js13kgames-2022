/*global draw: true*/
/*global GRID_SIZE, GRID_WIDTH, GRID_HEIGHT, audio*/
draw =
(function () {
"use strict";

var drawCallback, lastDraw, ctx, rAF;

rAF = window.requestAnimationFrame || window.mozRequestAnimationFrame;

function initCanvas () {
	var canvas = document.getElementById('canvas'), header = document.getElementById('header');
	canvas.width = GRID_SIZE * GRID_WIDTH;
	canvas.height = GRID_SIZE * GRID_HEIGHT;
	ctx = canvas.getContext('2d', {alpha: false});

	function onResize () {
		var docEl = document.documentElement, f, width;
		f = Math.min(
			1,
			docEl.clientWidth / canvas.width,
			//TODO header.clientHeight is 0 when hidden, but we actually know it always is 42
			(docEl.clientHeight - (header.clientHeight || 42)) / canvas.height
		);
		if (f > 0.75) {
			f = 0.75;
		} else if (f > 2 / 3) {
			f = 2 / 3;
		} else if (f > 0.5) {
			f = 0.5;
		} else if (f > 1 / 3) {
			f = 1 / 3;
		} else if (f > 0.25) {
			f = 0.25;
		}
		width = Math.floor(canvas.width * f) + 'px';
		canvas.style.width = width;
		header.style.width = width;
	}

	window.addEventListener('resize', onResize);
	onResize();
}

function createPatterns () {
	var patternCanvas = document.createElement('canvas'),
		patternCtx = patternCanvas.getContext('2d'),
		imageData, i, gray, x, y, d,
		box, grass, fire, teleport;
	patternCanvas.width = 32;
	patternCanvas.height = 32;

	for (i = 0; i < 32; i += 3) {
		gray = Math.floor(Math.random() * 256);
		patternCtx.strokeStyle = 'rgba(' + gray + ',' + gray + ',' + gray + ',0.3)';
		x = 5 * Math.random();
		y = 6 + 4 * Math.random();
		patternCtx.beginPath();
		patternCtx.moveTo(i, 0);
		patternCtx.bezierCurveTo(i + x, y, i - x, 32 - y, i, 32);
		patternCtx.stroke();
	}
	box = ctx.createPattern(patternCanvas, 'repeat');

	imageData = patternCtx.createImageData(32, 32);
	for (i = 0; i < 4 * 32 * 32; i += 4) {
		gray = Math.floor(Math.random() * 256);
		imageData.data[i] = gray;
		imageData.data[i + 1] = gray;
		imageData.data[i + 2] = gray;
		imageData.data[i + 3] = 50;
	}
	patternCtx.putImageData(imageData, 0, 0);
	grass = ctx.createPattern(patternCanvas, 'repeat');

	d = 32;
	imageData.data[2] = 0;
	imageData.data[3] = 128 + Math.floor(Math.random() * 32);
	imageData.data[4 * 31 + 2] = 0;
	imageData.data[4 * 31 + 3] = 128 + Math.floor(Math.random() * 32);
	imageData.data[4 * 32 * 31 + 2] = 0;
	imageData.data[4 * 32 * 31 + 3] = 128 + Math.floor(Math.random() * 32);
	imageData.data[4 * (32 * 31 + 31) + 2] = 0;
	imageData.data[4 * (32 * 31 + 31) + 3] = 128 + Math.floor(Math.random() * 32);
	while (d > 1) {
		d /= 2;
		for (x = d; x < 32 - d; x += d) {
			for (y = 0; y < 32; y += 2 * d) {
				gray = imageData.data[(y * 32 + x - d) * 4] + imageData.data[(y * 32 + x + d) * 4];
				gray = Math.floor(gray / 2 + (Math.random() - 0.5) * 8 * d);
				i = (y * 32 + x) * 4;
				imageData.data[i] = gray;
				imageData.data[i + 1] = gray;
				imageData.data[i + 2] = 0;
				imageData.data[i + 3] = 128 + Math.floor(Math.random() * 32);
			}
		}
		for (y = d; y < 32 - d; y += d) {
			for (x = 0; x < 32; x += 2 * d) {
				gray = imageData.data[((y - d) * 32 + x) * 4] + imageData.data[((y + d) * 32 + x) * 4];
				gray = Math.floor(gray / 2 + (Math.random() - 0.5) * 8 * d);
				i = (y * 32 + x) * 4;
				imageData.data[i] = gray;
				imageData.data[i + 1] = gray;
				imageData.data[i + 2] = 0;
				imageData.data[i + 3] = 128 + Math.floor(Math.random() * 32);
			}
		}
	}
	patternCtx.putImageData(imageData, 0, 0);
	fire = ctx.createPattern(patternCanvas, 'repeat');

	teleport = ctx.createRadialGradient(GRID_SIZE / 2, GRID_SIZE / 2, 0, GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE / 2);
	teleport.addColorStop(0, '#808');
	teleport.addColorStop(1, '#d0d');

	return {
		box: box,
		grass: grass,
		fire: fire,
		teleport: teleport
	};
}

function rAFCallback (time) {
	if (!drawCallback) {
		return;
	}
	if (!lastDraw) {
		lastDraw = time;
	}
	audio.tick();
	drawCallback(ctx, time - lastDraw);
	lastDraw = time;
	rAF(rAFCallback);
}

initCanvas();

return {
	start: function (c) {
		audio.start();
		lastDraw = 0;
		drawCallback = c;
		rAF(rAFCallback);
	},
	stop: function () {
		audio.stop();
		if (drawCallback) {
			drawCallback(ctx);
		}
		drawCallback = false;
	},
	patterns: createPatterns()
};
})();