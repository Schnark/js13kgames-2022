(function(){var SocketConnection, LocalConnection, GRID_SIZE, GRID_WIDTH, GRID_HEIGHT, storage, overlay, events, audio, draw, Tile, Movable, Room, Level, levelData, levelManager;
/*global SocketConnection: true, LocalConnection: true*/
/*global io*/
SocketConnection =
(function () {
"use strict";

function SocketConnection (callback, id) {
	this.isOpen = false;
	this.socket = io({upgrade: false, transports: ['websocket']});
	this.socket.on('start', function (data) {
		data = JSON.parse(data);
		this.user = data.user;
		this.isOpen = true;
		callback('start', data.user, data.details);
	}.bind(this));
	this.socket.on('data', function (data) {
		data = JSON.parse(data);
		callback(data.type, data.user, data.details);
	});
	this.socket.on('end', function (user) {
		this.isOpen = false;
		callback('end', user, {});
		this.socket.disconnect();
	}.bind(this));
	this.socket.on('disconnect', function () {
		if (this.isOpen) {
			callback('end', this.user, {});
		}
		this.isOpen = false;
	}.bind(this));
	this.socket.on('connect', function () {
		this.socket.emit('start', id || '');
	}.bind(this));
}

SocketConnection.isAvailable = function () {
	return typeof io !== 'undefined';
};

SocketConnection.prototype.switchUser = function () {
	//noop
};

SocketConnection.prototype.getUser = function () {
	return this.user;
};

SocketConnection.prototype.msg = function (type, details) {
	if (this.user !== undefined) {
		this.socket.emit('data', JSON.stringify({type: type, user: this.user, details: details}));
	}
};

SocketConnection.prototype.close = function () {
	this.socket.disconnect(true);
};

return SocketConnection;
})();

LocalConnection =
(function () {
"use strict";

function LocalConnection (callback, user) {
	this.user = user || 0;
	this.callback = callback;
	if (user === undefined) {
		setTimeout(function () {
			callback('start', 0, {seed: Math.floor(Math.random() * 0x100000000)});
		}, 0);
	}
}

LocalConnection.prototype.getUser = function () {
	return this.user;
};

LocalConnection.prototype.switchUser = function (user) {
	if (this.user !== user) {
		this.user = user;
		this.callback('switch-user', this.user, {});
	}
};

LocalConnection.prototype.msg = function (type, data) {
	this.callback(type, this.user, data);
};

LocalConnection.prototype.close = function () {
	this.callback('end', this.user, {});
};

return LocalConnection;
})();/*global GRID_SIZE: true, GRID_WIDTH: true, GRID_HEIGHT: true*/
GRID_SIZE = 96;
GRID_WIDTH = 10;
GRID_HEIGHT = 15;
/*global storage: true*/
storage =
(function () {
"use strict";

var data = {
	solved: {},
	audio: 2
}, storageKey = 'schnark-js13k-2022';

try {
	data = JSON.parse(localStorage.getItem(storageKey) || 'x');
} catch (e) {
}

function get (key) {
	return data[key];
}

function set (key, value) {
	data[key] = value;
	try {
		localStorage.setItem(storageKey, JSON.stringify(data));
	} catch (e) {
	}
}

return {
	get: get,
	set: set
};
})();/*global overlay: true*/
overlay =
(function () {
"use strict";

var modal = document.getElementById('modal'),
	modalText = document.getElementById('modal-text'),
	button = document.getElementById('modal-close'),
	info = document.getElementById('info'),
	infoText = document.getElementById('info-text'),
	modalCallback, infoTimeout;

button.addEventListener('click', function () {
	modalCallback();
	hideModal();
});

info.addEventListener('click', function () {
	hideInfo();
});

function showModal (text, callback) {
	if (modalCallback) {
		modalCallback();
	}
	modalText.textContent = text;
	modalCallback = callback;
	modal.style.display = 'block';
	button.focus();
}

function hideModal () {
	modal.style.display = '';
	modalCallback = false;
}

function showInfo (text, timeout) {
	if (!text) {
		hideInfo();
		return;
	}
	infoText.textContent = text;
	info.style.display = 'block';
	if (infoTimeout) {
		clearTimeout(infoText);
	}
	infoTimeout = setTimeout(hideInfo, (timeout || 3) * 1000);
}

function hideInfo () {
	if (infoTimeout) {
		clearTimeout(infoTimeout);
		infoTimeout = false;
	}
	info.style.display = '';
}

return {
	modal: showModal,
	info: showInfo
};
})();/*global events: true*/
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
		break;
	case 'm':
		document.getElementById('audio').click();
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
})();/*global audio: true*/
audio =
(function () {
"use strict";

var audioMode = 2, isPlaying = false, AC, audioContext, nodes = [], staffs;

function getFreq (note, key) {
	return key[note];
}

function getNode (time, type) {
	var i, osc, gain;
	type = type || 'sine';
	for (i = 0; i < nodes.length; i++) {
		if (nodes[i].osc.type === type && nodes[i].t < time) {
			return i;
		}
	}
	osc = audioContext.createOscillator();
	gain = audioContext.createGain();
	osc.type = type;
	gain.gain.value = 0;
	osc.connect(gain);
	gain.connect(audioContext.destination);
	osc.start();
	nodes.push({osc: osc, gain: gain});
	return nodes.length - 1;
}

function playNote (start, end, freq, volume) {
	var i = getNode(start);
	nodes[i].osc.frequency.setValueAtTime(freq, start);
	nodes[i].gain.gain.setValueAtTime(0.001, start);
	nodes[i].gain.gain.exponentialRampToValueAtTime(volume, start + 0.05);
	nodes[i].gain.gain.linearRampToValueAtTime(volume, end - 0.05);
	nodes[i].gain.gain.exponentialRampToValueAtTime(0.001, end);
	nodes[i].gain.gain.setValueAtTime(0, end + 0.01);
	nodes[i].t = end + 0.01;
}

function playNotes (notes, dur, start, key, volume) {
	var i, end = start + dur;
	for (i = 0; i < notes.length; i++) {
		playNote(start, end, getFreq(notes[i], key), volume);
	}
	return end;
}

function playStaff (staff) {
	var notes;
	while (staff.time - audioContext.currentTime < 1) {
		notes = staff.notes[staff.pos];
		if (notes[0][0] === 'z') {
			staff.time += notes[1] * staff.baseDur;
		} else {
			staff.time = playNotes(
				notes[0], notes[1] * staff.baseDur,
				staff.time,
				staff.key,
				staff.volume
			);
		}
		staff.pos = (staff.pos + 1) % staff.notes.length;
	}
}

function playStaffs () {
	var i, time;
	if (!isPlaying || audioMode !== 2) {
		return;
	}
	if (!audioContext) {
		audioContext = new AC();
	}
	for (i = 0; i < staffs.length; i++) {
		if (staffs[i].time === -1) {
			if (!time) {
				time = audioContext.currentTime + 0.1;
			}
			staffs[i].time = time;
		}
		playStaff(staffs[i]);
	}
}

function stop () {
	var i, time;
	isPlaying = false;
	if (!audioContext) {
		return;
	}
	time = audioContext.currentTime + 0.1;
	for (i = 0; i < nodes.length; i++) {
		nodes[i].osc.frequency.cancelScheduledValues(time);
		nodes[i].gain.gain.cancelScheduledValues(time);
		nodes[i].gain.gain.setValueAtTime(0, time);
		nodes[i].t = time;
	}
	for (i = 0; i < staffs.length; i++) {
		staffs[i].time = -1;
		staffs[i].pos = 0;
	}
}

function initStaff (notes, key, volume, baseDur) {
	staffs.push({
		time: -1,
		pos: 0,
		notes: notes,
		key: key,
		volume: volume,
		baseDur: baseDur
	});
}

function parseNotes (notes) {
	return notes.split(' ').map(function (n) {
		var l;
		n = n.split(/([\^_]?[a-zA-Z][',]*)/);
		l = Number(n.pop() || 1);
		return [
			n.filter(function (a) {
				return a;
			}),
			l
		];
	});
}

function init (data, baseDur) {
	var i;
	staffs = [];
	for (i = 0; i < data.length; i++) {
		initStaff(parseNotes(data[i][0]), data[i][1], data[i][2], baseDur);
	}
}

function setMelody () {
	var cMajorWithGSharp, cMajorOctaveLower, voice0, voice1;

	//Їхав козак за Дунай

	cMajorWithGSharp = {
		E: Math.pow(2, -5 / 12) * 440,
		//F: Math.pow(2, -4 / 12) * 440,
		G: Math.pow(2, -1 / 12) * 440,
		A: 440,
		B: Math.pow(2, 2 / 12) * 440,
		c: Math.pow(2, 3 / 12) * 440,
		d: Math.pow(2, 5 / 12) * 440,
		e: Math.pow(2, 7 / 12) * 440
	};

	voice0 =
		'A A A A A c B A G G G G G B A G ' +
		'A A A A A c B A G e E G A2 z2 ' +
		'c c c c c e d c B B B B B d c B ' +
		'A A A A A c B A G B e0.5 d0.5 c0.5 B0.5 A2 z2';

	cMajorOctaveLower = {
		'E,': Math.pow(2, -17 / 12) * 220,
		'^F,': Math.pow(2, -15 / 12) * 220,
		'G,': Math.pow(2, -14 / 12) * 220,
		'^G,': Math.pow(2, -13 / 12) * 220,
		'A,': 0.5 * 220,
		'B,': Math.pow(2, -10 / 12) * 220,
		C: Math.pow(2, -9 / 12) * 220,
		D: Math.pow(2, -7 / 12) * 220,
		E: Math.pow(2, -5 / 12) * 220,
		//F: Math.pow(2, -4 / 12) * 220,
		G: Math.pow(2, -2 / 12) * 220,
		'^G': Math.pow(2, -1 / 12) * 220,
		A: 220,
		B: Math.pow(2, 2 / 12) * 220,
		c: Math.pow(2, 3 / 12) * 220,
		d: Math.pow(2, 5 / 12) * 220,
		e: Math.pow(2, 7 / 12) * 220,
		f: Math.pow(2, 8 / 12) * 220
	};

	voice1 =
		'A, Ace E Ace A, Ace E Ace E ^Gde B, ^Gde E ^Gde B, ^Gde ' +
		'A, Ace E Ace A, Ace E Ace E ^Gde B, ^Gde A, Ace G,GBf2 ' +
		'C Gce G, Gce C Gce G, Gce G, GBd D GBd G, E, ^F, ^G, ' +
		'A, Ace E Ace A, Ace E Ace E ^Gde B, ^Gde A, Ace A,Ace2';

	init([
		[voice0, cMajorWithGSharp, 0.1],
		[voice1, cMajorOctaveLower, 0.15]
	], 60 / 120);
}

function generateSound (freq, incr, delay, times, vol, type) {
	//based on https://github.com/foumart/JS.13kGames/blob/master/lib/SoundFX.js
	//which is why the parameters are a little odd
	var i, start, end;

	if (!audioContext) {
		audioContext = new AC();
	}
	start = audioContext.currentTime + 0.01;
	end = start + delay * times / 1000;
	i = getNode(start, ['square', 'sawtooth', 'triangle', 'sine'][type || 0]);

	nodes[i].osc.frequency.setValueAtTime(freq, start);
	nodes[i].osc.frequency.linearRampToValueAtTime(freq + incr * times, end);
	nodes[i].gain.gain.setValueAtTime(vol, start);
	nodes[i].gain.gain.linearRampToValueAtTime(0, end);
	nodes[i].t = end;
}

function playSound (sound) {
	if (audioMode === 0) {
		return;
	}
	switch (sound) {
	case 'move':
		generateSound(100, -10, 15, 15, 0.7, 2);
		break;
	case 'open':
		generateSound(220, 15, 60, 15, 0.3, 2);
		break;
	case 'close':
		generateSound(440, -15, 60, 15, 0.3, 2);
		break;
	case 'teleport':
		generateSound(150, 30, 2, 20, 0.5, 2);
		setTimeout(function () {
			generateSound(150, 30, 2, 20, 0.5, 2);
		}, 150);
		break;
	case 'switch':
		generateSound(750, -30, 5, 20, 0.25);
		setTimeout(function () {
			generateSound(150, 30, 5, 20, 0.25);
		}, 100);
		break;
	case 'win':
		generateSound(510, 0, 15, 20, 0.1);
		setTimeout(function () {
			generateSound(2600, 1, 10, 50, 0.2);
		}, 80);
		break;
	case 'die':
	case 'restart':
		generateSound(100, -10, 10, 25, 0.5);
		generateSound(125, -5, 20, 45, 0.1, 1);
		generateSound(40, 2, 20, 20, 1, 2);
		generateSound(200, -4, 10, 100, 0.25, 2);
	}
}

AC = window.AudioContext || window.webkitAudioContext;
setMelody();

return {
	setMode: function (mode) {
		if (mode === audioMode) {
			return;
		}
		if (audioMode === 2 && isPlaying) {
			stop();
			isPlaying = true; //technically, we are still playing, just muted
		}
		audioMode = mode;
	},
	start: function () {
		isPlaying = true;
	},
	stop: stop,
	tick: AC ? playStaffs : function () {},
	sound: AC ? playSound : function () {}
};

})();
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
})();/*global Tile: true*/
/*global GRID_SIZE, draw*/
Tile =
(function () {
"use strict";

var animationDurations = {
		fire: 5 * 1000,
		teleport: 15 * 1000
	},
	drawFunctions = {},
	stateSpeed = 1 / 900;

drawFunctions.grass = function (ctx) {
	ctx.fillStyle = '#060';
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
	ctx.fillStyle = draw.patterns.grass;
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
};

drawFunctions.block = function (ctx) {
	ctx.fillStyle = '#310';
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
	ctx.lineWidth = 2.5;
	ctx.strokeStyle = '#dda';
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(GRID_SIZE, 0);
	ctx.moveTo(0, GRID_SIZE / 4);
	ctx.lineTo(GRID_SIZE, GRID_SIZE / 4);
	ctx.moveTo(0, GRID_SIZE / 2);
	ctx.lineTo(GRID_SIZE, GRID_SIZE / 2);
	ctx.moveTo(0, 3 * GRID_SIZE / 4);
	ctx.lineTo(GRID_SIZE, 3 * GRID_SIZE / 4);
	ctx.moveTo(0, 0);
	ctx.lineTo(0, GRID_SIZE / 4);
	ctx.moveTo(GRID_SIZE / 2, 0);
	ctx.lineTo(GRID_SIZE / 2, GRID_SIZE / 4);
	ctx.moveTo(0, GRID_SIZE / 2);
	ctx.lineTo(0, 3 * GRID_SIZE / 4);
	ctx.moveTo(GRID_SIZE / 2, GRID_SIZE / 2);
	ctx.lineTo(GRID_SIZE / 2, 3 * GRID_SIZE / 4);
	ctx.moveTo(GRID_SIZE / 4, GRID_SIZE / 4);
	ctx.lineTo(GRID_SIZE / 4, GRID_SIZE / 2);
	ctx.moveTo(3 * GRID_SIZE / 4, GRID_SIZE / 4);
	ctx.lineTo(3 * GRID_SIZE / 4, GRID_SIZE / 2);
	ctx.moveTo(GRID_SIZE / 4, 3 * GRID_SIZE / 4);
	ctx.lineTo(GRID_SIZE / 4, GRID_SIZE);
	ctx.moveTo(3 * GRID_SIZE / 4, 3 * GRID_SIZE / 4);
	ctx.lineTo(3 * GRID_SIZE / 4, GRID_SIZE);
	ctx.stroke();
};

drawFunctions.fire = function (ctx, time) {
	ctx.fillStyle = 'hsl(0,100%,' + (50 + 10 * Math.sin(time * Math.PI / 50)) + '%)';
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
	ctx.fillStyle = draw.patterns.fire;
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
};

drawFunctions.doc = function (ctx) {
	drawFunctions.grass(ctx);
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(2 * GRID_SIZE / 3, 5 * GRID_SIZE / 12);
	ctx.lineTo(GRID_SIZE / 2, GRID_SIZE / 4);
	ctx.lineTo(GRID_SIZE / 3, GRID_SIZE / 4);
	ctx.lineTo(GRID_SIZE / 3, 3 * GRID_SIZE / 4);
	ctx.lineTo(2 * GRID_SIZE / 3, 3 * GRID_SIZE / 4);
	ctx.lineTo(2 * GRID_SIZE / 3, 5 * GRID_SIZE / 12);
	ctx.fill();
	ctx.lineTo(GRID_SIZE / 2, 5 * GRID_SIZE / 12);
	ctx.lineTo(GRID_SIZE / 2, GRID_SIZE / 4);
	ctx.stroke();
};

drawFunctions.hdoor = function (ctx, time, state) {
	var l = GRID_SIZE / 2 - state * (GRID_SIZE / 2 - GRID_SIZE / 48);
	drawFunctions.grass(ctx);
	ctx.fillStyle = '#aaa';
	ctx.beginPath();
	ctx.rect(0, 0, l, GRID_SIZE / 8);
	ctx.rect(0, 7 * GRID_SIZE / 8, l, GRID_SIZE / 8);
	ctx.rect(GRID_SIZE - l, 0, l, GRID_SIZE / 8);
	ctx.rect(GRID_SIZE - l, 7 * GRID_SIZE / 8, l, GRID_SIZE / 8);
	ctx.fill();
	ctx.fillStyle = '#ccc';
	ctx.beginPath();
	ctx.rect(0, 0, l, GRID_SIZE / 32);
	ctx.rect(0, 7 * GRID_SIZE / 8, l, GRID_SIZE / 32);
	ctx.rect(GRID_SIZE - l, 0, l, GRID_SIZE / 32);
	ctx.rect(GRID_SIZE - l, 7 * GRID_SIZE / 8, l, GRID_SIZE / 32);
	ctx.fill();
	ctx.fillStyle = '#888';
	ctx.beginPath();
	ctx.rect(0, GRID_SIZE / 16, l, GRID_SIZE / 32);
	ctx.rect(0, 15 * GRID_SIZE / 16, l, GRID_SIZE / 32);
	ctx.rect(GRID_SIZE - l, GRID_SIZE / 16, l, GRID_SIZE / 32);
	ctx.rect(GRID_SIZE - l, 15 * GRID_SIZE / 16, l, GRID_SIZE / 32);
	ctx.fill();
};

drawFunctions.vdoor = function (ctx, time, state) {
	var l = GRID_SIZE / 2 - state * (GRID_SIZE / 2 - GRID_SIZE / 48);
	drawFunctions.grass(ctx);
	ctx.fillStyle = '#aaa';
	ctx.beginPath();
	ctx.rect(0, 0, GRID_SIZE / 8, l);
	ctx.rect(7 * GRID_SIZE / 8, 0, GRID_SIZE / 8, l);
	ctx.rect(0, GRID_SIZE - l, GRID_SIZE / 8, l);
	ctx.rect(7 * GRID_SIZE / 8, GRID_SIZE - l, GRID_SIZE / 8, l);
	ctx.fill();
	ctx.fillStyle = '#ccc';
	ctx.beginPath();
	ctx.rect(0, 0, GRID_SIZE / 32, l);
	ctx.rect(7 * GRID_SIZE / 8, 0, GRID_SIZE / 32, l);
	ctx.rect(0, GRID_SIZE - l, GRID_SIZE / 32, l);
	ctx.rect(7 * GRID_SIZE / 8, GRID_SIZE - l, GRID_SIZE / 32, l);
	ctx.fill();
	ctx.fillStyle = '#888';
	ctx.beginPath();
	ctx.rect(GRID_SIZE / 16, 0, GRID_SIZE / 32, l);
	ctx.rect(15 * GRID_SIZE / 16, 0, GRID_SIZE / 32, l);
	ctx.rect(GRID_SIZE / 16, GRID_SIZE - l, GRID_SIZE / 32, l);
	ctx.rect(15 * GRID_SIZE / 16, GRID_SIZE - l, GRID_SIZE / 32, l);
	ctx.fill();
};

drawFunctions.trigger = function (ctx) {
	drawFunctions.grass(ctx);
	ctx.fillStyle = '#aaa';
	ctx.fillRect(GRID_SIZE / 4, GRID_SIZE / 4, GRID_SIZE / 2, GRID_SIZE / 2);
	ctx.fillStyle = '#ccc';
	ctx.beginPath();
	ctx.rect(GRID_SIZE / 4, GRID_SIZE / 4, GRID_SIZE / 2, GRID_SIZE / 16);
	ctx.rect(GRID_SIZE / 4, GRID_SIZE / 4, GRID_SIZE / 16, GRID_SIZE / 2);
	ctx.fill();
	ctx.fillStyle = '#888';
	ctx.beginPath();
	ctx.rect(5 * GRID_SIZE / 16, 11 * GRID_SIZE / 16, 7 * GRID_SIZE / 16, GRID_SIZE / 16);
	ctx.rect(11 * GRID_SIZE / 16, GRID_SIZE / 4, GRID_SIZE / 16, GRID_SIZE / 2);
	ctx.fill();
};

drawFunctions.teleport = function (ctx, time) {
	drawFunctions.grass(ctx);
	ctx.fillStyle = draw.patterns.teleport;
	ctx.beginPath();
	ctx.arc(GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE / 4 + GRID_SIZE / 12 * Math.sin(time * Math.PI / 50), 0, 2 * Math.PI);
	ctx.fill();
};

function Tile (type, dataOrState) {
	this.type = type;
	if (dataOrState === 0 || dataOrState === 1) {
		this.state = dataOrState;
	} else {
		this.data = dataOrState;
		this.state = 0;
	}
	this.drawState = this.state;
	this.animationTime = 0;
}

Tile.prototype.canEnter = function () {
	if (this.type === 'vdoor' || this.type === 'hdoor') {
		return this.state === 1;
	}
	return this.type !== 'block';
};

Tile.prototype.getDeath = function () {
	if (this.type === 'fire') {
		return 1;
	}
	if ((this.type === 'vdoor' || this.type === 'hdoor') && this.state === 0) {
		return 2;
	}
	if (this.type === 'teleport') { //if we didn't move away immediately, this is deadly
		return 3;
	}
	return 0;
};

Tile.prototype.draw = function (ctx, x, y, dt) {
	var animationDuration = animationDurations[this.type] || 1;
	if (dt === undefined) {
		this.animationTime = 0;
		this.drawState = this.state;
	} else {
		this.animationTime = (this.animationTime + dt) % animationDuration;
		if (dt * stateSpeed >= Math.abs(this.state - this.drawState)) {
			this.drawState = this.state;
		} else {
			this.drawState += dt * stateSpeed * (this.state > this.drawState ? 1 : -1);
		}
	}
	ctx.save();
	ctx.translate(x * GRID_SIZE, y * GRID_SIZE);
	drawFunctions[this.type](ctx, 100 * this.animationTime / animationDuration, this.drawState);
	ctx.restore();
};

return Tile;
})();/*global Movable: true*/
/*global GRID_SIZE, draw*/
Movable =
(function () {
"use strict";

var animationDurations = {
		yellow: 10 * 1000,
		blue: 12 * 1000,
		death: 50 * 1000
	},
	drawFunctions = {},
	speed = 1 / 200;

function drawEye (ctx, x, y, r, d) {
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#000';
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#000';
	ctx.beginPath();
	ctx.arc(x, y - r / 3 + d, r / 3, 0, 2 * Math.PI);
	ctx.fill();
}

drawFunctions.yellow = function (ctx, time) {
	var d = 0;
	ctx.translate(GRID_SIZE / 2, GRID_SIZE / 2);
	if (time > 50 && time < 55) {
		ctx.rotate(0.2 * Math.sin((time - 50) * Math.PI / 2.5));
	}
	ctx.lineWidth = 2;
	ctx.strokeStyle = '#cc0';
	ctx.fillStyle = '#ff0';
	ctx.beginPath();
	ctx.rect(-19 * GRID_SIZE / 48, -19 * GRID_SIZE / 48, 19 * GRID_SIZE / 24, 19 * GRID_SIZE / 24);
	ctx.fill();
	ctx.stroke();
	ctx.lineWidth = 1.5;
	if (time > 70 && time < 75) {
		d = 2 - Math.max(0, Math.abs(time - 72.5) - 0.5);
	}
	drawEye(ctx, -GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10, d);
	drawEye(ctx, GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10, d);
};

drawFunctions.blue = function (ctx, time) {
	var d = 0;
	ctx.translate(GRID_SIZE / 2, GRID_SIZE / 2);
	if (time > 60 && time < 70) {
		ctx.rotate(Math.sin((time - 60) * Math.PI / 5));
	}
	ctx.lineWidth = 2;
	ctx.strokeStyle = '#36d';
	ctx.fillStyle = '#58f';
	ctx.beginPath();
	ctx.arc(0, 0, GRID_SIZE * 2 / 5, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.lineWidth = 1.5;
	if (time > 20 && time < 25) {
		d = 2 - Math.max(0, Math.abs(time - 22.5) - 0.5);
	}
	drawEye(ctx, -GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10, d);
	drawEye(ctx, GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10, d);
};

drawFunctions.death = function (ctx, time) {
	var deg;
	ctx.fillStyle = '#ffe';
	ctx.strokeStyle = '#aaa';
	ctx.translate(GRID_SIZE / 2, GRID_SIZE * 0.75);
	ctx.save();
	ctx.rotate(Math.sin(time * Math.PI / 500) * Math.sin(time * Math.PI / 5) / 2);
	ctx.beginPath();
	ctx.moveTo(0, -GRID_SIZE / 12);
	ctx.lineTo(GRID_SIZE / 3, -GRID_SIZE / 12);
	ctx.bezierCurveTo(GRID_SIZE / 3, -GRID_SIZE / 12, GRID_SIZE * 5 / 12, -GRID_SIZE / 4, GRID_SIZE * 5 / 12, 0);
	ctx.bezierCurveTo(GRID_SIZE * 5 / 12, GRID_SIZE / 4, GRID_SIZE / 3, GRID_SIZE / 12, GRID_SIZE / 3, GRID_SIZE / 12);
	ctx.lineTo(-GRID_SIZE / 3, GRID_SIZE / 12);
	ctx.bezierCurveTo(-GRID_SIZE / 3, GRID_SIZE / 12, -GRID_SIZE * 5 / 12, GRID_SIZE / 4, -GRID_SIZE * 5 / 12, 0);
	ctx.bezierCurveTo(-GRID_SIZE * 5 / 12, -GRID_SIZE / 4, -GRID_SIZE / 3, -GRID_SIZE / 12, -GRID_SIZE / 3, -GRID_SIZE / 12);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.beginPath();
	ctx.moveTo(0, -67 * GRID_SIZE / 96);
	ctx.bezierCurveTo(GRID_SIZE / 3, -67 * GRID_SIZE / 96, GRID_SIZE * 5 / 12, -GRID_SIZE / 2,
		GRID_SIZE * 5 / 12, -GRID_SIZE / 3);
	ctx.bezierCurveTo(GRID_SIZE * 5 / 12, -5 * GRID_SIZE / 48, GRID_SIZE / 24, 19 * GRID_SIZE / 96, 0, 19 * GRID_SIZE / 96);
	ctx.bezierCurveTo(-GRID_SIZE / 24, 19 * GRID_SIZE / 96, -GRID_SIZE * 5 / 12, -5 * GRID_SIZE / 48,
		-GRID_SIZE * 5 / 12, -GRID_SIZE / 3);
	ctx.bezierCurveTo(-GRID_SIZE * 5 / 12, -GRID_SIZE / 2, -GRID_SIZE / 3, -67 * GRID_SIZE / 96, 0, -67 * GRID_SIZE / 96);
	ctx.fill();
	ctx.stroke();
	deg = 0;
	if (time > 70 && time < 75) {
		deg = Math.max(0, Math.abs(time - 72.5) - 0.5) * 60 + 240;
	}
	ctx.fillStyle = 'hsl(' + deg + ', 100%, 30%)';
	ctx.beginPath();
	ctx.arc(-GRID_SIZE / 5, -GRID_SIZE / 3, GRID_SIZE / 8, 0, 2 * Math.PI);
	ctx.arc(GRID_SIZE / 5, -GRID_SIZE / 3, GRID_SIZE / 8, 0, 2 * Math.PI);
	ctx.fill();
};

drawFunctions.box = function (ctx) {
	ctx.fillStyle = '#732';
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
	ctx.fillStyle = '#954';
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE / 16);
	ctx.fillRect(0, 0, GRID_SIZE / 16, GRID_SIZE);
	ctx.fillStyle = '#510';
	ctx.fillRect(15 * GRID_SIZE / 16, 0, GRID_SIZE / 16, GRID_SIZE);
	ctx.fillRect(0, 15 * GRID_SIZE / 16, GRID_SIZE, GRID_SIZE / 16);
	ctx.fillStyle = draw.patterns.box;
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
};

function Movable (type, x, y) {
	this.type = type;
	this.x = x;
	this.drawX = x;
	this.y = y;
	this.drawY = y;
	this.animationTime = 0;
}

Movable.prototype.setRoom = function (room) {
	if (this.room === room) {
		return;
	}
	if (this.room) {
		this.room.movables.splice(this.room.movables.indexOf(this), 1);
	}
	this.room = room;
};

Movable.prototype.getTile = function () {
	return this.room.getTile(this.x, this.y);
};

Movable.prototype.canMoveTo = function (x, y, dx, dy) {
	if (!this.room.canEnter(x, y)) {
		return false;
	}
	if (!this.room.isOccupied(x, y)) {
		return true;
	}
	//the square we want to move to is not free
	//this must be a box, all else would have ended the game
	//test whether we can push the box
	return this.room.canEnter(x + dx, y + dy) && !this.room.isOccupied(x + dx, y + dy);
};

Movable.prototype.moveTo = function (x, y, immediately) {
	this.drawX = immediately ? x : this.x;
	this.drawY = immediately ? y : this.y;
	this.x = x;
	this.y = y;
};

Movable.prototype.draw = function (ctx, dt) {
	var animationDuration = animationDurations[this.type] || 1, dx, dy, l;
	if (dt === undefined) {
		this.animationTime = 0;
		this.drawX = this.x;
		this.drawY = this.y;
	} else {
		this.animationTime = (this.animationTime + dt) % animationDuration;
		dx = this.x - this.drawX;
		dy = this.y - this.drawY;
		l = Math.sqrt(dx * dx + dy * dy);
		if (dt * speed >= l) {
			this.drawX = this.x;
			this.drawY = this.y;
		} else {
			this.drawX += dx * dt * speed / l;
			this.drawY += dy * dt * speed / l;
		}
	}
	ctx.save();
	ctx.translate(this.drawX * GRID_SIZE, this.drawY * GRID_SIZE);
	drawFunctions[this.type](ctx, 100 * this.animationTime / animationDuration);
	ctx.restore();
};

return Movable;
})();/*global Room: true*/
/*global GRID_WIDTH, GRID_HEIGHT, Tile, Movable*/
Room =
(function () {
"use strict";

var typeMap = {
	//' ': 'grass', //this is the default anyway
	'#': 'block',
	'~': 'fire',
	'!': 'doc',
	'-': 'hdoor',
	'|': 'vdoor',
	'.': 'trigger',
	'*': 'trigger', //with box
	'?': 'teleport'
}, movableTypeMap = {
	'0': 'yellow',
	'1': 'blue',
	'2': 'death',
	'3': 'death', //with inverse moves
	'$': 'box',
	'*': 'box' //on trigger
};

function Room () {
}

Room.prototype.init = function (mapData) {
	var i = 0, c, x, y, row, data, movableType, movable, movables = {};
	this.tiles = [];
	this.movables = [];
	for (y = 0; y < GRID_HEIGHT; y++) {
		row = [];
		for (x = 0; x < GRID_WIDTH; x++) {
			c = mapData.map.charAt(i);
			movableType = movableTypeMap[c];
			if (movableType) {
				movable = new Movable(movableType, x, y);
				this.addMovable(movable);
				movables[movableType] = movable;
			}
			data = mapData[c] ? mapData[c].shift() : undefined;
			row.push(new Tile(typeMap[c] || 'grass', data));
			i++;
		}
		this.tiles.push(row);
	}
	return movables;
};

Room.prototype.addMovable = function (m) {
	if (this.movables.indexOf(m) === -1) {
		this.movables.push(m);
		m.setRoom(this);
	}
};

Room.prototype.getTile = function (x, y) {
	return this.tiles[y][x];
};

Room.prototype.canEnter = function (x, y) {
	if (y < 0 || y >= this.tiles.length) {
		return false;
	}
	if (x < 0 || x >= this.tiles[y].length) {
		return false;
	}
	return this.tiles[y][x].canEnter();
};

Room.prototype.isOccupied = function (x, y) {
	var i;
	for (i = 0; i < this.movables.length; i++) {
		if (this.movables[i].x === x && this.movables[i].y === y) {
			return this.movables[i];
		}
	}
	return false;
};

Room.prototype.draw = function (ctx, dt) {
	var x, y, i;
	for (y = 0; y < this.tiles.length; y++) {
		for (x = 0; x < this.tiles[y].length; x++) {
			this.tiles[y][x].draw(ctx, x, y, dt);
		}
	}
	for (i = 0; i < this.movables.length; i++) {
		this.movables[i].draw(ctx, dt);
	}
};

return Room;
})();/*global Level: true*/
/*global GRID_WIDTH, GRID_HEIGHT, Room, events, audio, draw, overlay*/

Level =
(function () {
"use strict";

function Level (data) {
	this.data = data;
}

function clone (data) {
	return JSON.parse(JSON.stringify(data));
}

function isAdjacent (a, b) {
	return a.room === b.room && Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;
}

Level.prototype.init = function () {
	var room, movables, data = clone(this.data);

	this.inverseMove = this.data.map.indexOf('3') > -1;
	this.rooms = [];
	do {
		room = new Room();
		this.rooms.push(room);
		movables = room.init(data);
		data.map = data.map.slice(GRID_WIDTH * GRID_HEIGHT);

		this.yellow = movables.yellow || this.yellow;
		this.blue = movables.blue || this.blue;
		this.death = movables.death || this.death;
	} while (data.map.length > 0);
};

Level.prototype.start = function (user) {
	this.init();
	events.startKeys();
	draw.start(this.draw.bind(this));
	this.state = 0;
	this.user = user;
	this.time = Date.now();
};

Level.prototype.stop = function () {
	events.stopKeys();
	draw.stop();
	return Math.max(1, Math.round((Date.now() - this.time) / 1000));
};

Level.prototype.setUser = function (user) {
	this.user = user;
};

Level.prototype.draw = function (ctx, dt) {
	[this.yellow, this.blue][this.user].room.draw(ctx, dt);
};

Level.prototype.getState = function () {
	//0: running
	//1: win
	//>= 2: lost
		//even: yellow died
		//odd: blue died
	return this.state;
};

Level.prototype.movePlayer = function (player, dx, dy) {
	var x, y, box;
	x = player.x + dx;
	y = player.y + dy;
	if (player.canMoveTo(x, y, dx, dy)) {
		box = player.room.isOccupied(x, y);
		if (box) {
			this.movePlayer(box, dx, dy);
		}
		this.enterLeave(player, false);
		player.moveTo(x, y);
		this.enterLeave(player, true);
		return true;
	}
};

Level.prototype.move = function (user, dx, dy) {
	var moved;
	if (this.state) {
		return;
	}
	moved = this.movePlayer(user === 0 ? this.yellow : this.blue, dx, dy);
	if (moved) {
		audio.sound('move');
	}
	this.state = this.checkEnd();
	if (moved && this.state <= 1) {
		this.movePlayer(this.death, this.inverseMove ? -dx : dx, this.inverseMove ? -dy : dy); //TODO more moving strategies?
		this.state = this.checkEnd();
	}
};

Level.prototype.enterLeave = function (player, enterLeave) {
	//TODO this is not how OOP should be done
	//OTOH player.getTile().enterLeave(player, enterLeave, this) doesn't make things better
	var tile = player.getTile();
	if (tile.type === 'doc') {
		if (player === [this.yellow, this.blue][this.user]) {
			overlay.info(enterLeave ? tile.data : '', 5);
		}
	} else if (tile.type === 'trigger') {
		tile = tile.data;
		this.rooms[tile[2]].getTile(tile[0], tile[1]).state = enterLeave ? 1 : 0;
		audio.sound(enterLeave ? 'open' : 'close');
	} else if (tile.type === 'teleport') {
		if (enterLeave) {
			tile = tile.data;
			if (!this.rooms[tile[2]].isOccupied(tile[0], tile[1])) {
				this.rooms[tile[2]].addMovable(player);
				player.moveTo(tile[0], tile[1], true);
				audio.sound('teleport');
			}
		}
	}
};

Level.prototype.checkDeath = function (player) {
	var d;
	if (isAdjacent(player, this.death)) {
		return 1;
	}
	d = player.getTile().getDeath();
	return d ? d + 1 : 0;
};

Level.prototype.checkEnd = function () {
	var y, b;
	y = this.checkDeath(this.yellow);
	if (y) {
		y = 2 * y;
	}
	b = this.checkDeath(this.blue);
	if (b) {
		return 2 * b + 1;
	}
	if (y && b) { //if both die at once show the death of the active user
		return [y, b][this.user];
	}
	if (y) {
		return y;
	}
	if (b) {
		return b;
	}
	if (isAdjacent(this.yellow, this.blue)) {
		return 1;
	}
	return 0;
};

return Level;
})();/*global levelData: true*/
levelData =
(function () {
"use strict";

return [
	{title: 'Tutorial levels',
		desc: 'Play these tutorial levels first. They will introduce you to the different elements of the game.',
		lock: 0, levels: [{
		map:
			'   #      ' +
			' 0!       ' +
			'   #      ' +
			'####      ' +
			'          ' +
			'  #####   ' +
			'  #   #   ' +
			'  # 2 #   ' +
			'  #   #   ' +
			'  ## ##   ' +
			'          ' +
			'      ####' +
			'      #   ' +
			'       !1 ' +
			'      #   ',
		'!': [
			'Welcome! Try to meet Blue, but avoid Death.',
			'Welcome! Try to meet Yellow, but avoid Death.'
		]
	}, {
		map:
			'0  !      ' +
			'    ~     ' +
			'       ~  ' +
			'          ' +
			'   ~      ' +
			'~        ~' +
			'          ' +
			'    3     ' +
			'          ' +
			' ~      ~ ' +
			'          ' +
			'    ~     ' +
			' ~        ' +
			'   ~      ' +
			'      !  1',
		'!': [
			'This time Death will move the other way. And don’t fall into the fire pits!',
			'This time Death will move the other way. And don’t fall into the fire pits!'
		]
	}, {
		map:
			'0 !       ' +
			'      .   ' +
			'          ' +
			'#####-####' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'  .       ' +
			'          ' +
			'####-#####' +
			'          ' +
			'          ' +
			'       ! 1',
		'!': [
			'The triggers will open and close the doors.',
			'The triggers will open and close the doors.'
		],
		'.': [
			[4, 11, 0],
			[5, 3, 0]
		]
	}, {
		map:
			'0 !       ' +
			'    ?     ' +
			'          ' +
			'##########' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'          ' +
			'          ' +
			'##########' +
			'          ' +
			'    ?     ' +
			'       ! 1',
		'!': [
			'The teleporters will take you somewhere else. Let’s hope the place is free and safe!',
			'The teleporters will take you somewhere else. Let’s hope the place is free and safe!'
		],
		'?': [
			[4, 4, 0],
			[5, 10, 0]
		]
	}, {
		map:
			'0!$       ' +
			'  $       ' +
			'$$$       ' +
			'          ' +
			'          ' +
			'  $$$$$   ' +
			'  $   $   ' +
			'  $ 2 $   ' +
			'  $   $   ' +
			'  $$$$$   ' +
			'          ' +
			'          ' +
			'       $$$' +
			'       $ !' +
			'       $ 1',
		'!': [
			'You can push boxes to a free place, but only one at a time.',
			'You can push boxes to a free place, but only one at a time.'
		]
	}, {
		map:
			'0         ' +
			'!       #-' +
			'$      ## ' +
			'.      #  ' +
			'       # #' +
			'       #  ' +
			'######### ' +
			'2     . $ ' +
			'######### ' +
			'       #  ' +
			'       # #' +
			'?      #  ' +
			'$      ## ' +
			'!       #-' +
			'1         ',
		'!': [
			'Boxes can press triggers, too.',
			'Boxes can go through teleporters, too.'
		],
		'.': [
			[9, 1, 0],
			[9, 13, 0]
		],
		'?': [
			[7, 7, 0]
		]
	}, {
		map:
			'0 !       ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'         ?' +

			'?         ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'       ! 1' +

			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ',
		'!': [
			'Where is Blue? Perhaps you should use the teleporter.',
			'Where is Yellow? Perhaps you should use the teleporter.'
		],
		'?': [
			[0, 0, 2],
			[9, 14, 2]
		]
	}]},
	{title: 'More levels', desc: 'Solve at least six of the tutorial levels to unlock.', lock: 6, levels: [{
		map:
			'0         ' +
			'          ' +
			'   #   ## ' +
			'   #  #   ' +
			'   #  ### ' +
			' # #    # ' +
			'  #   ##  ' +
			'    2     ' +
			' ~ ~~  ~ ~' +
			' ~   ~ ~ ~' +
			' ~ ~~  ~~ ' +
			' ~   ~ ~ ~' +
			' ~ ~~  ~ ~' +
			'          ' +
			'         1'
	}, {
		map:
			'0         ' +
			'#### #### ' +
			'1# #  # # ' +
			' # ## # # ' +
			' #  # # # ' +
			' ##   #   ' +
			'  ##### ##' +
			'~  # 3  # ' +
			'~ ## #### ' +
			'~  #      ' +
			'~ ### ####' +
			'  #     # ' +
			' #### #   ' +
			' #    ####' +
			'   ~~      '
	}, {
		map:
			'0         ' +
			'~~~~~~~~~ ' +
			'          ' +
			' ~~~~~~~~~' +
			'          ' +
			'~~~~~~~~~ ' +
			'        ~ ' +
			' ~~~3~~~~ ' +
			' ~        ' +
			' ~~~~~~~~~' +
			'          ' +
			'~~~~~~~~~ ' +
			'          ' +
			' ~~~~~~~~~' +
			'         1'
	}, {
		map:
			'0         ' +
			'######### ' +
			'          ' +
			' #########' +
			'          ' +
			'######### ' +
			'####?#### ' +
			'    2     ' +
			' ###?#####' +
			' #########' +
			'          ' +
			'######### ' +
			'          ' +
			' #########' +
			'         1',
		'?': [
			[0, 7, 0],
			[9, 7, 0]
		]
	}, {
		map:
			'         0' +
			' #########' +
			' #########' +
			'          ' +
			'######### ' +
			'#### #### ' +
			'#### #### ' +
			'   $2$    ' +
			' ### #####' +
			' ### #####' +
			' #########' +
			'          ' +
			'######### ' +
			'######### ' +
			'1         '
	}, {
		map:
			'. . .# | #' +
			' $$$ #-#-#' +
			'.$0$.#-#-#' +
			' $$$ | #-#' +
			'. . .###-#' +
			'######## #' +
			'          ' +
			'    2     ' +
			'          ' +
			'# ########' +
			'#-###. . .' +
			'#-# | $$$ ' +
			'#-#-#.$1$.' +
			'#-#-# $$$ ' +
			'# | #. . .',
		'.': [
			[5, 3, 0],
			[6, 2, 0],
			[6, 1, 0],
			[7, 0, 0],
			[8, 1, 0],
			[8, 2, 0],
			[8, 3, 0],
			[8, 4, 0],
			[1, 10, 0],
			[1, 11, 0],
			[1, 12, 0],
			[1, 13, 0],
			[2, 14, 0],
			[3, 13, 0],
			[3, 12, 0],
			[4, 11, 0]
		]
	}, {
		map:
			'    0     ' +
			'    !     ' +
			'??????????' +
			'##########' +
			'          ' +
			'??????????' +
			'##########' +
			'          ' +
			'??????????' +
			'##########' +
			'          ' +
			'??????????' +
			'##########' +
			'          ' +
			'??????????' +

			'??????????' +
			'          ' +
			'##########' +
			'??????????' +
			'          ' +
			'##########' +
			'??????????' +
			'          ' +
			'##########' +
			'??????????' +
			'          ' +
			'##########' +
			'??????????' +
			'    !     ' +
			'    1     ' +

			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'    2     ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ',
		'!': [
			'Do you know the value of π? If not, then look it up before heading for the 3rd teleporter.',
			'Do you know the value of Euler’s number e? If not, then look it up before heading for the 2nd teleporter.'
		],
		'?': [
			//1        2          3          4          5          6          7          8          9          0
			[4, 0, 0], [4, 0, 0], [4, 4, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0],
			[4, 7, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0],
			[4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 10, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0],
			[4, 13, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0],
			[4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 2], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0], [4, 0, 0],

			//1         2           3           4           5
			//_ 6           7           8           9           0
			[4, 14, 1], [4, 14, 2], [4, 14, 1], [4, 14, 1], [4, 14, 1],
				[4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1],
			[4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1],
				[4, 14, 1], [4, 14, 1], [4, 1, 1], [4, 14, 1], [4, 14, 1],
			[4, 4, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1],
				[4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1],
			[4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1],
				[4, 14, 1], [4, 7, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1],
			[4, 14, 1], [4, 10, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1],
				[4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1], [4, 14, 1]
		]
	}]},
	{title: 'Sokoban levels',
		desc: 'Solve ten levels to unlock these levels inspired by some Microban levels for Sokoban by David W Skinner.',
		lock: 10, levels: [{
		map:
			'####~~~~~~' +
			'# .#~~~~~~' +
			'#  #####~~' +
			'#*0  | |  ' +
			'#  $ ###  ' +
			'#  ###    ' +
			'####      ' +
			'    2     ' +
			'      ####' +
			'      #. #' +
			'  #####  #' +
			'  | |  1*#' +
			'~~### $  #' +
			'~~~~###  #' +
			'~~~~~~####',
		'.': [
			[7, 3, 0],
			[2, 11, 0]
		],
		'*': [
			[5, 3, 0],
			[4, 11, 0]
		],
		'|': [1, 0, 0, 1]
	}, {
		map:
			'##########' +
			'#        #' +
			'# #0 ###-#' +
			'# $* #~#-#' +
			'# .* #~#-#' +
			'#    #~# #' +
			'######## #' +
			'    3     ' +
			'          ' +
			'   ####   ' +
			' ###  ####' +
			'-#     $ #' +
			'-# #  #$ #' +
			'   . .#1 #' +
			'##########',
		'.': [
			[8, 2, 0],
			[0, 11, 0],
			[0, 12, 0]
		],
		'*': [
			[8, 3, 0],
			[8, 4, 0]
		],
		'-': [0, 1, 1, 0, 0]
	}, {
		map:
			'##########' +
			'#        #' +
			'# .**$0#-#' +
			'#      #-#' +
			'#####  #-#' +
			'    #### #' +
			'          ' +
			'    2     ' +
			'# ########' +
			'#-##     #' +
			'#-## .$. #' +
			'#-## $1$ #' +
			'#-#  .$. #' +
			'#        #' +
			'##########',
		'.': [
			[8, 2, 0],
			[1, 9, 0],
			[1, 10, 0],
			[1, 11, 0],
			[1, 12, 0]
		],
		'*': [
			[8, 3, 0],
			[8, 4, 0]
		],
		'-': [0, 1, 1, 0, 0, 0, 0]
	}, {
		map:
			'##### ####' +
			'    ###   ' +
			' $$     #2' +
			' $ #...   ' +
			'   #######' +
			'####      ' +
			'     0    ' +
			'          ' +
			'# ########' +
			'  ~~      ' +
			'#-##-##-##' +
			'     ~~   ' +
			'####### ##' +
			'    1     ' +
			'          ',
		'.': [
			[1, 10, 0],
			[4, 10, 0],
			[7, 10, 0]
		]
	}, {
		map:
			'#####     ' +
			'#.  ##    ' +
			'#0$$ ##   ' +
			'##   ||   ' +
			' ##  ##   ' +
			'  ##.#    ' +
			'   ##     ' +
			'     2####' +
			'-#   #.  #' +
			'-#   #.# #' +
			'-#####.# #' +
			' 1 $ $ $ #' +
			' # # # ###' +
			'       #~~' +
			'########~~',
		'.': [
			[5, 3, 0],
			[6, 3, 0],
			[0, 8, 0],
			[0, 9, 0],
			[0, 10, 0]
		]
	}, {
		map:
			'0         ' +
			'          ' +
			'          ' +
			'          ' +
			'   ###### ' +
			'   #    # ' +
			'   # ##3##' +
			'-### # $ #' +
			'-# ..# $ #' +
			' #       #' +
			' #  ######' +
			' ####     ' +
			'          ' +
			'          ' +
			'         1',
		'.': [
			[0, 7, 0],
			[0, 8, 0]
		]
	}]},
	{title: 'Bonus levels', desc: 'These bonus levels are exclusively for Coil subscribers.', lock: 'bonus', levels: [{
		map:
			'0         ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'~~~~2~~~~~' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'          ' +
			'         1'
	}, {
		map:
			'0 ??  ??  ' +
			'  ??  ??  ' +
			'??  ??  ??' +
			'??  ??  ??' +
			'  ??  ??  ' +
			'  ??  ??  ' +
			'??  ??  ??' +
			'~~~~2~~~~~' +
			'??  ??  ??' +
			'  ??  ??  ' +
			'  ??  ??  ' +
			'??  ??  ??' +
			'??  ??  ??' +
			'  ??  ??  ' +
			'  ??  ?? 1' +

			'??  ??  ??' +
			'??  ??  ??' +
			'  ??  ??  ' +
			'  ??  ??  ' +
			'??  ??  ??' +
			'??  ??  ??' +
			'  ??  ??  ' +
			'~~~~ ~~~~~' +
			'  ??  ??  ' +
			'??  ??  ??' +
			'??  ??  ??' +
			'  ??  ??  ' +
			'  ??  ??  ' +
			'??  ??  ??' +
			'??  ??  ??',
		'?': [
			[2, 0, 1], [3, 0, 1], [6, 0, 1], [7, 0, 1],
			[2, 1, 1], [3, 1, 1], [6, 1, 1], [7, 1, 1],
			[0, 2, 1], [1, 2, 1], [4, 2, 1], [5, 2, 1], [8, 2, 1], [9, 2, 1],
			[0, 3, 1], [1, 3, 1], [4, 3, 1], [5, 3, 1], [8, 3, 1], [9, 3, 1],
			[2, 4, 1], [3, 4, 1], [6, 4, 1], [7, 4, 1],
			[2, 5, 1], [3, 5, 1], [6, 5, 1], [7, 5, 1],
			[0, 6, 1], [1, 6, 1], [4, 6, 1], [5, 6, 1], [8, 6, 1], [9, 6, 1],
			[0, 8, 1], [1, 8, 1], [4, 8, 1], [5, 8, 1], [8, 8, 1], [9, 8, 1],
			[2, 9, 1], [3, 9, 1], [6, 9, 1], [7, 9, 1],
			[2, 10, 1], [3, 10, 1], [6, 10, 1], [7, 10, 1],
			[0, 11, 1], [1, 11, 1], [4, 11, 1], [5, 11, 1], [8, 11, 1], [9, 11, 1],
			[0, 12, 1], [1, 12, 1], [4, 12, 1], [5, 12, 1], [8, 12, 1], [9, 12, 1],
			[2, 13, 1], [3, 13, 1], [6, 13, 1], [7, 13, 1],
			[2, 14, 1], [3, 14, 1], [6, 14, 1], [7, 14, 1],

			[0, 0, 0], [1, 0, 0], [4, 0, 0], [5, 0, 0], [8, 0, 0], [9, 0, 0],
			[0, 1, 0], [1, 1, 0], [4, 1, 0], [5, 1, 0], [8, 1, 0], [9, 1, 0],
			[2, 2, 0], [3, 2, 0], [6, 2, 0], [7, 2, 0],
			[2, 3, 0], [3, 3, 0], [6, 3, 0], [7, 3, 0],
			[0, 4, 0], [1, 4, 0], [4, 4, 0], [5, 4, 0], [8, 4, 0], [9, 4, 0],
			[0, 5, 0], [1, 5, 0], [4, 5, 0], [5, 5, 0], [8, 5, 0], [9, 5, 0],
			[2, 6, 0], [3, 6, 0], [6, 6, 0], [7, 6, 0],
			[2, 8, 0], [3, 8, 0], [6, 8, 0], [7, 8, 0],
			[0, 9, 0], [1, 9, 0], [4, 9, 0], [5, 9, 0], [8, 9, 0], [9, 9, 0],
			[0, 10, 0], [1, 10, 0], [4, 10, 0], [5, 10, 0], [8, 10, 0], [9, 10, 0],
			[2, 11, 0], [3, 11, 0], [6, 11, 0], [7, 11, 0],
			[2, 12, 0], [3, 12, 0], [6, 12, 0], [7, 12, 0],
			[0, 13, 0], [1, 13, 0], [4, 13, 0], [5, 13, 0], [8, 13, 0], [9, 13, 0],
			[0, 14, 0], [1, 14, 0], [4, 14, 0], [5, 14, 0], [8, 14, 0], [9, 14, 0]
		]
	}, {
		map:
			'    0     ' +
			' # # # # #' +
			' # # # # #' +
			' # # # # #' +
			'!#!#!#!#!#' +
			'?#?#?#?#?#' +
			'##########' +
			' ~  2   ~ ' +
			'##########' +
			'#?#?#?#?#?' +
			'#!#!#!#!#!' +
			'# # # # # ' +
			'# # # # # ' +
			'# # # # # ' +
			'     1    ',
		'!': [
			'NO! Do not go here!',
			'Yes! This is the right teleporter.',
			'NO! Do not go here!',
			'NO! Do not go here!',
			'NO! Do not go here!',

			'NO! Do not go here!',
			'Yes! This is the right teleporter.',
			'NO! Do not go here!',
			'NO! Do not go here!',
			'NO! Do not go here!'
		],
		'?': [
			[0, 7, 0],
			[2, 7, 0],
			[0, 7, 0],
			[0, 7, 0],
			[0, 7, 0],

			[9, 7, 0],
			[3, 7, 0],
			[9, 7, 0],
			[9, 7, 0],
			[9, 7, 0]
		]
	}, {
		map:
			'######~~~~' +
			'     #~~~~' +
			' .$. #~~~~' +
			' $.$ #####' +
			' .$. # ..1' +
			' $.$ # $$ ' +
			'  0  ## ##' +
			' ###### #~' +
			'-#2 ||  #~' +
			'-# #### #~' +
			'-# #    ##' +
			'-# # #   #' +
			'-# #   # #' +
			'-# ###   #' +
			'   ~~#####',
		'.': [
			[0, 8, 0],
			[0, 9, 0],
			[0, 10, 0],
			[0, 11, 0],
			[0, 12, 0],
			[4, 8, 0],
			[5, 8, 0],
			[0, 13, 0]
		]
	}]}
];

})();/*global levelManager: true*/
/*global Level, levelData*/
levelManager =
(function () {
"use strict";

var levelSection = document.getElementById('levels'),
	gameSection = document.getElementById('game'),
	level, levelId, solvedLevels, bonusLevels, levels;

function pad (n) {
	return n < 10 ? '0' + n : n;
}

function formatTime (s) {
	return Math.floor(s / 60) + ':' + pad(s % 60);
}

function showLevelselect () {
	levelSection.hidden = false;
	gameSection.hidden = true;
}

function showGame () {
	levelSection.hidden = true;
	gameSection.hidden = false;
}

function generateHtml () {
	var html = [], i, j, level, button;
	levels = [];
	for (i = 0; i < levelData.length; i++) {
		html.push('<h2>' + levelData[i].title + '</h2>');
		html.push('<p>' + levelData[i].desc + '</p>');
		html.push('<p>');
		for (j = 0; j < levelData[i].levels.length; j++) {
			level = levelData[i].levels[j];
			button = (levels.length + 1) + '<br><span class="result">&nbsp;</span>';
			html.push('<button data-level="' + levels.length + '" disabled>' + button + '</button> ');
			levels.push({
				lock: levelData[i].lock,
				def: level
			});
		}
		html.push('</p>');
	}
	return html.join('');
}

function init () {
	solvedLevels = -1;
	bonusLevels = false;
	levelSection.innerHTML = generateHtml();
	unlock(0);
	showLevelselect();
}

function getLevelDefinition (id) {
	return levels[id].def;
}

function isAvailable (id) {
	var lock;
	if (!levels[id]) {
		return false;
	}
	lock = levels[id].lock;
	return lock === 'bonus' ? bonusLevels : lock <= solvedLevels;
}

function unlock (data) {
	var i;
	if (data === 'bonus') {
		if (!bonusLevels) {
			for (i = 0; i < levels.length; i++) {
				if (levels[i].lock === 'bonus') {
					document.querySelector('[data-level="' + i + '"]').disabled = false;
				}
			}
			bonusLevels = true;
		}
	} else {
		if (data > solvedLevels) {
			for (i = 0; i < levels.length; i++) {
				if (levels[i].lock > solvedLevels && levels[i].lock <= data) {
					document.querySelector('[data-level="' + i + '"]').disabled = false;
				}
			}
			solvedLevels = data;
		}
	}
}

function markSolved (id, time) {
	document.querySelector('[data-level="' + id + '"]').className = 'solved';
	document.querySelector('[data-level="' + id + '"] .result').textContent = formatTime(time);
}

function getNextLevelId (id) {
	return isAvailable(id + 1) ? id + 1 : -1;
}

function runNextLevel (user) {
	levelId = getNextLevelId(levelId);
	if (levelId === -1) {
		level = false;
		showLevelselect();
	} else {
		level = new Level(getLevelDefinition(levelId));
		level.start(user);
	}
}

function runLevel (id, user) {
	levelId = id;
	level = new Level(getLevelDefinition(levelId));
	level.start(user);
	showGame();
}

function abortLevel () {
	level.stop();
	levelId = -1;
	level = false;
	showLevelselect();
}

return {
	init: init,
	end: function () {
		levelSection.hidden = true;
	},
	getCurrentLevel: function () {
		return level;
	},
	getCurrentLevelId: function () {
		return levelId;
	},
	unlock: unlock,
	markSolved: markSolved,
	runNextLevel: runNextLevel,
	runLevel: runLevel,
	abortLevel: abortLevel
};
})();/*global SocketConnection, LocalConnection, storage, levelManager, events, audio, overlay*/
(function () {
"use strict";

var connection,
	startPage = document.getElementById('start'),
	codePage = document.getElementById('code'),
	waitPage = document.getElementById('wait'),

	switchButton = document.getElementById('switch'),
	audioButton = document.getElementById('audio'),
	solvedLevels = storage.get('solved'),
	audioMode = storage.get('audio'),
	results = [
		'Yellow died!', 'Blue died!',
		'Yellow burnt!', 'Blue burnt!',
		'Yellow was crushed in a closing door!', 'Blue was crushed in a closing door!',
		'Yellow got stuck in a teleporter!', 'Blue got stuck in a teleporter!'
	];

function supportsMonetization () {
	return location.search === '?monetization-cheater' ||
		(document.monetization && document.monetization.state === 'started');
}

function solvedLevelCount () {
	return Object.keys(solvedLevels).length;
}

function toggleAudioMode () {
	audioMode = (audioMode + 2) % 3;
	storage.set('audio', audioMode);
	audio.setMode(audioMode);
	audioButton.className = 'right a' + audioMode;
}

function onConnection (type, user, details) {
	var level = levelManager.getCurrentLevel(), end, id, time, msg;
	switch (type) {
	case 'start':
		startPage.hidden = true;
		waitPage.hidden = true;
		switchButton.className = ['yellow', 'blue'][user];
		events.start(connection);
		levelManager.init();
		Object.keys(solvedLevels).forEach(function (id) {
			levelManager.markSolved(id, solvedLevels[id]);
		});
		connection.msg('unlock', {data: solvedLevelCount()});
		if (supportsMonetization()) {
			connection.msg('unlock', {data: 'bonus'});
		}
		break;
	case 'end':
		events.stop();
		if (user === connection.getUser()) {
			if (level) {
				levelManager.abortLevel();
			}
			levelManager.end();
			startPage.hidden = false;
		} else {
			connection = new LocalConnection(onConnection, connection.getUser());
			overlay.modal('The other user quit. You can continue to play alone.', function () {});
			events.start(connection);
		}
		break;
	case 'switch-user':
		audio.sound('switch');
		switchButton.className = ['yellow', 'blue'][user];
		if (level) {
			level.setUser(user);
		}
		break;
	case 'move':
		if (level && !level.getState()) {
			level.move(user, details.x, details.y);
			end = level.getState();
			if (end) {
				time = level.stop();
				audio.sound(end === 1 ? 'win' : 'die');
				msg = results[end - 2];
				if (end === 1) {
					id = levelManager.getCurrentLevelId();
					msg = 'Level solved again!';
					if (!solvedLevels[id] || solvedLevels[id] > time) {
						msg = solvedLevels[id] ? 'Level solved faster than before!' : 'Level solved!';
						solvedLevels[id] = time;
						storage.set('solved', solvedLevels);
						levelManager.markSolved(id, time);
						connection.msg('unlock', {data: solvedLevelCount()});
					}
				}
				overlay.info('');
				overlay.modal(msg, function () {
					connection.msg('continue');
				});
			}
		}
		break;
	case 'restart':
		if (level && !level.getState()) {
			audio.sound('restart');
			if (user !== connection.getUser()) {
				overlay.info('Level restarted by other user');
			}
			level.stop();
			level.start(connection.getUser());
		}
		break;
	case 'continue':
		if (level && level.getState()) {
			if (level.getState() > 1) {
				level.start(connection.getUser());
			} else {
				levelManager.runNextLevel(connection.getUser());
			}
		}
		break;
	case 'select':
		if (!level) {
			if (user !== connection.getUser()) {
				overlay.info('Level selected by other user');
			}
			levelManager.runLevel(details.level, connection.getUser());
		}
		break;
	case 'abort':
		if (level && !level.getState()) {
			if (user !== connection.getUser()) {
				overlay.info('Level aborted by other user');
			}
			levelManager.abortLevel();
		}
		break;
	case 'unlock':
		if (details.data === 'bonus') {
			overlay.info(
				supportsMonetization() ?
					'Bonus levels unlocked. Thank you for your support!' :
					'Bonus levels unlocked by other user'
			);
		}
		levelManager.unlock(details.data);
	}
}

function init () {
	audioMode++;
	toggleAudioMode();
	audioButton.addEventListener('click', toggleAudioMode);

	document.getElementById('alone').addEventListener('click', function () {
		connection = new LocalConnection(onConnection);
	});
	document.getElementById('friend').addEventListener('click', function () {
		startPage.hidden = true;
		codePage.hidden = false;
	});
	document.getElementById('random').addEventListener('click', function () {
		startPage.hidden = true;
		waitPage.hidden = false;
		connection = new SocketConnection(onConnection);
	});
	document.getElementById('connect').addEventListener('click', function () {
		codePage.hidden = true;
		waitPage.hidden = false;
		connection = new SocketConnection(onConnection, document.getElementById('input').value);
	});
	document.getElementById('back').addEventListener('click', function () {
		codePage.hidden = true;
		startPage.hidden = false;
	});
	document.getElementById('cancel').addEventListener('click', function () {
		connection.close();
		waitPage.hidden = true;
		startPage.hidden = false;
	});

	//if we don't have a server just run in one player mode
	if (!SocketConnection.isAvailable()) {
		connection = new LocalConnection(onConnection);
	}
}

init();

})();})()
