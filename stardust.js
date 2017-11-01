var GLOBALS = {

	gameRunning: false,
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

	tiles1: new Image(),
	tiles2: new Image(),
	tiles3: new Image(),
	players: new Image(),
	main: new Image(),
	about: new Image(),
	instructions: new Image(),

	imagesLoaded: false,

	mainShowing: true,
	aboutShowing: false,
	instructionsShowing: false,
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
			localStorage.setItem('level', game.level);
			startLevel();
		} else if (getCurrentTile().name == "Warp Pocket") {
			game.player.pos.y = GLOBALS.gameHeight + 1; // place player outside of map
			deathByWarp();
		} else if (getTileBelow().name == "Hot Coals") {
			deathByCoals();
		}

		// Check if player has stepped on a Fallwall
		if (getTileBelow().name == "Fallwall" && game.player.state != "falling") {

			var pX = game.player.pos.x;
			var pY = game.player.pos.y + 1;

			var fw = {
				posX: pX,
				posY: pY,
				animationStep: 0
			}

			var fallWallInArray = false;

			for (var i = 0; i < game.fallWalls.length; i++) {
				if (fw.posX == game.fallWalls[i].posX && fw.posY == game.fallWalls[i].posY) {
					fallWallInArray = true;
				}
			}

			if (!fallWallInArray) {
				game.fallWalls.push(fw);
			}
		}

		// Update all Fallwalls

		var i = game.fallWalls.length;
		while (i--) {

			game.fallWalls[i].animationStep++;
			drawTile(3, Math.floor(game.fallWalls[i].animationStep / 8), 7, game.fallWalls[i].posX, game.fallWalls[i].posY);

			if (game.fallWalls[i].animationStep >= 80) {
			 	game.levelState[game.fallWalls[i].posY][game.fallWalls[i].posX] = "0";
			 	drawTile(1, 10, 11, game.fallWalls[i].posX, game.fallWalls[i].posY);
				game.fallWalls.splice(i, 1);
			}

		}
			
		if (game.player.state == "dead") {
			// Do Nothing
		} else if (game.player.state == "standing") {

			if (getTileBelow().blocking) {
				playerStand();
				drawHero(5, 2, game.player.pos.x, game.player.pos.y);
			} else {
				if (!(getCurrentTile().name == "Left Wall" || getCurrentTile().name == "Right Wall")) {
					playerFall();	
					drawHero(1, 3, game.player.pos.x, game.player.pos.y + game.player.animationOffset);
				} else { // We are inside a wall
					drawHero(5, 2, game.player.pos.x, game.player.pos.y); 
				}	
			}

		} else if (game.player.state == "falling") {

			 /* Can change direction mid-air */
			 if (game.keysDown.A) {
			 	game.player.direction = "left";
			 } else if (game.keysDown.D) {
			 	game.player.direction = "right";
			 }
			
			game.player.animationStep++;

			game.player.animationOffset = game.player.animationStep / 20;

			drawHero(1, 3, game.player.pos.x, game.player.pos.y + game.player.animationOffset);

			// Gone down a square; switch based on where we are
			if (game.player.animationStep == GLOBALS.fallDuration) {

				game.player.animationStep = 0;
				game.player.animationOffset = 0;
				game.player.pos.y++;

				drawHero(1, 3, game.player.pos.x, game.player.pos.y + game.player.animationOffset);
				
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

			drawHero(5, 2, game.player.pos.x, game.player.pos.y);

			if (game.player.animationStep > 5) {
				playerStand();
				playerWalk();	
			} 

		} else if (game.player.state == "walking") {

			var direction = game.player.direction == "left" ? -1 : 1

			game.player.animationStep++;

			game.player.animationOffset = game.player.animationStep / GLOBALS.walkDuration;

			drawHero(5 + game.player.animationStep % 3, 2, game.player.pos.x + (direction * game.player.animationOffset), game.player.pos.y);

			if (game.player.animationStep == GLOBALS.walkDuration) {
				game.player.animationStep = 0;
				game.player.animationOffset = 0;
				game.player.pos.x += direction;

				drawHero(5, 2, game.player.pos.x, game.player.pos.y);

				if (getTileBelow().blocking) {
					playerStand();
				} else {
					playerFall();
				}

				if (getCurrentTile().name == "Left Wall" || getCurrentTile().name == "Right Wall") {
					playerStand();
				}
				
			}

		} else if (game.player.state == "crouching") {

			game.player.animationStep++;

			if (game.player.animationStep >= 1 && game.player.animationStep <= 5) { // Player has just entered crouch
				drawHero(8, 2, game.player.pos.x, game.player.pos.y);
			} else if (game.player.animationStep >= 6 && game.player.animationStep <= 10) {
				drawHero(9, 2, game.player.pos.x, game.player.pos.y);
			} else {
				drawHero(10, 2, game.player.pos.x, game.player.pos.y);
			}

		} else if (game.player.state == "magicForward") {

			var tile = game.player.direction == "left" ? getTileLeft() : getTileRight();
			var direction = game.player.direction == "left" ? -1 : 1

			if (tile.eraseable) {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;

				drawHero(3 + Math.floor(game.player.animationStep / 10), 3, game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {
					game.player.animationStep = 0;
					game.player.animationOffset = 0;

					drawHero(5, 2, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y][game.player.pos.x + direction] = "0";
					playerStand();
					
				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(3, 10 - Math.floor(game.player.animationStep / 4), 4, game.player.pos.x + direction, game.player.pos.y);
				drawHero(3 + Math.floor(game.player.animationStep / 10), 3, game.player.pos.x, game.player.pos.y);

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
 				
				drawHero(7 + Math.floor(game.player.animationStep / 11), 3, game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(10, 3, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x + direction] = "0";
					playerCrouch();		

				}

			} else {

				game.player.animationStep++;
				game.player.animationOffset = game.player.animationStep / 20;
				
				drawTile(3, 10 - Math.floor(game.player.animationStep / 4), 4, game.player.pos.x + direction, game.player.pos.y + 1);
				drawHero(7 + Math.floor(game.player.animationStep / 11), 3, game.player.pos.x, game.player.pos.y);

				if (game.player.animationStep == GLOBALS.magicDuration) {

					drawHero(10, 3, game.player.pos.x, game.player.pos.y);
					game.levelState[game.player.pos.y + 1][game.player.pos.x + direction] = "B";
					playerCrouch();
					
				}		
			}

		} else if (game.player.state == "magicUp") {

			game.player.animationStep++;
			game.player.animationOffset = game.player.animationStep / 40;

			ctx.drawImage(GLOBALS.tiles3, 0, 400, 40, game.player.animationStep, game.player.pos.x * 40, (game.player.pos.y + 1 - game.player.animationOffset) * 40, 40, game.player.animationStep);
			drawHero(11 + Math.floor(game.player.animationStep / 9), 3, game.player.pos.x, game.player.pos.y - game.player.animationOffset);

			if (game.player.animationStep == GLOBALS.magicDuration) {

				game.levelState[game.player.pos.y][game.player.pos.x] = "G";
				game.player.pos.y--;
				drawHero(5, 2, game.player.pos.x, game.player.pos.y);
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
		spriteX: 10,
		spriteY: 11,
		tileNum: 1,
		blocking: false,
		eraseable: false,
	},
	"1": {
		name: "Eraseable Star-wall",
		spriteX: 2,
		spriteY: 1,
		tileNum: 1,
		blocking: true,
		eraseable: true,
	},
	"2": {
		name: "Indestructible Star-wall",
		spriteX: 1,
		spriteY: 3,
		tileNum: 1,
		blocking: true,
		eraseable: false,
	},
	"3": {
		name: "Entrance Portal",
		spriteX: 10,
		spriteY: 0,
		tileNum: 1,
		blocking: false,
		eraseable: false,
	},
	"4": {
		name: "Exit Portal",
		spriteX: 10,
		spriteY: 1,
		tileNum: 1,
		blocking: false,
		eraseable: false,
	},
	"5": {
		name: "Warp Pocket",
		spriteX: 0,
		spriteY: 4,
		tileNum: 1,
		blocking: false,
		eraseable: true,
	},
	"6": {
		name: "Hot Coals",
		spriteX: 0,
		spriteY: 6,
		tileNum: 1,
		blocking: true,
		eraseable: false,
	},
	"7": {
		name: "Starblock",
		spriteX: 10,
		spriteY: 2,
		tileNum: 1,
		blocking: false,
		eraseable: false
	},
	"8": {
		name: "Fallwall",
		spriteX: 0,
		spriteY: 7,
		tileNum: 3,
		blocking: true,
		eraseable: false,
	},
	"B": {
		name: "Blue Magic",
		spriteX: 0,
		spriteY: 8,
		tileNum: 2,
		blocking: true,
		eraseable: true
	},
	"G": {
		name: "Green Magic",
		spriteX: 0,
		spriteY: 10,
		tileNum: 2,
		blocking: true,
		eraseable: true,
	},
	"!": {
		name: "Left Wall",
		spriteX: 1,
		spriteY: 10,
		tileNum: 1,
		blocking: true,
		eraseable: false
	},
	"@": {
		name: "Right Wall",
		spriteX: 0,
		spriteY: 0,
		tileNum: 2,
		blocking: true,
		eraseable: false
	},
	"#": {
		"name": "Elevator",
		spriteX: 0,
		spriteY: 2,
		tileNum: 2,
		blocking: false,
		eraseable: false
	}, 
	"$": {
		name: "Tunnel",
		spriteX: 0,
		spriteY: 4,
		tileNum: 2,
		blocking: false,
		eraseable: false,
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
		deathByFalling: new Audio('assets/sound/110_Death_by_Falling.wav'),
		deathByCoals: new Audio('assets/sound/206_Death_by_Coals.wav'),
		magicBlue: new Audio('assets/sound/207_Magic_Blue.wav'),
		magicDud: new Audio('assets/sound/208_Magic_Dud.wav'),
		magicGreen: new Audio('assets/sound/209_Magic_Green.wav'),
		gByeGreen: new Audio("assets/sound/211_G'bye_Greenwall.wav"),
		gByeBlock: new Audio("assets/sound/214_G'bye_Block.wav"),
		warp: new Audio("assets/sound/215_Warp.wav"),
	},
	player: {
		pos: {
			x: 0,
			y: 0
		},
		direction: "right",
		state: "standing",
		animationStep: 0,
		animationOffset: 0,
		fallWallAnimationStep: 0,
	},
	keysDown: {
		Space: false,
		W: false,
		A: false,
		S: false, 
		D: false
	},
	fallWalls: [], /* 
	{	
		posX:
		posY:
		animationStep:
	}
	*/
}
function returnToStart() { // only called after deaths
		GLOBALS.gameRunning = true;
		game.player.pos = drawMap(levels[game.level]);
		game.player.state = "standing";
		main(0);
}
function deathByFalling() {
	game.player.state = "dead";
	GLOBALS.gameRunning = false;
	game.audio.deathByFalling.play(); 
	GLOBALS.returnToStart = setTimeout(function() {
		returnToStart();
	}, 1300)
}
function deathByWarp() {
	game.player.state = "dead";
	GLOBALS.gameRunning = false;
	game.audio.warp.play();
	GLOBALS.returnToStart = setTimeout(function() {
		returnToStart();
	}, 1300)
}
function deathByCoals() {
	game.player.state = "dead";
	GLOBALS.gameRunning = false;
	game.audio.deathByCoals.play();

	drawHero(3, 4, game.player.pos.x, game.player.pos.y);

	var i = 0;
	GLOBALS.animateDeath = setInterval(function() {
		drawMap(game.levelState)
		drawHero(3 + i, 4, game.player.pos.x, game.player.pos.y);
		i++;
	}, 150);

	GLOBALS.returnToStart = setTimeout(function() {
		clearInterval(GLOBALS.animateDeath);
		returnToStart();
	}, 2100);

}
function cloneArrayOfArrays (existingArray) {
   var newObj = (existingArray instanceof Array) ? [] : {};
   for (i in existingArray) {
      if (i == 'clone') continue;
      if (existingArray[i] && typeof existingArray[i] == "object") {
         newObj[i] = cloneArrayOfArrays(existingArray[i]);
      } else {
         newObj[i] = existingArray[i]
      }
   }
   return newObj;
}

function startLevel() {
	clearInterval(GLOBALS.animateDeath);
	clearTimeout(GLOBALS.returnToStart);
	clearTimeout(GLOBALS.weirdTimingBug);
	game.audio.beginLevel.pause();
	game.audio.beginLevel.currentTime = 0; // In case they jam the reset button
	game.audio.beginLevel.play();
	game.player.pos = drawMap(levels[game.level]); 
	game.levelState = cloneArrayOfArrays(levels[game.level]);
	game.player.state = "standing";
	main(0);
	GLOBALS.weirdTimingBug = setTimeout(function() {
		GLOBALS.gameRunning = true;
	}, 200);
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
				if ((!getTileLeft().blocking && !(getTileLeft().name == "Warp Pocket")) || getTileLeft().name == "Left Wall") {
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
				if ((!getTileRight().blocking && !(getTileRight().name == "Warp Pocket")) || getTileRight().name == "Right Wall") {
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

		if ((!getTileLeft().blocking && !(getTileLeft().name == "Warp Pocket")) || getTileLeft().name == "Left Wall") {
			game.player.state = "walking";
		}
	} else {

		if ((!getTileRight().blocking && !(getTileRight().name == "Warp Pocket")) || getTileRight().name == "Right Wall") {
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

	if (tile.eraseable || tile.name == "Empty Space") {
		game.player.state = "magicForward";

		switch (tile.name) {
			case "Empty Space":
				game.audio.magicBlue.play();
				break;
			case "Eraseable Star-wall":
			case "Blue Magic":
				game.audio.gByeBlock.play();
				break;
			case "Green Magic":
				game.audio.gByeGreen.play();
				break;
		}

	} else {
		game.audio.magicDud.play();
	}
}
function playerCrouchMagic() {

	var tile = game.player.direction == "left" ? getTileBottomLeft() : getTileBottomRight();

	if (tile.eraseable || tile.name == "Empty Space") {
		game.player.animationStep = 0;
		game.player.animationOffset = 0;
		game.player.state = "crouchMagic";
		
		switch (tile.name) {
			case "Empty Space":
				game.audio.magicBlue.play();
				break;
			case "Eraseable Star-wall":
			case "Blue Magic":
				game.audio.gByeBlock.play();
				break;
			case "Green Magic":
				game.audio.gByeGreen.play();
				break;
		}

	} else {
		game.audio.magicDud.play();
	}
}
function playerMagicUp() {
	console.log("playerMagicUp()");
	if (!getTileAbove().blocking && 
		getTileBelow().name != "Green Magic" && 
		getTileAbove().name != "Warp Pocket" &&
		getCurrentTile().name == "Empty Space") {
		game.player.state = "magicUp";
		game.audio.magicGreen.play();
	} else {
		game.audio.magicDud.play();
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
function drawTile(tn, tileX, tileY, desX, desY, sX, sY) {
	if (!sX) {sX = 40}
	if (!sY) {sY = 40}
	var tileNum;
	if (tn == 1) {tileNum = GLOBALS.tiles1}
	if (tn == 2) {tileNum = GLOBALS.tiles2}
	if (tn == 3) {tileNum = GLOBALS.tiles3}
	ctx.drawImage(tileNum, tileX * sX, tileY * sY, sX, sY, desX * sX, desY * sY, sX, sY);
}
function drawHero(tileX, tileY, desX, desY, sX, sY) {
	if (!sX) {sX = 40}
	if (!sY) {sY = 40}
	if (game.player.direction == "right") {
		ctx.drawImage(GLOBALS.players, tileX * sX, tileY * sY, sX, sY, desX * sX, desY * sY, sX, sY);
	} else {
		ctx.translate((desX * sX)+sX, desY*sY);
		ctx.scale(-1, 1);
		ctx.drawImage(GLOBALS.players, tileX * sX, tileY * sY, sX, sY, 0, 0, sX, sY);
		ctx.setTransform(1, 0, 0, 1, 0, 0)
	}
	
}
function drawMap(map) {

	var i = 0, j = 0;

	for (i = 0; i < 12; i++) {
		for (j = 0; j < 16; j++) {
			
			var mapCode = map[i][j];

			var tileX = mapCodes[mapCode].spriteX;
			var tileY = mapCodes[mapCode].spriteY;
			var tileNum = mapCodes[mapCode].tileNum;

			drawTile(tileNum, tileX, tileY, j, i);

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

GLOBALS.tiles1.src = 'assets/img/tiles1.png';

GLOBALS.tiles1.onload = function() {

	GLOBALS.tiles2.src = 'assets/img/tiles2.png';
	GLOBALS.tiles2.onload = function() {

		GLOBALS.tiles3.src = 'assets/img/tiles3.png';
		GLOBALS.tiles3.onload = function() {
			
			GLOBALS.players.src = 'assets/img/players.png';
			GLOBALS.players.onload = function() {

				GLOBALS.main.src = 'assets/img/main.png';
				GLOBALS.main.onload = function() {

					GLOBALS.about.src = 'assets/img/about.png';
					GLOBALS.about.onload = function() {

						GLOBALS.instructions.src = 'assets/img/instructions.png';
						GLOBALS.instructions.onload = function() {

							ctx.drawImage(GLOBALS.main, 0, 0)

						}
					}
				}
			}
		}
	}
}

function addPointerCSS() {
	if (!document.getElementById("game").classList.contains("menu-option-hovered")) {
		document.getElementById("game").classList.add("menu-option-hovered");
	};
}

function removePointerCSS() {
	document.getElementById("game").classList.remove("menu-option-hovered");
}

window.addEventListener("mousemove", function(e) {
		
	var px = e.clientX / window.innerWidth;
	var py = e.clientY / window.innerHeight;

	if (GLOBALS.mainShowing) {
		if (px > 0.33 && px < 0.66 && py > 0.37 && py < 0.46) {
			addPointerCSS()
		} else if (px > 0.33 && px < 0.66 && py > 0.53 && py < 0.62) {
			addPointerCSS();
		} else if (px > 0.25 && px < 0.46 && py > 0.70 && py < 0.78) {
			addPointerCSS();
		} else if (px > 0.56 && px < 0.73 && py > 0.70 && py < 0.78) {
			addPointerCSS();
		} else {
			removePointerCSS();
		}
	} else if (GLOBALS.aboutShowing) {
		addPointerCSS();
	} else if (GLOBALS.instructionsShowing) {
		addPointerCSS();
	}

});

window.addEventListener("click", function(e) {
		
	var px = e.clientX / window.innerWidth;
	var py = e.clientY / window.innerHeight;


	if (GLOBALS.mainShowing) {
		if (px > 0.33 && px < 0.66 && py > 0.37 && py < 0.46) { // New Game
			startLevel();
		} else if (px > 0.33 && px < 0.66 && py > 0.53 && py < 0.62) { // Load Game
			var level = localStorage.getItem('level');
			game.level = level;
			startLevel();
		} else if (px > 0.25 && px < 0.46 && py > 0.70 && py < 0.78) { // About
			GLOBALS.mainShowing = false;
			GLOBALS.aboutShowing = true;
			ctx.drawImage(GLOBALS.about, 0, 0);
		} else if (px > 0.56 && px < 0.73 && py > 0.70 && py < 0.78) { // Help
				GLOBALS.mainShowing = false;
			GLOBALS.instructionsShowing = true;
			ctx.drawImage(GLOBALS.instructions, 0, 0);
		} else {
			removePointerCSS();
		}
	} else if (GLOBALS.aboutShowing) {
		GLOBALS.mainShowing = true;
		GLOBALS.aboutShowing = false;
		ctx.drawImage(GLOBALS.main, 0, 0);
	} else if (GLOBALS.instructionsShowing) {
		GLOBALS.mainShowing = true;
		GLOBALS.instructionsShowing = false;
		ctx.drawImage(GLOBALS.main, 0, 0);
	}

	
});

window.addEventListener("keydown", function(e) {

	// if (GLOBALS.instructionsShowing && GLOBALS.imagesLoaded) {
	// 	GLOBALS.instructionsShowing = false;
	// 	startLevel();
	// 	return;
	// }

	switch(e.keyCode) {
		case 32: // Spacebar
		case 13: // Enter
			e.preventDefault(); // prevent spacebar scroll
			if (game.player.state == "standing") {

				if (game.keysDown.W) {
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
		case 88: // X
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


