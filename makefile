JS = game-lib/client.js res/global.js res/storage.js res/overlay.js res/events.js res/audio.js res/draw.js res/tile.js res/movable.js res/room.js res/level.js res/level-data.js res/level-manager.js res/game.js
GLOBAL = SocketConnection, LocalConnection, GRID_SIZE, GRID_WIDTH, GRID_HEIGHT, storage, overlay, events, audio, draw, Tile, Movable, Room, Level, levelData, levelManager

.PHONY: check
check: dist.zip
	@echo
	@echo "Current size:"
	@wc -c dist.zip

build/all.js: $(JS)
	(echo "(function(){var $(GLOBAL);" && cat $(JS) && echo "})()") > build/all.js

build/min.js: build/all.js
	minify-js build/all.js > build/min.js

#based on xem's mini minifier
build/min.css: res/game.css
	tr '\t\n\r' ' ' < res/game.css | sed -e's/\(\/\*[^*]\+\*\/\| \)\+/ /g' | sed -e's/^ \|\([ ;]*\)\([^a-zA-Z0-9:*.#"()% -]\)\([ ;]*\)\|\*\?\(:\) */\2\4/g' > build/min.css

public/server.js: game-lib/server.js
	minify-js game-lib/server.js > public/server.js

public/index.html: build/min.js build/min.css index.html
	sed -f modify.sed index.html > public/index.html

dist.zip: public/server.js public/index.html
	cd public && zip -9 ../dist.zip server.js index.html

.PHONY: clean
clean:
	find . -name '*~' -delete
	rm build/all.js build/min.js build/min.css dist.zip

.PHONY: lint
lint:
	jshint -a $(JS)
	jscs -a $(JS)