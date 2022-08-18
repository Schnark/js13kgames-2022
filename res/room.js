/*global Room: true*/
/*global GRID_WIDTH, GRID_HEIGHT, Tile*/
Room =
(function () {
"use strict";

function Room () {
	var x, y, row;
	this.tiles = [];
	//TODO
	for (y = 0; y < GRID_HEIGHT; y++) {
		row = [];
		for (x = 0; x < GRID_WIDTH; x++) {
			row.push(new Tile('grass'));
		}
		this.tiles.push(row);
	}
	this.movables = [];
}

Room.prototype.addMovable = function (m) {
	this.movables.push(m);
	m.setRoom(this);
};

Room.prototype.getType = function (x, y) {
	if (y < 0 || y >= this.tiles.length) {
		return '';
	}
	if (x < 0 || x >= this.tiles[y].length) {
		return '';
	}
	return this.tiles[y][x].type;
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