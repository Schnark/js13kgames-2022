/*global module*/
(function () {
"use strict";

var games = [];

function Game (id) {
	this.id = id;
	this.running = false;
	this.users = [];
}

Game.prototype.add = function (socket) {
	var game = this, user = this.users.length;
	this.users.push(socket);
	socket.on('disconnect', function () {
		game.end(user);
	});
	if (this.users.length === 2) {
		this.start();
	}
};

Game.prototype.start = function () {
	var game = this,
		details = {seed: Math.floor(Math.random() * 0x100000000)};
	this.running = true;
	this.users.forEach(function (socket, i) {
		socket.on('data', function (data) {
			game.msg(data);
		});
		socket.emit('start', JSON.stringify({user: i, details: details}));
	});
};

Game.prototype.msg = function (data) {
	this.users.forEach(function (socket) {
		socket.emit('data', data);
	});
};

Game.prototype.end = function (user) {
	if (this.running) {
		this.users.forEach(function (socket) {
			socket.emit('end', user);
			socket.disconnect(true);
		});
	}
	games.splice(games.indexOf(this), 1);
};

function getGameForId (id) {
	var i, game;
	for (i = 0; i < games.length; i++) {
		if (games[i].id === id && !games[i].running) {
			return games[i];
		}
	}
	game = new Game(id);
	games.push(game);
	return game;
}

function onNewConnection (socket) {
	socket.on('start', function (id) {
		var game = getGameForId(id);
		game.add(socket);
	});
}

module.exports = onNewConnection;
})();