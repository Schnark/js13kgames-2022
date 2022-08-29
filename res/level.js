/*global Level: true*/
/*global GRID_WIDTH, GRID_HEIGHT, Room, events, draw, overlay*/

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
	} else if (tile.type === 'teleport') {
		if (enterLeave) {
			tile = tile.data;
			if (!this.rooms[tile[2]].isOccupied(tile[0], tile[1])) {
				this.rooms[tile[2]].addMovable(player);
				player.moveTo(tile[0], tile[1], true);
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
})();