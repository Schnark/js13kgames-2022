/*global Movable: true*/
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
})();