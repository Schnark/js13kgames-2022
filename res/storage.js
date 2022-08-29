/*global storage: true*/
storage =
(function () {
"use strict";

//TODO sessionStorage -> localStorage
var data = {
	solved: {}
}, storageKey = 'schnark-js13k-2022';

try {
	data = JSON.parse(sessionStorage.getItem(storageKey) || 'x');
} catch (e) {
}

function get (key) {
	return data[key];
}

function set (key, value) {
	data[key] = value;
	try {
		sessionStorage.setItem(storageKey, JSON.stringify(data));
	} catch (e) {
	}
}

return {
	get: get,
	set: set
};
})();