/*global Movable: true*/
/*global GRID_SIZE*/
Movable =
(function () {
"use strict";

var animationDurations = {
		yellow: 10 * 1000,
		blue: 12 * 1000,
		death: 50 * 1000
	},
	drawFunctions = {},
	speed = 1 / 200; //TODO

function drawEye (ctx, x, y, r) {
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#000';
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#000';
	ctx.beginPath();
	ctx.arc(x, y - r / 3, r / 3, 0, 2 * Math.PI);
	ctx.fill();
}

drawFunctions.yellow = function (ctx, time) {
	ctx.translate(GRID_SIZE / 2, GRID_SIZE / 2);
	if (time > 50 && time < 55) {
		ctx.rotate(0.2 * Math.sin((time - 50) * Math.PI / 2.5));
	}
	ctx.fillStyle = '#ff0';
	ctx.fillRect(-2 * GRID_SIZE / 5, -2 * GRID_SIZE / 5, GRID_SIZE * 4 / 5, GRID_SIZE * 4 / 5);
	drawEye(ctx, -GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10);
	drawEye(ctx, GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10);
};

drawFunctions.blue = function (ctx, time) {
	ctx.translate(GRID_SIZE / 2, GRID_SIZE / 2);
	if (time > 60 && time < 70) {
		ctx.rotate(Math.sin((time - 60) * Math.PI / 5));
	}
	ctx.fillStyle = '#58f';
	ctx.beginPath();
	ctx.arc(0, 0, GRID_SIZE * 2 / 5, 0, 2 * Math.PI);
	ctx.fill();
	drawEye(ctx, -GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10);
	drawEye(ctx, GRID_SIZE / 5, -GRID_SIZE / 10, GRID_SIZE / 10);
};

drawFunctions.death = function (ctx, time) {
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#ccc';
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
	ctx.moveTo(0, -GRID_SIZE * 0.7);
	ctx.bezierCurveTo(GRID_SIZE / 3, -GRID_SIZE * 0.7, GRID_SIZE * 5 / 12, -GRID_SIZE / 2, GRID_SIZE * 5 / 12, -GRID_SIZE / 3);
	ctx.bezierCurveTo(GRID_SIZE * 5 / 12, -GRID_SIZE * 0.1, GRID_SIZE / 24, GRID_SIZE * 0.2, 0, GRID_SIZE * 0.2);
	ctx.bezierCurveTo(-GRID_SIZE / 24, GRID_SIZE * 0.2, -GRID_SIZE * 5 / 12, -GRID_SIZE * 0.1, -GRID_SIZE * 5 / 12, -GRID_SIZE / 3);
	ctx.bezierCurveTo(-GRID_SIZE * 5 / 12, -GRID_SIZE / 2, -GRID_SIZE / 3, -GRID_SIZE * 0.7, 0, -GRID_SIZE * 0.7);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = '#900';
	ctx.beginPath();
	ctx.arc(-GRID_SIZE / 5, -GRID_SIZE / 3, GRID_SIZE / 8, 0, 2 * Math.PI);
	ctx.arc(GRID_SIZE / 5, -GRID_SIZE / 3, GRID_SIZE / 8, 0, 2 * Math.PI);
	ctx.fill();
};

drawFunctions.box = function (ctx) {
	ctx.fillStyle = '#732';
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