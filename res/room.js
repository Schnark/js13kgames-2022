/*global Room: true*/
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
})();