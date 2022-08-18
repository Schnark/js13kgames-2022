/*global SocketConnection, LocalConnection, Level, overlay*/
(function () {
"use strict";

var connection, level = new Level(0);

function onConnection (type, user, details) {
	var end;
	switch (type) {
	case 'start':
		//TODO
		level.init();
		level.start(connection);
		break;
	case 'end':
		//TODO
		level.stop();
		break;
	case 'move':
		if (level && !level.getState()) {
			level.move(user, details.x, details.y);
			end = level.getState();
			if (end) {
				level.stop();
				overlay.modal(end, function () {
					connection.msg('continue');
				});
			}
		}
		break;
	case 'restart':
		if (level && !level.getState()) {
			if (user !== connection.getUser()) {
				overlay.info('Level restarted by other user');
			}
			level.stop();
			level.init();
			level.start(connection);
		}
		break;
	case 'continue':
		if (level && level.getState()) {
			level.init();
			level.start(connection);
		}
		break;
	case 'select':
		if (!level) {
			if (user !== connection.getUser()) {
				overlay.info('Level selected by other user');
			}
			level = new Level(details.level);
		}
		//TODO
	}
}

function init () {
	if (SocketConnection.isAvailable()) {
		connection = new SocketConnection(onConnection);
	} else {
		connection = new LocalConnection(onConnection);
	}
}

init();

})();