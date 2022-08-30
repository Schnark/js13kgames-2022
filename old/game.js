function Game (config) {
	var i;
	this.connection = config.connection;
	this.painter = config.painter;
	this.callback = config.callback;

	this.currentPlayer = config.player === -1 ? 0 : config.player;
	this.painter.setPlayer(this.currentPlayer);
	this.players = [];
	for (i = 0; i < (config.playerCount || 2); i++) {
		this.players.push(new Player(i));
	}
	this.canSwitchPlayer = config.player === -1;

	this.connection.onMsg = function (data) {
		this.onMsg(data.type, data.player, data.data);
	}.bind(this);
	this.setLevel(null);
}

Game.prototype.setLevel = function (level) {
	if (level) {
		this.callback('levelstart', level);
		this.painter.show('init');
	}
	this.painter.setLevel(level);

	this.level = level;
	if (level) {
		this.level.setPlayers(this.players);
		this.level.setCallback(this.onWin.bind(this), this.onDie.bind(this));
	}

	this.ready = this.players.map(function () {
		return false;
	});
	if (level) {
		this.sendMsg('ready');
	}
};

Game.prototype.restartLevel = function (type, details) {
	this.painter.show(type, details);
	this.level.init();

	this.ready = this.players.map(function () {
		return false;
	});
	this.sendMsg('ready');
};

Game.prototype.onWin = function () {
	var level = this.level;
	this.painter.show('win');
	this.setLevel(null);
	this.callback('levelend', level);
};

Game.prototype.onDie = function (player, type) {
	this.restartLevel(player === this.currentPlayer ? 'die-self' : 'die-other', {
		type: type,
		player: player
	});
};

Game.prototype.onMsg = function (type, player, data) {
	var level;
	if (type === 'disconnect') {
		this.onDisconnect();
		return;
	}
	if (type === 'level') {
		if (!this.level) {
			level = new Level(data.level);
			this.setLevel(level);
		}
		return;
	}
	if (type === 'ready') {
		this.ready[player] = true;
		return;
	}
	if (!this.ready[player]) {
		return;
	}
	if (type === 'restart') {
		this.restartLevel(player === this.currentPlayer ? 'restart-self' : 'restart-other', {
			player: player
		});
		return;
	}
	if (type === 'say') {
		data.player = player;
		this.players.forEach(function (p, i) {
			if (i !== player) {
				p.onMsg('hear', data);
			}
		});
		return;
	}
	this.players[player].onMsg(type, data);
};

Game.prototype.onDisconnect = function () {
	this.callback('disconnect');
};

Game.prototype.resumeLocal = function () {
	this.connection = new LocalConnection();
	this.canSwitchPlayer = true;
	this.connection.onMsg = this.onMsg.bind(this);
};

Game.prototype.sendMsg = function (type, data) {
	if (type === 'switch') {
		if (this.canSwitchPlayer && data.player < this.players.length) {
			this.currentPlayer = data.player;
			this.painter.show('switch');
			this.painter.setPlayer(this.currentPlayer);
		}
		return;
	} else if (type === 'disconnect') {
		this.connection.close();
		this.setLevel(null);
		return;
	}
	this.connection.send({
		type: type,
		player: this.currentPlayer,
		data: data
	});
};


//show a menu, let the user choose a game type
//create a connection:
var connection = new Connection({
	id: 'foo', //will only connect to users with same id
	playerCount: 2, //2 is default
	callback: onConnectionReady
});
//show a waiting screen, you can call connection.close() if you want to cancel
//also create a painter:
var painter = new Painter(canvas);
//once the connection is ready, this will be called:
function onConnectionReady (player) {
	//create a new game:
	var game = new Game({
		connection: connection,
		painter: painter,
		player: player, //pass on what you got
		playerCount: 2, //as above
		callback: gameCallback
	});
	//set up event handlers, call game.sendMsg(type, data)
	//e.g.
	//game.sendMsg('say', {msg: 'Hello'}) when the user uses the chat
	//game.sendMsg('restart') when the user restarts the current level
	//game.sendMsg('switch', {player: 1}) when the user switches to player 1 (just always call this, even if the game isn't local, so he can't switch)
	//game.sendMsg('move', {dir: 'up'}) when the user moves up (or tries to), you can use any type and data to do so and to handle other commands

	//either show a level selection screen or just select a level
	//game.sendMsg('level', {level: 0});

	function gameCallback (type, level) {
		switch (type) {
		case 'levelstart': //a level started, hide any menu and show the canvas
		case 'levelend': //a level ended, pause a bit for the end screen, then either show the level selection screen or just select the next level, or end the game
		case 'disconnect': //a player disconnected, either end the game by calling game.sendMsg('disconnect') and show the main menu again (or simply reload the page), or call game.resumeLocal() to switch to a local game
		}
	}
};





function Painter (canvas) {
	this.canvas = canvas;
	Painter.rAF(this.draw.bind(this));
}

Painter.rAF = window.requestAnimationFrame || window.mozRequestAnimationFrame;

Painter.prototype.setLevel = function (level) {
	this.level = level;
};

Painter.prototype.setPlayer = function (player) {
	this.player = player;
};

Painter.prototype.show = function (type, details) {
	this.overlay = type;
	this.overlayData = details;
	this.overlayStart = false;
	this.overlayTime = this.getOverlayTime(type) || 1000;
};

Painter.prototype.getOverlayTime = function (type) {
	//TODO return how long a specific overlay should be shown (ms), defaults to 1s
};

Painter.prototype.draw = function (time) {
	if (!this.lastTime) {
		this.lastTime = time;
	}
	if (this.overlay && !this.overlayStart) {
		this.overlayStart = time;
	}
	if (this.overlay && this.overlayStart + this.overlayTime < time) {
		this.overlay = '';
	}
	this.drawLevel(this.level, this.player, this.overlay, time, time - this.lastTime);
	this.lastTime = time;
	Painter.rAF(this.draw.bind(this));
};

Painter.prototype.drawLevel = function (level, player, overlay, time, diff) {
	//TODO draw the level for player with an overlay at time (diff since last draw)
	//level can be null
	//player is the player number
	//overlay can be
	//'switch' (switch between players, player is already the new player)
	//'init' (start a new level, level is set already)
	//'win' (end a level, level is already null)
	//'restart-self', 'restart-other', 'die-self', 'die-other' (restart a level, this.overlayData has more details
}



function Player (n) {
	this.n = n;
}

Player.prototype.setLevel = function (level) {
	this.level = level;
};

Player.prototype.onMsg = function (type, data) {
	//TODO handle, type === 'move', type === 'hear'
	//level is in this.level, other players in this.level.players
	//call this.win() to win
	//this.die() to die (or with a reason this.die('fire'))
};

Player.prototype.win = function () {
	this.level.onWin();
};

Player.prototype.die = function (type) {
	this.level.onDie(this.n, type);
};




function Level (id) {
	this.id = id;
	this.create()
}

Level.prototype.create = function () {
	//TODO load the level from the id (this.id)
};

Level.prototype.init = function () {
	//TODO init the level and players (in this.players)
};

Level.prototype.setPlayers = function (players) {
	var level = this;
	this.players = players;
	this.players.forEach(function (player) {
		player.setLevel(level);
	});
	this.init();
};

Level.prototype.setCallback = function (onWin, onDie) {
	this.onWin = onWin;
	this.onDie = onDie;
};


//TODO make sure all messages are sent to .onMsg, even those before registering
function Connection (config) {
	//TODO
}

Connection.prototype.close = function () {
	//TODO
};

Connection.prototype.send = function (data) {
	//TODO
};



function LocalConnection (config) {
	this.open = true;
	if (config && config.callback) {
		window.setTimeout(function () {
			config.callback(-1);
		}, 0);
	}
}

LocalConnection.prototype.close = function () {
	this.open = false;
};

LocalConnection.prototype.send = function (data) {
	if (this.open && this.onMsg) {
		window.setTimeout(function () {
			this.onMsg(data);
		}.bind(this), 0);
	}
};