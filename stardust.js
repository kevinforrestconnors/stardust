


;(function () {
	function main() {
		window.requestAnimationFrame(main);

		drawMap(game.levelState);

		if (game.player.falling) {
			drawHero(3, 0, 40, 50, game.player.position.x, game.player.position.y);
			game.player.position.y += 1/40;
			console.log(Math.floor(game.player.position.y))

			var blockY = Math.floor(game.player.position.y);

			if (game.levelState) {

			}

		} else {
			drawHero(0, 0, game.player.position.x, game.player.position.y);
		}

		
		
		
	}

	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");


	var mapCodes = {
		0: {
			name: "Empty Space",
			spriteX: 0,
			spriteY: 0,
			blocking: false
		},
		1: {
			name: "Eraseable Star-wall",
			spriteX: 2,
			spriteY: 1,
			blocking: true
		},
		2: {
			name: "Indestructible Star-wall",
			spriteX: 1,
			spriteY: 1,
			blocking: true
		},
		3: {
			name: "Entrance Portal",
			spriteX: 3,
			spriteY: 9,
			blocking: false
		},
		4: {
			name: "Exit Portal",
			spriteX: 3,
			spriteY: 10,
			blocking: true
		},
	}

	var levels = {
		1:  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,2,2,0,2,0,0,0,0,0,0,
			0,0,0,0,1,1,2,4,0,2,1,1,0,0,0,0,
			0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,
			0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,
			0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,
			0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	}

	var game = {
		level: 1,
		levelState: [],
		player: {
			position: {
				x: 0,
				y: 0
			},
			falling: true
		}
	}

	function drawTile(tileX, tileY, desX, desY) {
		var spriteSize = 40;
		ctx.drawImage(sprite, tileX * spriteSize, tileY * spriteSize, spriteSize, spriteSize, desX * spriteSize, desY * spriteSize, spriteSize, spriteSize);
	}

	function drawHero(tileX, tileY, sX, sY, desX, desY) {
		if (!sX) {sX = 40}
		if (!sY) {sY = 40}
		ctx.drawImage(playerSprite, tileX * sX, tileY * sY, sX, sY, desX * sX, desY * sY, sX, sY);
	}

	function drawMap(map) {

		var i = 0, j = 0;

		for (i = 0; i < 16 * 12; i++) {
			
			var mapCode = map[i];

			var tileX = mapCodes[mapCode].spriteX;
			var tileY = mapCodes[mapCode].spriteY;

			if (i % 16 == 0 && i != 0) {
				j++;
			}

			drawTile(tileX, tileY, i % 16, j);

			if (mapCode == 3) { // Entrance Portal
				var startingPosition =  {
					x: i % 16,
					y: j
				}
			}
		}

		return startingPosition;

	}
  	
	// Load Tiles
	var sprite = new Image();
	sprite.src = 'assets/XYTILES.JPG';
	var spriteLoaded = false;
	sprite.onload = function() {
		spriteLoaded = true;
	}

	var playerSprite = new Image();
	playerSprite.src = 'assets/XYHERO.JPG'
	var playerLoaded = false;
	playerSprite.onload = function() {
		playerLoaded = true;
		if (spriteLoaded) {
			game.player.position = drawMap(levels[game.level]);
			game.levelState = levels[game.level].slice(0, levels[game.level].length);
			main();
		}
	}

})();


