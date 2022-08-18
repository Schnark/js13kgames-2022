/*global Level: true*/
/*global Room, Movable, events, draw*/

Level =
(function () {
"use strict";

function Level (data) {
	this.data = data;
}

Level.prototype.init = function () {
	//TODO
	this.room = new Room();
	this.yellow = new Movable('yellow', 0, this.data === 0 ? 0 : 14);
	this.blue = new Movable('blue', 9, this.data === 0 ? 14 : 0);
	this.death = new Movable('death', 4, 7);
	this.room.addMovable(this.yellow);
	this.room.addMovable(this.blue);
	this.room.addMovable(this.death);
};

Level.prototype.start = function (connection) {
	events.start(connection);
	draw.start(this.room.draw.bind(this.room));
	this.state = false;
};

Level.prototype.stop = function () {
	events.stop();
	draw.stop();
};

Level.prototype.getState = function () {
	return this.state;
};

Level.prototype.move = function (user, dx, dy) {
	var moved;

	function movePlayer (player) {
		var x, y;
		x = player.x + dx;
		y = player.y + dy;
		if (player.canMoveTo(x, y)) {
			player.moveTo(x, y);
			return true;
		}
	}

	if (this.state) {
		return;
	}
	moved = movePlayer(user === 0 ? this.yellow : this.blue);
	this.state = this.checkEnd();
	if (moved && !this.state) {
		movePlayer(this.death); //TODO
		this.state = this.checkEnd();
	}
};

Level.prototype.checkEnd = function () {
	function isAdjacent (a, b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;
	}

	if (isAdjacent(this.yellow, this.death)) {
		return 'Yellow died!';
	}
	if (isAdjacent(this.blue, this.death)) {
		return 'Blue died!';
	}
	if (isAdjacent(this.yellow, this.blue)) {
		return 'You win!';
	}
};

return Level;
})();