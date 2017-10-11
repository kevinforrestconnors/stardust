
var GLOBALS = {
	XYHEROwidth: 12,
	XYHEROheight: 9,
	
	XYTILESwidth: 6,
	XYTILESheight: 11,

	walkDuration: 20,
	fallDuration: 20,
	magicDuration: 40,
} 


//;(function () {
	function main() {

		drawMap(game.levelState);

		if (game.keysDown.Space) {
			if (game.player.state == "standing") {

				if (game.keysDown.W && !getTileAbove().blocking) {
					playerMagicUp()
				}
				else if (game.player.direction == "left") {
					playerMagicLeft();
				} else {
					playerMagicRight();
				}

			} else if (game.player.state == "crouching" && game.player.animationStep > 10) {

				if (game.player.direction == "left") {
					playerCrouchMagicLeft();
				} else {
					playerCrouchMagicRight();
				}

			}
		} 

		if (game.keysDown.A) {
			playerWalkLeft();
		}

		if (game.keysDown.D) {
			playerWalkRight();	
		} 

		if (game.keysDown.S) {
			if (game.player.state == "standing") {
				playerCrouch();
			}
		} else {
			if (game.player.state == "crouching") {
				playerStand();
			}
		}


		if (game.player.state == "standing") {

			if (getTileBelow().blocking) {
				playerStand();
				drawHero(0, 0, game.player.pos.x, game.player.pos.y);
			} else {
				playerFall();
				drawHero(3, 0.2, game.player.pos.x, game.player.pos.y + game.player.animationOffset);
			}

		} else if (game.player.state == "falling") {

			if (getCurrentTile().blocking) {
				console.error("This shouldn't happen!")
			}

			 /* Can change direction mid-air */
			 if (game.keysDown.A) {
			 	game.player.direction = "left";
			 } else if (game.keysDown.D) {
			 	game.player.direction = "right";
			 }
			
			game.player.animationStep++;

			game.player.animationOffset = game.player.animationStep / 20;

			drawHero(3, 0.2, game.player.pos.x, game.player.pos.y + game.player.animationOffset);

			// Gone down a square; switch based on where we are
			if (game.player.animationStep == GLOBALS.fallDuration) {

				game.player.animationStep = 0;
				game.player.animationOffset = 0;
				game.player.pos.y++;

				drawHero(3, 0.2, game.player.pos.x, game.player.pos.y + game.player.animationOffset);
				
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

		} else if (game.player.state == "walkRight") {

			game.player.animationStep++;

			game.player.animationOffset = game.player.animationStep / GLOBALS.walkDuration;

			drawHero(0.1 * (game.player.animationStep % 9), game.player.animationStep % 9, game.player.pos.x + game.player.animationOffset, game.player.pos.y);

			if (game.player.animationStep == GLOBALS.walkDuration) {
				game.player.animationStep = 0;
				game.player.animationOffset = 0;
				game.player.pos.x++;

				drawHero(0, 0, game.player.pos.x, game.player.pos.y);

				if (getTileBelow().blocking) {
					playerStand();
				} else {
					playerFall();
				}
				
			}

		} else if (game.player.state == "walkLeft") {

			game.player.animationStep++;
			game.player.animationOffset = game.player.animationStep / GLOBALS.walkDuration;
		
			drawHero(0.1 * (game.player.animationStep % 9), game.player.animationStep % 9, game.player.pos.x - game.player.animationOffset, game.player.pos.y);

			if (game.player.animationStep == GLOBALS.walkDuration) {
				game.player.animationStep = 0;
				game.player.animationOffset = 0;
				game.player.pos.x--;

				drawHero(0, 0, game.player.pos.x, game.player.pos.y);

				if (getTileBelow().blocking) {
					playerStand();
				} else {
					playerFall();
				}
				
			}

		} else if (game.player.state == "crouching") {

			game.player.animationStep++;

			if (game.player.animationStep >= 1 && game.player.animationStep <= 5) { // Player has just entered crouch
				drawHero(2, 6, game.player.pos.x, game.player.pos.y);
			} else if (game.player.animationStep >= 6 && game.player.animationStep <= 10) {
				drawHero(2, 7, game.player.pos.x, game.player.pos.y);
			} else {
				drawHero(2, 8, game.player.pos.x, game.player.pos.y);
			}

		} else if (game.player.state == "magicRight") {

			if (getTileRight().eraseable) {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;

				drawHero(2, Math.floor(game.player.animationStep / 8), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {
					game.player.animationStep = 0;
					game.player.animationOffset = 0;

					drawHero(0, 0, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y][game.player.pos.x + 1] = "0";
					playerStand();
					
				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(2, 10 - Math.floor(game.player.animationStep / 8), game.player.pos.x + 1, game.player.pos.y);
				drawHero(2, Math.floor(game.player.animationStep / 8), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {
					game.player.animationStep = 0;
					game.player.animationOffset = 0;

					drawHero(0, 0, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y][game.player.pos.x + 1] = "B";
					playerStand();
					
				}		
			}

		} else if (game.player.state == "magicLeft") {

			if (getTileLeft().eraseable) {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
 
				drawHero(2, Math.floor(game.player.animationStep / 8), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {
					game.player.animationStep = 0;
					game.player.animationOffset = 0;

					drawHero(0, 0, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y][game.player.pos.x - 1] = "0";
					playerStand();
					
				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(2, 10 - Math.floor(game.player.animationStep / 8), game.player.pos.x - 1, game.player.pos.y);
				drawHero(2, Math.floor(game.player.animationStep / 8), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {
					game.player.animationStep = 0;
					game.player.animationOffset = 0;

					drawHero(0, 0, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y][game.player.pos.x - 1] = "B";
					playerStand();
					
				}		
			}

		} else if (game.player.state == "crouchMagicRight") {

			if (getTileBottomRight().eraseable) {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
 
				drawHero(4, Math.floor(game.player.animationStep / 10), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(2, 8, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x + 1] = "0";
					playerCrouch();		

				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(2, 10 - Math.floor(game.player.animationStep / 8), game.player.pos.x + 1, game.player.pos.y + 1);
				drawHero(4, Math.floor(game.player.animationStep / 10), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(2, 8, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x + 1] = "B";
					playerCrouch();
					
				}		
			}

		} else if (game.player.state == "crouchMagicLeft") {

			if (getTileBottomLeft().eraseable) {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
 
				drawHero(4, Math.floor(game.player.animationStep / 10), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(4, 7, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x - 1] = "0";
					playerCrouch();		

				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(2, 10 - Math.floor(game.player.animationStep / 8), game.player.pos.x - 1, game.player.pos.y + 1);
				drawHero(4, Math.floor(game.player.animationStep / 10), 40, 40, game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(2, 8, 40, 40, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x - 1] = "B";
					playerCrouch();
					
				}		
			}

		} else if (game.player.state == "magicUp") {

			game.player.animationStep++;
			game.player.animationOffset = game.player.animationStep / 40;
			
			drawTile(3, 2, game.player.pos.x, game.player.pos.y);
			drawHero(4, 4 + Math.floor(game.player.animationStep / 13), game.player.pos.x, game.player.pos.y - game.player.animationOffset);


			if (game.player.animationStep == GLOBALS.magicDuration) {

				game.levelState[game.player.pos.y][game.player.pos.x] = "G";
				game.player.pos.y--;
				drawHero(2, 8, game.player.pos.x, game.player.pos.y);
				playerStand();
				
			}		
		}

		window.requestAnimationFrame(main);
	}

	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");


	var mapCodes = {
		"0": {
			name: "Empty Space",
			spriteX: 0,
			spriteY: 0,
			blocking: false,
			eraseable: false,
		},
		"1": {
			name: "Eraseable Star-wall",
			spriteX: 2,
			spriteY: 1,
			blocking: true,
			eraseable: true,
		},
		"2": {
			name: "Indestructible Star-wall",
			spriteX: 1,
			spriteY: 1,
			blocking: true,
			eraseable: false,
		},
		"3": {
			name: "Entrance Portal",
			spriteX: 3,
			spriteY: 9,
			blocking: false,
			eraseable: false,
		},
		"4": {
			name: "Exit Portal",
			spriteX: 3,
			spriteY: 10,
			blocking: false,
			eraseable: false,
		},
		"5": {
			name: "Warp Pocket",
			spriteX: "?",
			spriteY: "?",
			blocking: false,
			eraseable: false,
		},
		"6": {

		},
		"7": {

		},
		"8": {

		},
		"B": {
			name: "Blue Magic",
			spriteX: 2,
			spriteY: 6,
			blocking: true,
			eraseable: true
		},
		"G": {
			name: "Green Magic",
			spriteX: 3,
			spriteY: 3,
			blocking: true,
			eraseable: true,
		},
		"!": {

		},
		"@": {

		},
		"#": {

		}, 
		"$": {

		},
		"(": {

		},
		")": {

		},
		"%": {

		}
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
			animationOffset: 0
		},
		keysDown: {
			Space: false,
			W: false,
			A: false,
			S: false, 
			D: false
		}
	}

	function playerFall() {
		console.log("playerFall()")
		game.player.state = "falling";
	}

	function playerStand() {
		console.log("playerStand()")
		game.player.state = "standing";
		game.player.animationStep = 0;
		game.player.animationOffset = 0;
	}

	function playerWalkLeft() {
		console.log("playerWalkLeft()")
		if (game.player.state == "standing") {

			game.player.direction = "left";	

			if (getTileBelow().blocking && !getTileLeft().blocking) {
				game.player.state = "walkLeft"; 
			}
		}
	}

	function playerWalkRight() {
		console.log("playerWalkRight()")
		if (game.player.state == "standing") {

			game.player.direction = "right";

			if (getTileBelow().blocking && !getTileRight().blocking) {
				game.player.state = "walkRight";		
			}
		}
	}

	function playerCrouch() {
		console.log("playerCrouch()");
		game.player.state = "crouching"
	}
	function playerMagicLeft() {
		console.log("playerMagicLeft()")
		if (!getTileLeft().blocking || getTileLeft().eraseable) {
			game.player.state = "magicLeft";
		}
	}
	function playerMagicRight() {
		console.log("playerMagicRight()");
		if (!getTileRight().blocking || getTileRight().eraseable) {
			game.player.state = "magicRight";
		}
	}
	function playerCrouchMagicLeft() {
		console.log("playerCrouchMagicLeft()")
		if (!getTileBottomLeft().blocking || getTileBottomLeft().eraseable) {
			game.player.animationStep = 0;
			game.player.animationOffset = 0;
			game.player.state = "crouchMagicLeft";
		}
	}
	function playerCrouchMagicRight() {
		console.log("playerCrouchMagicRight()")
		if (!getTileBottomRight().blocking || getTileBottomRight().eraseable) {
			game.player.animationStep = 0;
			game.player.animationOffset = 0;
			game.player.state = "crouchMagicRight";
		}
	}
	function playerMagicUp() {
		console.log("playerMagicUp()");
		if (!getTileAbove().blocking && getTileBelow().name != "Green Magic" && getTileBelow().name != "Blue Magic") {
			game.player.state = "magicUp";
		}
	}
	function getCurrentTile() {
		return mapCodes[game.levelState[game.player.pos.y][game.player.pos.x]];
	}
	function getTileBelow() {
		return mapCodes[game.levelState[game.player.pos.y + 1][game.player.pos.x]];
	}
	function getTileAbove() {
		return mapCodes[game.levelState[game.player.pos.y - 1][game.player.pos.x]];
	}
	function getTileLeft() {
		return mapCodes[game.levelState[game.player.pos.y][game.player.pos.x - 1]];
	}
	function getTileRight() {
		return mapCodes[game.levelState[game.player.pos.y][game.player.pos.x + 1]];
	}
	function getTileBottomLeft() {
		return mapCodes[game.levelState[game.player.pos.y + 1][game.player.pos.x - 1]];
	}
	function getTileBottomRight() {
		return mapCodes[game.levelState[game.player.pos.y + 1][game.player.pos.x + 1]];
	}
	function drawTile(tileX, tileY, desX, desY, sX, sY) {
		if (!sX) {sX = 40}
		if (!sY) {sY = 40}
		ctx.drawImage(sprite, tileX * sX, tileY * sY, sX, sY, desX * sX, desY * sY, sX, sY);
	}

	function drawHero(tileX, tileY, desX, desY, sX, sY) {
		if (!sX) {sX = 40}
		if (!sY) {sY = 40}
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
			case 32: // Spacebar
				if (game.player.state == "standing") {

					if (game.keysDown.W && !getTileAbove().blocking) {
						playerMagicUp()
					} else if (game.player.direction == "left") {
						playerMagicLeft();
					} else {
						playerMagicRight();
					}

				} else if (game.player.state == "crouching" && game.player.animationStep > 10) {

					if (game.player.direction == "left") {
						playerCrouchMagicLeft();
					} else {
						playerCrouchMagicRight();
					}

				}
				game.keysDown.space = true;
				break;
			case 37: // Left Arrow
			case 65: // A
				game.keysDown.A = true;
				playerWalkLeft();
				break;
			case 39: // Right Arrow
			case 68: // D
				game.keysDown.D = true;
				playerWalkRight();	
				break;
			case 40: // Down Arrow
			case 83: // S
				if (game.player.state == "standing") {
					playerCrouch();
				}
				game.keysDown.S = true;
				break;
			case 38: // Up Arrow
			case 87: // W
				game.keysDown.W = true;
				break;
		}

	}, true);

	window.addEventListener("keyup", function(e) {

		switch(e.keyCode) {
			case 32: // Spacebar
				game.keysDown.Space = false;
				break;
			case 37: // Left Arrow
			case 65: // A
				game.keysDown.A = false;
				break;
			case 39:
			case 68:
				game.keysDown.D = false;
				break;
			case 40: // Down Arrow
			case 83: // S
				if (game.player.state == "crouching") {
					playerStand();
				}
				game.keysDown.S = false;
				break;
			case 38: // Up Arrow
			case 87: // W
				game.keysDown.W = false;
				break;
		}

	}, true);

//})();


