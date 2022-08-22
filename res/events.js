/*global events: true*/
events =
(function () {
"use strict";

var connection, enableKeys = false, canvas, startX, startY;

function getKey (e) {
	if (e.key && e.key !== 'Unidentified') {
		return {
			Left: 'ArrowLeft',
			Up: 'ArrowUp',
			Right: 'ArrowRight',
			Down: 'ArrowDown'
		}[e.key] || e.key;
	}
	return {
		9: 'Tab',
		37: 'ArrowLeft',
		38: 'ArrowUp',
		39: 'ArrowRight',
		40: 'ArrowDown'
	}[e.which] || String.fromCharCode(e.which).toLowerCase();
}

function onKeydown (e) {
	if (!connection || !enableKeys || e.altKey || e.ctrlKey || e.metaKey) {
		return;
	}
	switch (getKey(e)) {
	case 'ArrowLeft':
	case 'a':
	case 'q':
		connection.msg('move', {x: -1, y: 0});
		break;
	case 'ArrowUp':
	case 'w':
	case 'z':
		connection.msg('move', {x: 0, y: -1});
		break;
	case 'ArrowRight':
	case 'd':
		connection.msg('move', {x: 1, y: 0});
		break;
	case 'ArrowDown':
	case 's':
		connection.msg('move', {x: 0, y: 1});
		break;
	case '1':
		connection.switchUser(0);
		break;
	case '2':
		connection.switchUser(1);
		break;
	case 'Tab':
		connection.switchUser(1 - connection.getUser());
		break;
	case 'r':
		connection.msg('restart');
	}
	e.preventDefault();
}

function onTouchstart (e) {
	if (e.targetTouches.length > 1) {
		return;
	}
	startX = e.touches[0].clientX;
	startY = e.touches[0].clientY;
	e.preventDefault();
}

function onTouchmove (e) {
	e.preventDefault();
}

function onTouchend (e) {
	var dx, dy, absDx, absDy;
	if (e.targetTouches.length > 0 || !connection) {
		return;
	}
	dx = e.changedTouches[0].clientX - startX;
	dy = e.changedTouches[0].clientY - startY;
	absDx = Math.abs(dx);
	absDy = Math.abs(dy);
	if (Math.max(absDx, absDy) > 10) {
		if (absDx > absDy) { //horizontal
			connection.msg('move', {x: dx < 0 ? -1 : 1, y: 0});
		} else { //vertical
			connection.msg('move', {x: 0, y: dy < 0 ? -1 : 1});
		}
	}
	e.preventDefault();
}

function onAbortClick () {
	if (connection) {
		connection.msg('abort');
	}
}

function onSwitchClick () {
	if (connection) {
		connection.switchUser(1 - connection.getUser());
	}
}

function onRestartClick () {
	if (connection) {
		connection.msg('restart');
	}
}

function onLevelsClick (e) {
	if (connection && !e.target.disabled && e.target.dataset.level) {
		connection.msg('select', {level: Number(e.target.dataset.level)});
	}
}

function onMonitizationstart () {
	if (connection) {
		connection.msg('unlock', {data: 'bonus'});
	}
}

document.addEventListener('keydown', onKeydown);
canvas = document.getElementById('canvas');
canvas.addEventListener('touchstart', onTouchstart, {passive: false});
canvas.addEventListener('touchmove', onTouchmove, {passive: false});
canvas.addEventListener('touchend', onTouchend);
document.getElementById('abort').addEventListener('click', onAbortClick);
document.getElementById('switch').addEventListener('click', onSwitchClick);
document.getElementById('restart').addEventListener('click', onRestartClick);
document.getElementById('levels').addEventListener('click', onLevelsClick);
if (document.monetization) {
	document.monetization.addEventListener('monetizationstart', onMonitizationstart);
}
return {
	start: function (c) {
		connection = c;
	},
	stop: function () {
		connection = false;
	},
	startKeys: function () {
		enableKeys = true;
	},
	stopKeys: function () {
		enableKeys = false;
	}
};
})();