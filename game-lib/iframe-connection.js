/*global SocketConnection: true, initServer: true*/
//intentionally SocketConnection instead of IframeConnection, to replace it for debugging
SocketConnection =
(function () {
"use strict";

function IframeConnection (callback) {
	window.addEventListener('message', function (e) {
		var data = JSON.parse(e.data);
		if (data.type === 'start') {
			this.user = data.user;
		}
		callback(data.type, data.user, data.details);
	}.bind(this));
	window.parent.postMessage('', '*');
}

IframeConnection.isAvailable = function () {
	return window !== window.parent;
};

IframeConnection.prototype.switchUser = function () {
	//noop
};

IframeConnection.prototype.getUser = function () {
	return this.user;
};

IframeConnection.prototype.msg = function (type, details) {
	if (this.user !== undefined) {
		window.parent.postMessage(JSON.stringify({type: type, user: this.user, details: details}), '*');
	}
};

IframeConnection.prototype.close = function () {
	//this will actually not close anything, and will send a message even if not yet started
	//but the differences shouldn't occur in practise
	window.parent.postMessage(JSON.stringify({type: 'end', user: this.user, details: {}}), '*');
};

return IframeConnection;
})();

initServer =
(function () {
"use strict";

var clients = [];

function initClient (client) {
	var details;
	clients.push(client);
	if (clients.length === 2) {
		details = {seed: Math.floor(Math.random() * 0x100000000)};
		clients[0].postMessage(JSON.stringify({type: 'start', user: 0, details: details}), '*');
		clients[1].postMessage(JSON.stringify({type: 'start', user: 1, details: details}), '*');
		clients[0].addEventListener('unload', function () {
			onEnd(0);
		});
		clients[1].addEventListener('unload', function () {
			onEnd(1);
		});
	}
}

function onEnd (user) {
	clients[0].postMessage(JSON.stringify({type: 'end', user: user, details: {}}), '*');
	clients[1].postMessage(JSON.stringify({type: 'end', user: user, details: {}}), '*');
}

function initServer () {
	window.addEventListener('message', function (e) {
		if (clients.length < 2) {
			initClient(e.source);
		} else {
			clients[0].postMessage(e.data, '*');
			clients[1].postMessage(e.data, '*');
		}
	});
}

return initServer;
})();