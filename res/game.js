/*global SocketConnection, LocalConnection, storage, levelManager, events, audio, overlay*/
(function () {
"use strict";

var connection,
	startPage = document.getElementById('start'),
	codePage = document.getElementById('code'),
	waitPage = document.getElementById('wait'),

	switchButton = document.getElementById('switch'),
	audioButton = document.getElementById('audio'),
	solvedLevels = storage.get('solved'),
	audioMode = storage.get('audio'),
	results = [
		'Yellow died!', 'Blue died!',
		'Yellow burnt!', 'Blue burnt!',
		'Yellow was crushed in a closing door!', 'Blue was crushed in a closing door!',
		'Yellow got stuck in a teleporter!', 'Blue got stuck in a teleporter!'
	];

function supportsMonetization () {
	return location.search === '?monetization-cheater' ||
		(document.monetization && document.monetization.state === 'started');
}

function solvedLevelCount () {
	return Object.keys(solvedLevels).length;
}

function toggleAudioMode () {
	audioMode = (audioMode + 2) % 3;
	storage.set('audio', audioMode);
	audio.setMode(audioMode);
	audioButton.className = 'right a' + audioMode;
}

function onConnection (type, user, details) {
	var level = levelManager.getCurrentLevel(), end, id, time, msg;
	switch (type) {
	case 'start':
		startPage.hidden = true;
		waitPage.hidden = true;
		switchButton.className = ['yellow', 'blue'][user];
		events.start(connection);
		levelManager.init();
		Object.keys(solvedLevels).forEach(function (id) {
			levelManager.markSolved(id, solvedLevels[id]);
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
			levelManager.end();
			startPage.hidden = false;
		} else {
			connection = new LocalConnection(onConnection, connection.getUser());
			overlay.modal('The other user quit. You can continue to play alone.', function () {});
			events.start(connection);
		}
		break;
	case 'switch-user':
		audio.sound('switch');
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
				audio.sound(end === 1 ? 'win' : 'die');
				msg = results[end - 2];
				if (end === 1) {
					id = levelManager.getCurrentLevelId();
					msg = 'Level solved again!';
					if (!solvedLevels[id] || solvedLevels[id] > time) {
						msg = solvedLevels[id] ? 'Level solved faster than before!' : 'Level solved!';
						solvedLevels[id] = time;
						storage.set('solved', solvedLevels);
						levelManager.markSolved(id, time);
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
			audio.sound('restart');
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
		if (details.data === 'bonus') {
			overlay.info(
				supportsMonetization() ?
					'Bonus levels unlocked. Thank you for your support!' :
					'Bonus levels unlocked by other user'
			);
		}
		levelManager.unlock(details.data);
	}
}

function init () {
	audioMode++;
	toggleAudioMode();
	audioButton.addEventListener('click', toggleAudioMode);

	document.getElementById('alone').addEventListener('click', function () {
		connection = new LocalConnection(onConnection);
	});
	document.getElementById('friend').addEventListener('click', function () {
		startPage.hidden = true;
		codePage.hidden = false;
	});
	document.getElementById('random').addEventListener('click', function () {
		startPage.hidden = true;
		waitPage.hidden = false;
		connection = new SocketConnection(onConnection);
	});
	document.getElementById('connect').addEventListener('click', function () {
		codePage.hidden = true;
		waitPage.hidden = false;
		connection = new SocketConnection(onConnection, document.getElementById('input').value);
	});
	document.getElementById('back').addEventListener('click', function () {
		codePage.hidden = true;
		startPage.hidden = false;
	});
	document.getElementById('cancel').addEventListener('click', function () {
		connection.close();
		waitPage.hidden = true;
		startPage.hidden = false;
	});

	//if we don't have a server just run in one player mode
	if (!SocketConnection.isAvailable()) {
		connection = new LocalConnection(onConnection);
	}
}

init();

})();