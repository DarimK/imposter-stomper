// Game variables
const sprites = [document.getElementById('healthBar'), document.getElementById('Red'), document.getElementById('Orange'), document.getElementById('Yellow'), document.getElementById('Lime'), document.getElementById('Green'), document.getElementById('Cyan'), document.getElementById('Blue'), document.getElementById('Purple'), document.getElementById('Pink'), document.getElementById('White'), document.getElementById('Brown'), document.getElementById('Black'), document.getElementById('Secret')];
const arena = document.getElementById('arena');
var arenaWidth = window.innerWidth * 0.9;
var arenaHeight = window.innerHeight * 0.8;
var player1;
var player2;
var enemies = [];
var clones = [];
var interval;
var keys = [0, 0, 0, 0, 0, 0, 0, 0];
var gameMode;
var player1Kills = 0;
var player2Kills = 0;
var stage = 0;
var aliveEnemies = 0;
var enemyLeftMove = [];


function initAudio() {
	document.getElementById('AMOGUS').play();
	document.getElementById('AMOGUS').pause();
}

// Checks which keys have been pressed
document.addEventListener('keydown', function (event)
{
	// W, A, S, D
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
	// W, A, S, D
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

// Pauses and resumes current game
function gameTogglePause()
{
	// If game is running, pause
	if (interval != null) {
		clearInterval(interval);
		interval = null;
		document.getElementById('pauseButton').textContent = "Resume";
		document.getElementById('pauseMenu').style.display = "block";
	}
	// If game is paused, resume
	else
	{
		if (gameMode == 0) interval = setInterval(singleGame, 20);
		else if (gameMode == 1) interval = setInterval(pvpGame, 20);
		document.getElementById('pauseButton').textContent = "Pause";
		document.getElementById('pauseMenu').style.display = "none";
	}
}

// Ends current game and resets variables
function gameEnd()
{
	// Clear game interval and delete all clones
	clearInterval(interval);
	for (var i = 0; i < clones.length; i++) arena.removeChild(clones[i]);
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
}

// Initializes game based on which game-mode is selected
function gameStart(mode)
{
	// Stores selected game mode and sets arena size
	gameMode = mode;
	arenaWidth = window.innerWidth * 0.9;
	arenaHeight = window.innerHeight * 0.8;

	// Hides menu GUI and displays game elements
	document.getElementById('menu').style.display = "none";
	document.getElementById('game').style.display = "block";
	arena.style.width = arenaWidth;
	arena.style.height = arenaHeight;

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
		player1 = new Amogus(clones[0], clones[1], 0, 0);
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
		interval = setInterval(pvpGame, 20);
	}
}

// Game tick function for single player
function singleGame()
{
	// Start next stage when all enemies are defeated
	if (aliveEnemies == 0)
	{
		// Clone Amogus and health bar sprites
		clones.push(sprites[Math.floor(Math.random() * (sprites.length - 2)) + 1].cloneNode(true));
		clones.push(sprites[0].cloneNode(true));

		// Add sprites to arena
		arena.appendChild(clones[clones.length-2]);
		arena.appendChild(clones[clones.length-1]);

		// Add Amogus object to enemies
		enemies.push(new Amogus(clones[clones.length - 2], clones[clones.length - 1], arenaWidth, 0, Math.random() * 3 + 3, Math.random() * (stage * 10) + 25, Math.random() * (stage / 2) + 2, Math.random() * (stage / 2) + 2, "#FF3333"));
		enemyLeftMove.push(Math.floor(Math.random() * 2));
		aliveEnemies = enemies.length;
		stage++;

		// Respawn all currently existing enemies
		for (var i = 0; i < enemies.length; i++)
			enemies[i].respawn();
	}

	// Update current Amogus state for player 1 and enemies
	player1.update(0, arenaHeight, 20, arenaWidth);
	for (var i = 0; i < enemies.length; i++)
		enemies[i].update(0, arenaHeight, 20, arenaWidth);

	// Check if player or enemies are touching and deal respective damage
	var touch;
	for (var i = 0; i < enemies.length; i++)
	{
		touch = player1.touching(enemies[i]);
		if (touch == 2)
		{
			if (enemies[i].takeDamage(player1))
			{
				player1Kills++;
				aliveEnemies--;
			}
		}
		else if (touch == 1 || touch == -1)
		{
			if (player1.takeDamage(enemies[i]))
			{
				document.getElementById('AMOGUS').play();
				gameEnd();
			}
		}
	}

	// Update on-screen text displays
	document.getElementById('stageText').textContent = "Stage " + stage;
	document.getElementById('leftText').textContent = "Kills: " + player1Kills;
	document.getElementById('rightText').textContent = "Enemies: " + aliveEnemies;

	// Check player 1 key presses and move Amogus
	if (keys[0] == 1 && keys[2] == 0) player1.left(); // W key
	if (keys[1] == 1) player1.jump(arenaHeight); // A key
	if (keys[2] == 1 && keys[0] == 0) player1.right(); // S key
	if (keys[3] == 1) player1.crouch(); // D key

	// Enemy movements
	for (var i = 0; i < enemies.length; i++)
	{
		// Randomized enemy movements with some player tracking
		if (Math.random() * 100 <= 1)
		{
			if (player1.yPos + player1.size < enemies[i].yPos && Math.abs(player1.xPos + player1.size / 2 - enemies[i].xPos - enemies[i].size / 2) < player1.size)
				enemyLeftMove[i] *= -1;
			else if (player1.xPos > enemies[i].xPos)
				enemyLeftMove[i] = -1;
			else
				enemyLeftMove[i] = 1;
		}

		// Move enemy Amogus
		if (Math.floor(Math.random() * 125) <= 1)
			enemies[i].jump(arenaHeight);
		if (enemyLeftMove[i] == 1)
			enemies[i].left();
		else
			enemies[i].right();
	}
}

// Game tick function for pvp
function pvpGame()
{
	// Update current Amogus state for both players
	player1.update(0, arenaHeight, 20, arenaWidth);
	player2.update(0, arenaHeight, 20, arenaWidth);

	// Check if players are touching and deal respective damage
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

	// Update on-screen text displays
	document.getElementById('leftText').textContent = "P1 Kills: " + player1Kills;
	document.getElementById('rightText').textContent = "P2 Kills: " + player2Kills;

	// Check player 1 key presses and move Amogus
	if (keys[0] == 1 && keys[2] == 0) player1.left(); // W key
	if (keys[1] == 1) player1.jump(arenaHeight); // A key
	if (keys[2] == 1 && keys[0] == 0) player1.right(); // S key
	if (keys[3] == 1) player1.crouch(); // D key

	// Check player 2 key presses and move Amogus
	if (keys[4] == 1 && keys[6] == 0) player2.left(); // left arrow key
	if (keys[5] == 1) player2.jump(arenaHeight); // up arrow key
	if (keys[6] == 1 && keys[4] == 0) player2.right(); // right arrow key
	if (keys[7] == 1) player2.crouch(); // down arrow key
}
