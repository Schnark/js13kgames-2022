/*global Tile: true*/
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
	//ctx.lineWidth = 2;
	ctx.strokeStyle = '#ffc';
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
})();