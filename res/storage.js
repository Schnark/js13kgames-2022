/*global storage: true*/
storage =
(function () {
"use strict";

var data = {
	solved: {},
	audio: 2
}, storageKey = 'schnark-js13k-2022';

try {
	data = JSON.parse(localStorage.getItem(storageKey) || 'x');
} catch (e) {
}

function get (key) {
	return data[key];
}

function set (key, value) {
	data[key] = value;
	try {
		localStorage.setItem(storageKey, JSON.stringify(data));
	} catch (e) {
	}
}

return {
	get: get,
	set: set
};
})();