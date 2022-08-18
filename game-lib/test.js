/*global LocalConnection, SocketConnection*/
(function () {
"use strict";

var connection, log, startButton, sendButton, stopButton, switchButton, codeInput, typeInput, detailsInput;

function htmlEscape (str) {
	return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
		.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function callback (type, user, details) {
	log.innerHTML += '<li><code>' + htmlEscape(type) + '</code> (' + htmlEscape(user) + '): ' +
		htmlEscape(JSON.stringify(details)) + '</li>';
	if (type === 'start') {
		sendButton.disabled = false;
	}
	if (type === 'end') {
		sendButton.disabled = true;
		stopButton.disabled = true;
		switchButton.disabled = true;
		startButton.disabled = false;
		connection = false;
	}
}

function onStart () {
	var code = codeInput.value;
	if (code === 'local') {
		connection = new LocalConnection(callback);
		switchButton.disabled = false;
	} else {
		connection = new SocketConnection(callback, code);
	}
	startButton.disabled = true;
	stopButton.disabled = false;
}

function onSend () {
	var type = typeInput.value;
	if (type) {
		connection.msg(type, detailsInput.value);
	}
}

function onStop () {
	connection.close();
	stopButton.disabled = true;
	switchButton.disabled = true;
	startButton.disabled = false;
	connection = false;
}

function onSwitch () {
	connection.switchUser(1 - connection.getUser());
}

function init () {
	log = document.getElementById('log');
	startButton = document.getElementById('start');
	sendButton = document.getElementById('send');
	sendButton.disabled = true;
	stopButton = document.getElementById('stop');
	stopButton.disabled = true;
	switchButton = document.getElementById('switch');
	switchButton.disabled = true;
	codeInput = document.getElementById('code');
	typeInput = document.getElementById('type');
	detailsInput = document.getElementById('details');

	if (!SocketConnection.isAvailable()) {
		codeInput.value = 'local';
		codeInput.disabled = true;
	}

	startButton.addEventListener('click', onStart);
	sendButton.addEventListener('click', onSend);
	stopButton.addEventListener('click', onStop);
	switchButton.addEventListener('click', onSwitch);
}

init();

})();