JS = game-lib/client.js res/global.js res/overlay.js res/events.js res/draw.js res/tile.js res/movable.js res/room.js res/level.js res/game.js
GLOBAL = SocketConnection, LocalConnection, GRID_SIZE, GRID_WIDTH, GRID_HEIGHT, overlay, events, draw, Tile, Movable, Room, Level

.PHONY: check
check: dist.zip
	@echo
	@echo "Current size:"
	@wc -c dist.zip

min/all.js: $(JS)
	(echo "(function(){var $(GLOBAL);" && cat $(JS) && echo "})()") > min/all.js

min/min.js: min/all.js
	minify-js min/all.js > min/min.js

#based on xem's mini minifier
min/min.css: res/game.css
	tr '\t\n\r' ' ' < res/game.css | sed -e's/\(\/\*[^*]\+\*\/\| \)\+/ /g' | sed -e's/^ \|\([ ;]*\)\([^a-zA-Z0-9:*.#"()% -]\)\([ ;]*\)\|\*\?\(:\) */\2\4/g' > min/min.css

public/server.js: game-lib/server.js
	minify-js game-lib/server.js > public/server.js

public/index.html: min/min.js min/min.css index.html
	sed -f modify.sed index.html > public/index.html

dist.zip: public/server.js public/index.html
	cd public && zip -9 ../dist.zip server.js index.html

.PHONY: clean
clean:
	find . -name '*~' -delete
	rm min/all.js min/min.js min/min.css dist.zip

.PHONY: lint
lint:
	jshint -a $(JS)
	jscs -a $(JS)