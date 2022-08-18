/*global SocketConnection: true, LocalConnection: true*/
/*global io*/
SocketConnection =
(function () {
"use strict";

function SocketConnection (callback, id) {
	this.isOpen = false;
	this.socket = io({upgrade: false, transports: ['websocket']});
	this.socket.on('start', function (data) {
		data = JSON.parse(data);
		this.user = data.user;
		this.isOpen = true;
		callback('start', data.user, data.details);
	}.bind(this));
	this.socket.on('data', function (data) {
		data = JSON.parse(data);
		callback(data.type, data.user, data.details);
	});
	this.socket.on('end', function (user) {
		this.isOpen = false;
		callback('end', user, {});
		this.socket.disconnect();
	}.bind(this));
	this.socket.on('disconnect', function () {
		if (this.isOpen) {
			callback('end', this.user, {});
		}
		this.isOpen = false;
	}.bind(this));
	this.socket.on('connect', function () {
		this.socket.emit('start', id || '');
	}.bind(this));
}

SocketConnection.isAvailable = function () {
	return typeof io !== 'undefined';
};

SocketConnection.prototype.switchUser = function () {
	//noop
};

SocketConnection.prototype.getUser = function () {
	return this.user;
};

SocketConnection.prototype.msg = function (type, details) {
	if (this.user !== undefined) {
		this.socket.emit('data', JSON.stringify({type: type, user: this.user, details: details}));
	}
};

SocketConnection.prototype.close = function () {
	this.socket.disconnect(true);
};

return SocketConnection;
})();

LocalConnection =
(function () {
"use strict";

function LocalConnection (callback, user) {
	this.user = user || 0;
	this.callback = callback;
	if (user === undefined) {
		setTimeout(function () {
			callback('start', 0, {seed: Math.floor(Math.random() * 0x100000000)});
		}, 0);
	}
}

LocalConnection.prototype.getUser = function () {
	return this.user;
};

LocalConnection.prototype.switchUser = function (user) {
	if (this.user !== user) {
		this.user = user;
		this.callback('switch-user', this.user, {});
	}
};

LocalConnection.prototype.msg = function (type, data) {
	this.callback(type, this.user, data);
};

LocalConnection.prototype.close = function () {
	this.callback('end', this.user, {});
};

return LocalConnection;
})();