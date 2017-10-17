var GLOBALS = {

	gameRunning: true,
	gameWidth: 16,
	gameHeight: 12,

	lastFrameTimeMs: 0,
	maxFPS: 60,
	delta: 0,
	timestep: 1000 / 60,

	XYHEROwidth: 12,
	XYHEROheight: 9,
	
	XYTILESwidth: 6,
	XYTILESheight: 11,

	walkDuration: 20,
	fallDuration: 20,
	magicDuration: 40,
}

function updatePlayer(delta) {

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

		if (game.keysDown.S) {
			if (game.player.state == "standing") {
				playerCrouch();
			}
		} else {
			if (game.player.state == "crouching") {
				playerStand();
			}
		}

		if (getCurrentTile().name == "Exit Portal" && getTileBelow().blocking) {
			game.level++;
			startLevel();
		}

		if (game.player.state == "dead") {
			// Do Nothing
		} else if (game.player.state == "standing") {

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
				
				if (game.player.pos.y > GLOBALS.gameHeight) {
					deathByFalling();
				} else if (getTileBelow().blocking) {
					playerStand();
				} else {
					playerFall();
				}
			}

		} else if (game.player.state == "prepareWalk") {

			game.player.animationStep++;

			drawHero(0, 0, game.player.pos.x, game.player.pos.y);

			if (game.player.animationStep > 5) {
				playerStand();
				playerWalk();	
			} 

		} else if (game.player.state == "walking") {

			var direction = game.player.direction == "left" ? -1 : 1

			game.player.animationStep++;

			game.player.animationOffset = game.player.animationStep / GLOBALS.walkDuration;

			drawHero(0.1 * (game.player.animationStep % 9), game.player.animationStep % 9, game.player.pos.x + (direction * game.player.animationOffset), game.player.pos.y);

			if (game.player.animationStep == GLOBALS.walkDuration) {
				game.player.animationStep = 0;
				game.player.animationOffset = 0;
				game.player.pos.x += direction;

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

		} else if (game.player.state == "magicForward") {

			var tile = game.player.direction == "left" ? getTileLeft() : getTileRight();
			var direction = game.player.direction == "left" ? -1 : 1

			if (tile.eraseable) {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;

				drawHero(2, Math.floor(game.player.animationStep / 8), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {
					game.player.animationStep = 0;
					game.player.animationOffset = 0;

					drawHero(0, 0, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y][game.player.pos.x + direction] = "0";
					playerStand();
					
				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(2, 10 - Math.floor(game.player.animationStep / 8), game.player.pos.x + direction, game.player.pos.y);
				drawHero(2, Math.floor(game.player.animationStep / 8), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {
					game.player.animationStep = 0;
					game.player.animationOffset = 0;

					drawHero(0, 0, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y][game.player.pos.x + direction] = "B";
					playerStand();
					
				}		
			}

		} else if (game.player.state == "crouchMagic") {

			var tile = game.player.direction == "left" ? getTileBottomLeft() : getTileBottomRight();
			var direction = game.player.direction == "left" ? -1 : 1

			if (tile.eraseable) {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
 
				drawHero(4, Math.floor(game.player.animationStep / 10), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(2, 8, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x + direction] = "0";
					playerCrouch();		

				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(2, 10 - Math.floor(game.player.animationStep / 8), game.player.pos.x + direction, game.player.pos.y + 1);
				drawHero(4, Math.floor(game.player.animationStep / 10), game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(2, 8, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x + direction] = "B";
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
}

//;(function () {
function main(timestamp) {

	// Throttle the frame rate
	if (timestamp < GLOBALS.lastFrameTimeMs + (1000 / GLOBALS.maxFPS)) {
		window.requestAnimationFrame(main);
		return;
	}

	GLOBALS.delta += timestamp - GLOBALS.lastFrameTimeMs;
	GLOBALS.lastFrameTimeMs = timestamp;

	if (GLOBALS.gameRunning) {
		drawMap(game.levelState);
	}
	

	while (GLOBALS.delta >= GLOBALS.timestep) {
		if (GLOBALS.gameRunning) {
			updatePlayer(GLOBALS.timestep);	
		}
		GLOBALS.delta -= GLOBALS.timestep;
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

var game = {
	level: 1,
	levelState: [],
	audio: {
		beginLevel: new Audio('assets/sound/108_Begin_Playing.wav'),
		deathByFalling: new Audio('assets/sound/110_Death_by_Falling.wav')
	},
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

function deathByFalling() {
	game.player.state = "dead";
	GLOBALS.gameRunning = false;
	game.audio.deathByFalling.play();
	setTimeout(function() {
		GLOBALS.gameRunning = true;
		startLevel();
	}, 1300)
}
function startLevel() {

	if (GLOBALS.gameRunning) {
		game.audio.beginLevel.pause();
		game.audio.beginLevel.currentTime = 0; // In case they beat the level really fast e.g. level 1
		game.audio.beginLevel.play();
		game.player.pos = drawMap(levels[game.level]);
		game.levelState = levels[game.level].slice(0, levels[game.level].length);
		game.player.state = "standing";
		main(0);
	}
}
function playerFall() {
	console.log("playerFall()")
	game.player.state = "falling";
}
function playerStand() {
	game.player.state = "standing";
	game.player.animationStep = 0;
	game.player.animationOffset = 0;
}
function playerTurn() {

	if (game.player.state == "standing") {
		if (game.player.direction == "left") {
			if (game.keysDown.A) {
				if (!getTileLeft().blocking) {
					game.player.state = "walking";
				} else {
					game.player.state = "standing"
				}
			} else {
				game.player.direction = "right"
				game.player.state = "prepareWalk"
			}
 		} else {
 			if (game.keysDown.D) {
				if (!getTileRight().blocking) {
					game.player.state = "walking";
				} else {
					game.player.state = "standing"
				}
			} else {
				game.player.direction = "left"
				game.player.state = "prepareWalk"
			}	
 		}
	}	
}
function playerWalk() {

	if (game.player.direction == "left")  {
		if (!getTileLeft().blocking) {
			game.player.state = "walking";
		}
	} else {
		if (!getTileRight().blocking) {
			game.player.state = "walking";
		}
	}
}
function playerCrouch() {
	console.log("playerCrouch()");
	game.player.state = "crouching"
}
function playerMagicForward() {
	console.log("playerMagicForward()")

	var tile = game.player.direction == "left" ? getTileLeft() : getTileRight();
	if (!tile.blocking || tile.eraseable) {
		game.player.state = "magicForward";
	}
}
function playerCrouchMagic() {

	var tile = game.player.direction == "left" ? getTileBottomLeft() : getTileBottomRight();

	if (!tile.blocking || tile.eraseable) {
		game.player.animationStep = 0;
		game.player.animationOffset = 0;
		game.player.state = "crouchMagic";
	}
}
function playerMagicUp() {
	console.log("playerMagicUp()");
	if (!getTileAbove().blocking && getTileBelow().name != "Green Magic") {// && getTileBelow().name != "Blue Magic") {
		game.player.state = "magicUp";
	}
}
function getCurrentTile() {
	if (game.player.pos.x >= GLOBALS.gameWidth || game.player.pos.x < 0 || game.player.pos.y >= GLOBALS.gameHeight || game.player.pos.x < 0) {return mapCodes["0"]}
	return mapCodes[game.levelState[game.player.pos.y][game.player.pos.x]];
}
function getTileBelow() {
	if (game.player.pos.y >= GLOBALS.gameHeight - 1) {return mapCodes["0"]}
	return mapCodes[game.levelState[game.player.pos.y + 1][game.player.pos.x]];
}
function getTileAbove() {
	if (game.player.pos.y <= 0) {return mapCodes["2"]}
	return mapCodes[game.levelState[game.player.pos.y - 1][game.player.pos.x]];
}
function getTileLeft() {
	if (game.player.pos.x <= 0) {return mapCodes["2"]}
	return mapCodes[game.levelState[game.player.pos.y][game.player.pos.x - 1]];
}
function getTileRight() {
	if (game.player.pos.x >= GLOBALS.gameWidth - 1) {return mapCodes["2"]}
	return mapCodes[game.levelState[game.player.pos.y][game.player.pos.x + 1]];
}
function getTileBottomLeft() {
	if (game.player.pos.x <= 0 || game.player.pos.y >= GLOBALS.gameHeight - 1) {return mapCodes["2"]}
	return mapCodes[game.levelState[game.player.pos.y + 1][game.player.pos.x - 1]];
}
function getTileBottomRight() {
	if (game.player.pos.x >= GLOBALS.gameWidth - 1 || game.player.pos.y >= GLOBALS.gameHeight - 1) {return mapCodes["2"]}
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
sprite.src = 'assets/img/XYTILES.JPG';
var spriteLoaded = false;
sprite.onload = function() {
	spriteLoaded = true;
}

var playerSprite = new Image();
playerSprite.src = 'assets/img/XYHERO.JPG'
var playerLoaded = false;
playerSprite.onload = function() {
	playerLoaded = true;
	if (spriteLoaded) {
		startLevel();
		main(0);
	}
}

window.addEventListener("keydown", function(e) {

	switch(e.keyCode) {
		case 32: // Spacebar
			e.preventDefault(); // prevent spacebar scroll
			if (game.player.state == "standing") {

				if (game.keysDown.W && !getTileAbove().blocking) {
					playerMagicUp()
				} else {
					playerMagicForward();
				}

			} else if (game.player.state == "crouching") {

				if (game.player.direction == "left") {
					playerCrouchMagic();
				} else {
					playerCrouchMagic();
				}

			}
			game.keysDown.space = true;
			break;
		case 37: // Left Arrow
		case 65: // A
			game.keysDown.A = true;
			playerTurn();
			break;
		case 39: // Right Arrow
		case 68: // D
			game.keysDown.D = true;
			playerTurn();	
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
		case 82: // R (restart the level)
			startLevel();
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
			if (game.player.state == "prepareWalk") {
				playerStand()
			}
			break;
		case 39:
		case 68:
			game.keysDown.D = false;
			if (game.player.state == "prepareWalk") {
				playerStand()
			}
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


