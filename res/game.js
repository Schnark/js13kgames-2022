/*global SocketConnection, LocalConnection, storage, levelManager, events, overlay*/
(function () {
"use strict";

var connection,
	switchButton = document.getElementById('switch'),
	solvedLevels = storage.get('solved', {}),
	results = [
		'You win!',
		'Yellow died!', 'Blue died!',
		'Yellow burnt!', 'Blue burnt!',
		'Yellow was crushed in a closing door!', 'Blue was crushed in a closing door!',
		'Yellow got stuck in a teleporter!', 'Blue got stuck in a teleporter!'
	];

function pad (n) {
	return n < 10 ? '0' + n : n;
}

function formatTime (s) {
	return Math.floor(s / 60) + ':' + pad(s % 60);
}

function supportsMonetization () {
	//TODO add tag
	return location.search === '?monetization-cheater' ||
		(document.monetization && document.monetization.state === 'started');
}

function solvedLevelCount () {
	return Object.keys(solvedLevels).length;
}

function onConnection (type, user, details) {
	var level = levelManager.getCurrentLevel(), end, id, time, formattedTime, msg;
	switch (type) {
	case 'start':
		switchButton.className = ['yellow', 'blue'][user];
		events.start(connection);
		levelManager.init();
		Object.keys(solvedLevels).forEach(function (id) {
			levelManager.markSolved(id, formatTime(solvedLevels[id]));
		});
		connection.msg('unlock', {data: solvedLevelCount()});
		if (supportsMonetization()) {
			connection.msg('unlock', {data: 'bonus'});
		}
		break;
	case 'end':
		events.stop();
		if (user === connection.getUser()) {
			if (level) {
				levelManager.abortLevel();
			}
			//TODO hide level selection
		} else {
			overlay.modal('The other user quit. You can continue to play alone.', function () {});
			connection = new LocalConnection(onConnection, connection.getUser());
			events.start(connection);
		}
		break;
	case 'switch-user':
		switchButton.className = ['yellow', 'blue'][user];
		if (level) {
			level.setUser(user);
		}
		break;
	case 'move':
		if (level && !level.getState()) {
			level.move(user, details.x, details.y);
			end = level.getState();
			if (end) {
				time = level.stop();
				msg = results[end - 1];
				if (end === 1) {
					id = levelManager.getCurrentLevelId();
					formattedTime = formatTime(time);
					msg += ' (' + formattedTime + ')';
					if (!solvedLevels[id] || solvedLevels[id] > time) {
						solvedLevels[id] = time;
						storage.set('solved', solvedLevels);
						levelManager.markSolved(id, formattedTime);
						connection.msg('unlock', {data: solvedLevelCount()});
					}
				}
				overlay.info('');
				overlay.modal(msg, function () {
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
			level.start(connection.getUser());
		}
		break;
	case 'continue':
		if (level && level.getState()) {
			if (level.getState() > 1) {
				level.start(connection.getUser());
			} else {
				levelManager.runNextLevel(connection.getUser());
			}
		}
		break;
	case 'select':
		if (!level) {
			if (user !== connection.getUser()) {
				overlay.info('Level selected by other user');
			}
			levelManager.runLevel(details.level, connection.getUser());
		}
		break;
	case 'abort':
		if (level && !level.getState()) {
			if (user !== connection.getUser()) {
				overlay.info('Level aborted by other user');
			}
			levelManager.abortLevel();
		}
		break;
	case 'unlock':
		if (details.data === 'bonus' && !supportsMonetization()) {
			overlay.info('Bonus levels unlocked by other user');
		}
		levelManager.unlock(details.data);
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