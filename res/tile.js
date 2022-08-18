/*global Tile: true*/
/*global GRID_SIZE*/
Tile =
(function () {
"use strict";

var animationDurations = {
		grass: 5 * 1000
	},
	drawFunctions = {},
	stateSpeed = 1 / 1000; //TODO

drawFunctions.grass = function (ctx, time) {
	//var i, j;
	ctx.fillStyle = '#060';
	ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
	/*ctx.strokeStyle = '#040';
	ctx.beginPath();
	for (i = 0; i < 3; i++) {
		for (j = 0; j < 3; j++) {
			ctx.moveTo((i + 1) / 4 * GRID_SIZE, (j + 1) / 4 * GRID_SIZE);
			ctx.lineTo((i + 1 + Math.sin(time * Math.PI / 50) / 3) / 4 * GRID_SIZE, (j + 0.5) / 4 * GRID_SIZE);
		}
	}
	ctx.stroke();*/
};

function Tile (type, state) {
	this.type = type;
	this.state = state || 0;
	this.drawState = this.state;
	this.animationTime = 0;
}

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