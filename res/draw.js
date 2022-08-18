/*global draw: true*/
/*global GRID_SIZE, GRID_WIDTH, GRID_HEIGHT*/
draw =
(function () {
"use strict";

var drawCallback, lastDraw, ctx, rAF;

rAF = window.requestAnimationFrame || window.mozRequestAnimationFrame;

function initCanvas () {
	var canvas = document.getElementById('canvas'), header = document.getElementById('header');
	canvas.width = GRID_SIZE * GRID_WIDTH;
	canvas.height = GRID_SIZE * GRID_HEIGHT;
	ctx = canvas.getContext('2d');

	function onResize () {
		var docEl = document.documentElement, f, width;
		f = Math.min(1, docEl.clientWidth / canvas.width, (docEl.clientHeight - header.clientHeight) / canvas.height);
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

function rAFCallback (time) {
	if (!drawCallback) {
		return;
	}
	if (!lastDraw) {
		lastDraw = time;
	}
	drawCallback(ctx, time - lastDraw);
	lastDraw = time;
	rAF(rAFCallback);
}

initCanvas();

return {
	start: function (c) {
		lastDraw = 0;
		drawCallback = c;
		rAF(rAFCallback);
	},
	stop: function () {
		if (drawCallback) {
			drawCallback(ctx);
		}
		drawCallback = false;
	}
};
})();