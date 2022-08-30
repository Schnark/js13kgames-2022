/*global overlay: true*/
overlay =
(function () {
"use strict";

var modal = document.getElementById('modal'),
	modalText = document.getElementById('modal-text'),
	button = document.getElementById('modal-close'),
	info = document.getElementById('info'),
	infoText = document.getElementById('info-text'),
	modalCallback, infoTimeout;

button.addEventListener('click', function () {
	modalCallback();
	hideModal();
});

info.addEventListener('click', function () {
	hideInfo();
});

function showModal (text, callback) {
	if (modalCallback) {
		modalCallback();
	}
	modalText.textContent = text;
	modalCallback = callback;
	modal.style.display = 'block';
	button.focus();
}

function hideModal () {
	modal.style.display = '';
	modalCallback = false;
}

function showInfo (text, timeout) {
	if (!text) {
		hideInfo();
		return;
	}
	infoText.textContent = text;
	info.style.display = 'block';
	if (infoTimeout) {
		clearTimeout(infoText);
	}
	infoTimeout = setTimeout(hideInfo, (timeout || 3) * 1000);
}

function hideInfo () {
	if (infoTimeout) {
		clearTimeout(infoTimeout);
		infoTimeout = false;
	}
	info.style.display = '';
}

return {
	modal: showModal,
	info: showInfo
};
})();