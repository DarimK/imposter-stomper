// Game variables
const sprites = [document.getElementById('bar'), document.getElementById('Red'), document.getElementById('Orange'), document.getElementById('Yellow'), document.getElementById('Lime'), document.getElementById('Green'), document.getElementById('Cyan'), document.getElementById('Blue'), document.getElementById('Purple'), document.getElementById('Pink'), document.getElementById('White'), document.getElementById('Brown'), document.getElementById('Black'), document.getElementById('Secret')];
const arena = document.getElementById('arena');
var arenaWidth = window.innerWidth;
var arenaHeight = window.innerHeight;
var player1;
var player2;
var enemies = [];
var platforms = [];
var clones = [];
var interval;
var keys = [0, 0, 0, 0, 0, 0, 0, 0];
var touchPos;
var gameMode;
var player1Kills = 0;
var player2Kills = 0;
var stage = 0;
var aliveEnemies = 0;
var enemyLeftMove = [];
var audio;
var upgrades1;
// CLEAN UP THE CODE FOR PLATFORMS AND CREATE THE RANDOM WITH CLONING ADDITION FOR THEM, ALSO DEAL WITH CLEANER STAGE TRANSITION AND A FIX FOR THE ROOF BUG (MAYBE GET RID OF ROOF)

// Checks which keys have been pressed
document.addEventListener('keydown', function (event)
{
	// A, W, D, S
	if (event.keyCode == 65) keys[0] = 1;
	if (event.keyCode == 87) keys[1] = 1;
	if (event.keyCode == 68) keys[2] = 1;
	if (event.keyCode == 83) keys[3] = 1;
	// Left, up, right, down
	if (event.keyCode == 37) keys[4] = 1;
	if (event.keyCode == 38) keys[5] = 1;
	if (event.keyCode == 39) keys[6] = 1;
	if (event.keyCode == 40) keys[7] = 1;
});

// Checks which keys have been released
document.addEventListener('keyup', function (event)
{
	// A, W, D, S
	if (event.keyCode == 65) keys[0] = 0;
	if (event.keyCode == 87) keys[1] = 0;
	if (event.keyCode == 68) keys[2] = 0;
	if (event.keyCode == 83) keys[3] = 0;
	// Left, up, right, down
	if (event.keyCode == 37) keys[4] = 0;
	if (event.keyCode == 38) keys[5] = 0;
	if (event.keyCode == 39) keys[6] = 0;
	if (event.keyCode == 40) keys[7] = 0;
});

function posToKeys(pos) {
	if (pos == null || pos[1] == null)
		return;

	let xDiff = pos[1][0] - pos[0][0];
	let yDiff = pos[1][1] - pos[0][1];
	let circleR = document.getElementById('circle').width / 3 * 2;

	if (Math.abs(yDiff) <= circleR && Math.abs(xDiff) <= circleR) {
		keys = [0, 0, 0, 0, 0, 0, 0, 0];
    }
	else if (Math.abs(yDiff) <= circleR) {
		keys[1] = 0;
		keys[3] = 0;
		if (xDiff > 0) {
			keys[0] = 0;
			keys[2] = 1;
		}
		else {
			keys[0] = 1;
			keys[2] = 0;
		}
	}
	else if (Math.abs(xDiff) <= circleR) {
		keys[0] = 0;
		keys[2] = 0;
		if (yDiff > 0) {
			keys[1] = 0;
			keys[3] = 1;
		}
		else {
			keys[1] = 1;
			keys[3] = 0;
		}
	}
	else if (Math.abs(yDiff) > circleR && Math.abs(xDiff) > circleR) {
		if (xDiff > 0) {
			keys[0] = 0;
			keys[2] = 1;
		}
		else {
			keys[0] = 1;
			keys[2] = 0;
		}
		if (yDiff > 0) {
			keys[1] = 0;
			keys[3] = 1;
		}
		else {
			keys[1] = 1;
			keys[3] = 0;
		}
    }
}

arena.addEventListener('touchstart', function (event) {
	let touch = event.targetTouches[0];
	let touchX = (touch.pageX - arena.offsetLeft) + arenaWidth / 2;
	let touchY = (touch.pageY - arena.offsetTop) + arenaHeight / 2;
	touchPos = [[touchX, touchY], null];
	document.getElementById('circle').style.left = touch.pageX + "px";
	document.getElementById('circle').style.top = touch.pageY + "px";
	document.getElementById('circle').style.display = "block";
});

document.addEventListener('touchend', function () {
	touchPos = null;
	keys = [0, 0, 0, 0, 0, 0, 0, 0];
	document.getElementById('circle').style.display = "none";
});

arena.addEventListener('touchmove', function (event) {
	if (touchPos && touchPos[0]) {
		let touch = event.targetTouches[0];
		let touchX = (touch.pageX - arena.offsetLeft) + arenaWidth / 2;
		let touchY = (touch.pageY - arena.offsetTop) + arenaHeight / 2;
		touchPos = [touchPos[0], [touchX, touchY]];
    }
});

function makeJoystick(canvas) {
	canvas.width = arenaWidth / 20;
	canvas.height = arenaWidth / 20;

	let ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI);
	ctx.fillStyle = "#7f7f7f7f";
	ctx.fill();
}

function initAudio() {
	if (audio == null) {
		audio = new AudioManager();
		audio.addAudio('Sounds/AMOGUS.mp3', 'AMOGUS');
		audio.addAudio('Sounds/default.mp3', 'default');
		audio.addAudio('Sounds/7.mp3', '7');
		audio.addAudio('Sounds/10.mp3', '10');
		audio.addAudio('Sounds/23.mp3', '23');
		audio.addAudio('Sounds/boss.mp3', 'boss');
	}
}

function openFullScreen() {
	let elm = document.body;

	if (elm.requestFullscreen) // Default
		elm.requestFullscreen();
	else if (elm.webkitRequestFullscreen) // Safari
		elm.webkitRequestFullscreen();
	else if (elm.msRequestFullscreen) // IE11
		elm.msRequestFullscreen();
}

function disableAudio() {
	let elm = document.getElementById('audioButton');

	if (audio == null || audio == false) {
		audio = null;
		initAudio();
		elm.textContent = "Disable Audio";
	}
	else {
		audio = false;
		elm.textContent = "Enable Audio";
	}
}

// Pauses and resumes current game
function gameTogglePause()
{
	// If game is running, pause
	if (interval != null) {
		clearInterval(interval);
		interval = null;
		document.getElementById('pauseButton').textContent = "Resume";
		document.getElementById('pauseMenu').style.display = "block";
		if (audio)
			audio.pause();
	}
	// If game is paused, resume
	else
	{
		if (gameMode == 0) interval = setInterval(singleGame, 20);
		else if (gameMode == 1) interval = setInterval(pvpGame, 20);
		document.getElementById('pauseButton').textContent = "Pause";
		document.getElementById('pauseMenu').style.display = "none";
		if (audio)
			audio.play();
	}
}

// Ends current game and resets variables
function gameEnd()
{
	// Clear game interval and delete all clones
	clearInterval(interval);
	for (var i = 0; i < clones.length; i++) arena.removeChild(clones[i]);
	platforms.length = 0;
	clones.length = 0;

	// Reset game display elements and show main menu
	document.getElementById('menu').style.display = "block";
	document.getElementById('game').style.display = "none";
	document.getElementById('pauseMenu').style.display = "none";
	document.getElementById('pauseButton').textContent = "Pause";
	document.getElementById('stageText').textContent = "Stage 1";
	document.getElementById('leftText').textContent = "";
	document.getElementById('rightText').textContent = "";

	// Reset kill counts
	player1Kills = 0;
	player2Kills = 0;

	// If a stages game mode was played
	if (gameMode == 0 || gameMode == 1)
	{
		stage = 0;
		enemies.length = 0;
		enemyLeftMove.length = 0;
		aliveEnemies = 0;
	}

	if (audio)
		audio.stopAll();
	if (upgrades1)
		upgrades1.reset();
}

// Initializes game based on which game-mode is selected
function gameStart(mode)
{
	// Sets arena size
	arenaWidth = window.innerWidth;
	arenaHeight = window.innerHeight;

	// Hides menu GUI and displays game elements
	document.getElementById('menu').style.display = "none";
	document.getElementById('game').style.display = "block";
	document.getElementById('pauseButton').style.display = "block";
	arena.style.width = arenaWidth;
	arena.style.height = arenaHeight;

	// Checks if screen size is valid
	if (arenaWidth < 600 || arenaHeight < 400) {
		document.getElementById('stageText').textContent = "Sorry, your screen is too small to play this game :(";
		document.getElementById('pauseButton').style.display = "none";
		return;
	}

	// Sets game mode after screen is validated
	gameMode = mode;

	// Single player
	if (mode == 0)
	{
		// Clone Amogus and health bar sprites
		clones.push(sprites[1].cloneNode(true));
		clones.push(sprites[0].cloneNode(true));

		// Add sprites to arena
		arena.appendChild(clones[0]);
		arena.appendChild(clones[1]);

		// Initialize player 1 Amogus object and start game
		player1 = new Amogus(clones[0], clones[1], 0, arenaHeight);
		addPlatform(arenaWidth / 2 - 100, 100, arenaWidth / 2 - 100, arenaHeight - 100, 200, 5);

		if (audio)
			audio.loop('default');

		upgrades1 = new UpgradeManager(document.getElementById('upgradeMenu'), document.getElementById('upgradeButton'), arenaHeight / 4);
		upgrades1.addButton("Speed", function () { player1.speed += 0.25; return [player1.speed, player1.speed + 0.25]; });
		upgrades1.addButton("Health", function () { player1.maxHealth += 10; return [player1.maxHealth, player1.maxHealth + 10]; });
		upgrades1.addButton("Healing", function () { player1.regen += 1; return [player1.regen, player1.regen + 1]; });
		upgrades1.addButton("Damage", function () { player1.damage += 2.5; return [player1.damage, player1.damage + 2.5]; });
		upgrades1.addButton("Armour", function () { player1.resistance += 0.25; return [player1.resistance, player1.resistance + 0.25]; });

		makeJoystick(document.getElementById('circle'));

		interval = setInterval(singleGame, 20);
	}

	// Player vs player
	else if (mode == 1)
	{
		// Remove stage text
		document.getElementById('stageText').textContent = "";

		// Clone Amogus and health bar sprites
		clones.push(sprites[1].cloneNode(true));
		clones.push(sprites[0].cloneNode(true));
		clones.push(sprites[7].cloneNode(true));
		clones.push(sprites[0].cloneNode(true));

		// Add sprites to arena
		arena.appendChild(clones[0]);
		arena.appendChild(clones[1]);
		arena.appendChild(clones[2]);
		arena.appendChild(clones[3]);

		// Initialize player 1 and 2 Amogus objects and start game
		player1 = new Amogus(clones[0], clones[1], 0, 0);
		player2 = new Amogus(clones[2], clones[3], arenaWidth, 0);

		addPlatform(arenaWidth / 2 - 100, arenaHeight / 4, arenaWidth / 2 - 100, arenaHeight / 4, 200, 0);
		addPlatform(arenaWidth / 2 - 300, arenaHeight / 4, arenaWidth / 8, arenaHeight - 100, 200, 5);
		addPlatform(arenaWidth / 2 + 100, arenaHeight / 4, arenaWidth / 8 * 7 - 200, arenaHeight - 100, 200, 5);

		if (audio)
			audio.loop('default');

		interval = setInterval(pvpGame, 20);
	}
}

// Creates and adds an enemy Amogus to the arena
function addEnemy(speed, maxHealth, regen, damage, resistance, sprite = Math.floor(Math.random() * (sprites.length - 2)) + 1) {
	// Clone Amogus and health bar sprites
	clones.push(sprites[sprite].cloneNode(true));
	clones.push(sprites[0].cloneNode(true));

	// Add sprites to arena
	arena.appendChild(clones[clones.length - 2]);
	arena.appendChild(clones[clones.length - 1]);

	// Add Amogus object to enemies
	enemies.push(new Amogus(clones[clones.length - 2], clones[clones.length - 1], Math.floor(Math.random() * arenaWidth - (50 + maxHealth / 2)), -Math.floor(Math.random() * arenaHeight) - (50 + maxHealth / 2), speed, maxHealth, regen, damage, resistance, "#FF3333"));
	enemyLeftMove.push(Math.floor(Math.random() * 2));
}

// Creates and adds a Platform to the arena
function addPlatform(xStart, yStart, xEnd, yEnd, size, speed, passable = true) {
	// Clone bar sprite
	clones.push(sprites[0].cloneNode(true));

	// Add sprite to arena
	arena.appendChild(clones[clones.length - 1]);

	// Add object to platforms
	platforms.push(new Platform(clones[clones.length - 1], xStart, yStart, xEnd, yEnd, size, speed, passable));
}

// Game tick function for single player
function singleGame()
{
	posToKeys(touchPos);
	// Start next stage when all enemies are defeated
	if (aliveEnemies == 0 && player1.pos.y + player1.size < 0) {
		// check if player pos+size < 0, put player at bottom of screen, give a -y boost and spawn platform
		player1.pos.y += arenaHeight;
		player1.nextPos.y += arenaHeight;
		//player1.vel.y = -10;

		stage++;
		// Delete previous stage enemy clones
		for (var i = 2; i < clones.length; i++) arena.removeChild(clones[i]);
		clones.length = 2;
		enemies.length = 0;
		platforms.length = 0;

		addPlatform(arenaWidth / 8, 100, arenaWidth / 8, arenaHeight - 100, 200, 5);
		addPlatform(arenaWidth / 8 * 7 - 200, arenaHeight - 100, arenaWidth / 8 * 7 - 200, 100, 200, 5);

		// Somehow win?? (shouldnt be possible yet)
		if (stage > 100) {
			document.getElementById('stageText').textContent = "Yay, you win! Hope you didn't cheat :)";
			document.getElementById('pauseButton').style.display = "none";
			clearInterval(interval);
			if (audio) {
				audio.stopAll(1);
				audio.start('AMOGUS');
			}
			upgrades1.hide();
			return;
        }
		// Final boss
		else if (stage == 100) {
			addEnemy(
				25,
				250,
				50,
				250,
				25,
				sprites.length - 1
			);
			if (audio) {
				audio.stopAll(1);
				audio.loop('boss');
			}
		}
		// Duel bosses
		else if (stage % 23 == 0) {
			let randSprite = Math.floor(Math.random() * (sprites.length - 2)) + 1;
			addEnemy(
				3,
				stage * 15,
				stage * 3,
				stage / 2,
				1,
				randSprite
			);
			addEnemy(
				stage / 23 * 5,
				100,
				10,
				stage,
				stage / 23 * 3,
				randSprite
			);
			if (audio) {
				audio.stopAll(1);
				audio.loop('23');
			}
		}
		// Regular boss
		else if (stage % 10 == 0) {
			addEnemy(
				stage / 10 + 6,
				stage * 10 + 100,
				stage + 10,
				stage + 10,
				stage / 10
			);
			if (audio) {
				audio.stopAll(1);
				audio.loop('10');
			}
		}
		// Trio round
		else if (stage % 7 == 0) {
			let randSprite = Math.floor(Math.random() * (sprites.length - 2)) + 1;
			for (var i = 0; i < 3; i++) {
				addEnemy(
					stage / 14 + 3,
					stage * 5 + 70,
					stage / 2,
					stage / 2,
					stage / 14,
					randSprite
				);
			}
			if (audio) {
				audio.stopAll(1);
				audio.loop('7');
			}
		}
		else {
			let randAmount = Math.floor(Math.random() * (stage + 5) / 10) + 1;
			for (var i = 0; i < randAmount; i++) {
				addEnemy(
					Math.random() * (stage / 20) + 4,
					Math.random() * (stage * 8) + 25,
					Math.random() * (stage / 2) + 2,
					Math.random() * (stage / 2) + 2,
					1
				);
			}
			if (audio && !audio.playing['default']) {
				audio.stopAll(1);
				audio.loop('default');
			}
		}

		aliveEnemies = enemies.length;
		//// Respawn all currently existing enemies
		//for (var i = 0; i < enemies.length; i++)
		//	enemies[i].respawn();

		upgrades1.hide();
	}
	else if (aliveEnemies == 0 && upgrades1.points > 0) {
		upgrades1.show();
	}
	else if (aliveEnemies == 0 && upgrades1.points == 0) {
		upgrades1.hide();
    }

	player1.computeNextFrame(arenaHeight, 0, arenaWidth);
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].computeNextFrame(arenaHeight, 0, arenaWidth);
	}
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].computeNextFrame();
	}

	// Check player 1 key presses and move Amogus
	if (keys[0] == 1 && keys[2] == 0) player1.left(0); // A key
	if (keys[1] == 1) player1.jump(arenaHeight); // W key
	if (keys[2] == 1 && keys[0] == 0) player1.right(arenaWidth); // D key
	if (keys[3] == 1) player1.crouch(arenaHeight); // S key

	// Enemy movements
	if (stage == 100) { // YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
		let xDist = Math.abs(player1.pos.x + player1.size / 2 - enemies[0].pos.x - enemies[0].size / 2);
		if (xDist < player1.size / 2 + enemies[0].size / 2) {
			if (player1.pos.y + player1.size < enemies[0].pos.y && Math.random() * 23 <= 1)
				enemyLeftMove[0] *= -1;
			else if (enemies[0].pos.y + enemies[0].size < player1.pos.y) {
				enemies[0].crouch(arenaHeight);
				enemyLeftMove[0] = 0;
			}
		}
		else if (xDist < player1.size + enemies[0].size) {
			if (player1.pos.y + player1.size < enemies[0].pos.y && Math.random() * 23 <= 1)
				enemyLeftMove[0] *= -1;
			else if (enemies[0].pos.y + enemies[0].size < player1.pos.y)
				enemyLeftMove[0] = enemies[0].pos.x - player1.pos.x;
		}
		else if (enemies[0].pos.y + enemies[0].size < player1.pos.y) {
			if (player1.pos.x > enemies[0].pos.x)
				enemyLeftMove[0] = -1;
			else
				enemyLeftMove[0] = 1;
		}
		else if (Math.random() * 32 <= 1)
			enemyLeftMove[0] *= -1;

		if (enemies[0].pos.y + enemies[0].size > player1.pos.y)
			enemies[0].jump(arenaHeight);

		if (enemyLeftMove[0] > 0)
			enemies[0].left(0);
		else if (enemyLeftMove[0] < 0)
			enemies[0].right(arenaWidth);
    }
	else {
		for (var i = 0; i < enemies.length; i++) {
			// Randomized enemy movements with some player tracking
			if (Math.random() * 100 <= 1) {
				if (player1.pos.y + player1.size < enemies[i].pos.y && Math.abs(player1.pos.x + player1.size / 2 - enemies[i].pos.x - enemies[i].size / 2) < player1.size)
					enemyLeftMove[i] *= -1;
				else if (player1.pos.x > enemies[i].pos.x)
					enemyLeftMove[i] = -1;
				else
					enemyLeftMove[i] = 1;
			}

			// Move enemy Amogus
			if (Math.floor(Math.random() * 125) <= 1)
				enemies[i].jump(arenaHeight);
			if (enemyLeftMove[i] == 1)
				enemies[i].left(0);
			else
				enemies[i].right(arenaWidth);
		}
	}

	// Check if player or enemies are touching and deal respective damage
	for (var i = 0; i < platforms.length; i++) {
		if (platforms[i].touching(player1)) {
			//something
		}
		else {
			//something
		}
	}


	var touch;
	for (var i = 0; i < enemies.length; i++)
	{
		for (var j = 0; j < platforms.length; j++) {
			if (platforms[j].touching(enemies[i])) {
				//something
			}
			else {
				//something
			}
		}

		touch = player1.touching(enemies[i]);
		//console.log(touch);
		if (touch == 2)
		{
			if (enemies[i].takeDamage(player1))
			{
				player1Kills++;
				aliveEnemies--;
				if (stage % 23 == 0)
					upgrades1.addPoints(2);
				else if (stage % 10 == 0)
					upgrades1.addPoints(3);
				else
					upgrades1.addPoints();
			}
		}
		else if (touch == 1 || touch == -1)
		{
			//clearInterval(interval);
			if (player1.takeDamage(enemies[i]))
			{
				if (audio)
					audio.start('AMOGUS');
				gameEnd();
			}
		}
	}

	// Update current Amogus state for player 1 and enemies
	player1.update(arenaHeight, 0, arenaWidth);
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].update(arenaHeight, 0, arenaWidth);
	}
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].update();
	}

	// Update on-screen text displays
	document.getElementById('stageText').textContent = "Stage " + stage;
	document.getElementById('leftText').textContent = "Kills: " + player1Kills;
	document.getElementById('rightText').textContent = "Enemies: " + aliveEnemies;
}

// Game tick function for two player
function duoGame() { document.getElementById('stageText').textContent = "Coming Soon"; }

// Game tick function for pvp
function pvpGame()
{
	// Calculate next Amogus state for both players
	player1.computeNextFrame(arenaHeight, 0, arenaWidth);
	player2.computeNextFrame(arenaHeight, 0, arenaWidth);
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].computeNextFrame();
	}

	// Check player 1 key presses and move Amogus
	if (keys[0] == 1 && keys[2] == 0) player1.left(0); // A key
	if (keys[1] == 1) player1.jump(arenaHeight); // W key
	if (keys[2] == 1 && keys[0] == 0) player1.right(arenaWidth); // D key
	if (keys[3] == 1) player1.crouch(arenaHeight); // S key

	// Check player 2 key presses and move Amogus
	if (keys[4] == 1 && keys[6] == 0) player2.left(0); // left arrow key
	if (keys[5] == 1) player2.jump(arenaHeight); // up arrow key
	if (keys[6] == 1 && keys[4] == 0) player2.right(arenaWidth); // right arrow key
	if (keys[7] == 1) player2.crouch(arenaHeight); // down arrow key

	// Check if players are touching and deal respective damage
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].touching(player1);
		platforms[i].touching(player2);
	}

	var touch = player1.touching(player2);
	if (touch == 2)
	{
		if (player2.takeDamage(player1))
		{
			player1Kills++;
			player2.respawn();
		}
	}
	else if (touch == -1)
	{
		if (player1.takeDamage(player2))
		{
			player2Kills++;
			player1.respawn();
		}
	}

	// Update current Amogus state for both players
	player1.update(arenaHeight, 0, arenaWidth);
	player2.update(arenaHeight, 0, arenaWidth);
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].update();
	}

	// Update on-screen text displays
	document.getElementById('leftText').textContent = "P1 Kills: " + player1Kills;
	document.getElementById('rightText').textContent = "P2 Kills: " + player2Kills;
}