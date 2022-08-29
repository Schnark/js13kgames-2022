/*global levelManager: true*/
/*global Level, levelData*/
levelManager =
(function () {
"use strict";

var levelSection = document.getElementById('levels'),
	gameSection = document.getElementById('game'),
	level, levelId, solvedLevels, bonusLevels, levels;

function pad (n) {
	return n < 10 ? '0' + n : n;
}

function formatTime (s) {
	return Math.floor(s / 60) + ':' + pad(s % 60);
}

function showLevelselect () {
	levelSection.hidden = false;
	gameSection.hidden = true;
}

function showGame () {
	levelSection.hidden = true;
	gameSection.hidden = false;
}

function generateHtml () {
	var html = [], i, j, level, button;
	levels = [];
	for (i = 0; i < levelData.length; i++) {
		html.push('<h2>' + levelData[i].title + '</h2>');
		html.push('<p>' + levelData[i].desc + '</p>');
		html.push('<p>');
		for (j = 0; j < levelData[i].levels.length; j++) {
			level = levelData[i].levels[j];
			button = (levels.length + 1) + '<br><span class="result">&nbsp;</span>';
			html.push('<button data-level="' + levels.length + '" disabled>' + button + '</button> ');
			levels.push({
				lock: levelData[i].lock,
				def: level
			});
		}
		html.push('</p>');
	}
	return html.join('');
}

function init () {
	solvedLevels = -1;
	bonusLevels = false;
	levelSection.innerHTML = generateHtml();
	unlock(0);
	showLevelselect();
}

function getLevelDefinition (id) {
	return levels[id].def;
}

function isAvailable (id) {
	var lock;
	if (!levels[id]) {
		return false;
	}
	lock = levels[id].lock;
	return lock === 'bonus' ? bonusLevels : lock <= solvedLevels;
}

function unlock (data) {
	var i;
	if (data === 'bonus') {
		if (!bonusLevels) {
			for (i = 0; i < levels.length; i++) {
				if (levels[i].lock === 'bonus') {
					document.querySelector('[data-level="' + i + '"]').disabled = false;
				}
			}
			bonusLevels = true;
		}
	} else {
		if (data > solvedLevels) {
			for (i = 0; i < levels.length; i++) {
				if (levels[i].lock > solvedLevels && levels[i].lock <= data) {
					document.querySelector('[data-level="' + i + '"]').disabled = false;
				}
			}
			solvedLevels = data;
		}
	}
}

function markSolved (id, time) {
	document.querySelector('[data-level="' + id + '"]').className = 'solved';
	document.querySelector('[data-level="' + id + '"] .result').textContent = formatTime(time);
}

function getNextLevelId (id) {
	return isAvailable(id + 1) ? id + 1 : -1;
}

function runNextLevel (user) {
	levelId = getNextLevelId(levelId);
	if (levelId === -1) {
		level = false;
		showLevelselect();
	} else {
		level = new Level(getLevelDefinition(levelId));
		level.start(user);
	}
}

function runLevel (id, user) {
	levelId = id;
	level = new Level(getLevelDefinition(levelId));
	level.start(user);
	showGame();
}

function abortLevel () {
	level.stop();
	levelId = -1;
	level = false;
	showLevelselect();
}

return {
	init: init,
	end: function () {
		levelSection.hidden = true;
	},
	getCurrentLevel: function () {
		return level;
	},
	getCurrentLevelId: function () {
		return levelId;
	},
	unlock: unlock,
	markSolved: markSolved,
	runNextLevel: runNextLevel,
	runLevel: runLevel,
	abortLevel: abortLevel
};
})();