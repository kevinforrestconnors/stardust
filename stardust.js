


//;(function () {
	function main() {

		drawMap(game.levelState);

		if (game.player.state == "standing") {

			console.log(getTileBelow().blocking)


			if (getTileBelow().blocking) {
				drawHero(0, 0, 40, 40, game.player.pos.x, game.player.pos.y);
			} else {
				playerFall();
				drawHero(3, 0.2, 40, 40, game.player.pos.x, game.player.pos.y + game.player.animationOffet.y);
			}
		} else if (game.player.state == "falling") {

			 /* Can change direction mid-air */
			 if (game.keysDown.A) {
			 	game.player.direction = "left";
			 } else if (game.keysDown.D) {
			 	game.player.direction = "right";
			 }
			
			game.player.animationStep++;

			game.player.animationOffet.y = game.player.animationStep * 1/25;

			drawHero(3, 0.2, 40, 40, game.player.pos.x, game.player.pos.y + game.player.animationOffet.y);

			// Gone down a square; switch based on where we are
			if (game.player.animationStep == 25) {

				game.player.animationStep = 0;
				game.player.animationOffet.y = 0;
				game.player.pos.y++;

				drawHero(3, 0.2, 40, 40, game.player.pos.x, game.player.pos.y + game.player.animationOffet.y);
				
				if (game.player.pos.y > 11) {
					//Play(SND_FALL, FALSE, TRUE);
					console.log("dead"); //pStep = 0; PlayerErase();
				// } else if(map[px][py].id == TL_WARP) {
				// 	//Play(SND_WARP, FALSE, TRUE);
				// 	pStep = 0; PlayerErase();
				} else {
					playerStand();
				}
			}

		} else {
			drawHero(0, 0, 40, 40, game.player.pos.x, game.player.pos.y);
		}

		window.requestAnimationFrame(main);
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
		1: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,2,2,0,2,0,0,0,0,0,0],
			[0,0,0,0,1,1,2,4,0,2,1,1,0,0,0,0],
			[0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
			[0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],
			[0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0],
			[0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
	}

	var game = {
		level: 1,
		levelState: [],
		player: {
			pos: {
				x: 0,
				y: 0
			},
			direction: "right",
			state: "standing",
			animationStep: 0,
			animationOffet: {
				x: 0,
				y: 0,
			}
		},
		keysDown: {
			W: false,
			A: false,
			S: false, 
			D: false
		}
	}

	function playerFall() {
		game.player.state = "falling";
	}

	function playerStand() {
		game.player.state = "standing";
	}

	function playerWalkLeft() {
		game.player.state = "walkLeft";
	}

	function playerWalkRight() {
		game.player.state = "walkRight";
	}

	function getCurrentTile() {
		return mapCodes[game.levelState[game.player.pos.y][game.player.pos.x]];
	}

	function getTileBelow() {
		return mapCodes[game.levelState[game.player.pos.y + 1][game.player.pos.x]];
	}

	function drawTile(tileX, tileY, desX, desY) {
		var spriteSize = 40;
		ctx.drawImage(sprite, tileX * spriteSize, tileY * spriteSize, spriteSize, spriteSize, desX * spriteSize, desY * spriteSize, spriteSize, spriteSize);
	}

	function drawHero(tileX, tileY, sX, sY, desX, desY) {
		if (game.player.direction == "right") {
			ctx.drawImage(playerSprite, tileX * sX, tileY * sY, sX, sY, desX * sX, desY * sY, sX, sY);
		} else {
			ctx.drawImage(playerSprite, (11 - tileX) * sX, tileY * sY, sX, sY, desX * sX, desY * sY, sX, sY);
		}
		
	}

	function drawMap(map) {

		var i = 0, j = 0;

		for (i = 0; i < 12; i++) {
			for (j = 0; j < 16; j++) {
				
				var mapCode = map[i][j];

				var tileX = mapCodes[mapCode].spriteX;
				var tileY = mapCodes[mapCode].spriteY;

				drawTile(tileX, tileY, j, i);

				if (mapCode == 3) { // Entrance Portal
					var startingPos = {
						x: j,
						y: i
					}
				}
			}
		}

		return startingPos;

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
			game.player.pos = drawMap(levels[game.level]);
			game.levelState = levels[game.level].slice(0, levels[game.level].length);
			main();
		}
	}

	window.addEventListener("keydown", function(e) {

		switch(e.keyCode) {
			case 65: // A
				if (game.player.state == "standing") {
					playerWalkLeft();
				}
				game.keysDown.A = true;
				break;
			case 68: // D
				if (game.player.state == "standing") {
					playerWalkRight();	
				}
				game.keysDown.D = true;
				break;
		}

	}, true);

	window.addEventListener("keyup", function(e) {

		switch(e.keyCode) {
			case 65: // A
				game.keysDown.A = false;
				break;
			case 68:
				game.keysDown.D = false;
				break;
		}

	}, true);

//})();


