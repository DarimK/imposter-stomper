//work in progress so some comments and features are missing
setInterval(gameTick, 20); // framerate

var pVelX = 10;
var pVelY = 0;
var pSize = 50;
var eVelX = -8;
var eVelY = 0;
var eSize = 50;
var ground = Math.floor(window.innerHeight / 20) * 20;
var score = 0;
var amogus = true;

function touching ()
{
	pPosX = document.getElementById('player').offsetLeft + pSize / 2
	pPosY = document.getElementById('player').offsetTop + pSize / 2
	
	ePosX = document.getElementById('enemy').offsetLeft + eSize / 2
	ePosY = document.getElementById('enemy').offsetTop + eSize / 2

	if (Math.abs(pPosX - ePosX) < (pSize + eSize) / 2 && Math.abs(pPosY - ePosY) < (pSize + eSize) / 2)
	{
		if (pPosY + pSize / 2 - eSize < ePosY && pVelY > 5 + eVelY) { return 2; }
		return 0;
	}
	else { return 1; }
}

function pMove () // handles all player movements
{
	pVelX -= (pVelX / Math.abs(pVelX)) / 5; // slow x movements
	if (document.getElementById('player').offsetTop + pSize < ground) { pVelY += 1; } // gravity (stops at ground line)
	else if (pVelY > 0) { pVelY = 0; document.getElementById('player').style.top = ground - pSize; } // stops gravity

	if (pVelX >= -1) { document.getElementById('player').style.transform = 'scaleX(1)'; } // face right when moving right
	else { document.getElementById('player').style.transform = 'scaleX(-1)'; } // face left when moving left

	document.getElementById('player').style.left = document.getElementById('player').offsetLeft + pVelX + "px"; // change x position
	document.getElementById('player').style.top = document.getElementById('player').offsetTop + pVelY + "px"; // change y position

	if (document.getElementById('player').offsetLeft + pSize <= 0 && pVelX < 0) { document.getElementById('player').style.left = window.innerWidth + "px"; }
	if (document.getElementById('player').offsetLeft >= window.innerWidth && pVelX > 0) { document.getElementById('player').style.left = 0 - pSize + "px"; }
}

function eMove () // handles all enemy movements
{
	if (document.getElementById('enemy').offsetTop + eSize >= ground && Math.floor(Math.random() * 75) == 0) { eVelY -= 25; }
	if (Math.floor(Math.random() * 90) == 0) { eVelX *= -1 }

	if (document.getElementById('enemy').offsetTop + eSize < ground) { eVelY += 1; } // gravity (stops at ground line)
	else if (eVelY > 0) { eVelY = 0; document.getElementById('enemy').style.top = ground - eSize; } // stops gravity

	if (eVelX >= -1) { document.getElementById('enemy').style.transform = 'scaleX(1)'; } // face right when moving right
	else { document.getElementById('enemy').style.transform = 'scaleX(-1)'; } // face left when moving left

	document.getElementById('enemy').style.left = document.getElementById('enemy').offsetLeft + eVelX + "px"; // change x position
	document.getElementById('enemy').style.top = document.getElementById('enemy').offsetTop + eVelY + "px"; // change y position

	if (document.getElementById('enemy').offsetLeft + eSize <= 0 && eVelX < 0) { document.getElementById('enemy').style.left = window.innerWidth + "px"; }
	if (document.getElementById('enemy').offsetLeft >= window.innerWidth && eVelX > 0) { document.getElementById('enemy').style.left = 0 - eSize + "px"; }
}

function gameTick () // processes and outputs frame changes
{
	ground = Math.floor(window.innerHeight / 20) * 20;

	document.getElementById('player').style.width = pSize; document.getElementById('player').style.height = pSize;
	document.getElementById('enemy').style.width = eSize; document.getElementById('enemy').style.height = eSize;

	pMove();
	eMove();

	if (touching() == 2)
	{
		pSize += 10;
		eSize -= 5 + Math.floor(pSize / 10);
		if (eSize < 10)
		{
			eSize = 50 + Math.floor(pSize / 3);
			score += 1;
			document.getElementById('enemy').style.left = window.innerWidth / 4 * 3;
			document.getElementById('enemy').style.top = 0 - eSize;
		}
		else
		{
			pVelY = eVelY - 15;
			document.getElementById('player').style.top = document.getElementById('enemy').offsetTop - pSize;
		}
	}
	else if (touching() == 0)
	{
		pSize -= 5 + Math.floor(eSize / 20);
		eSize += 5;
		if (pSize < 10)
		{
			pSize = 50;
			score = 0;
			document.getElementById('player').style.left = window.innerWidth / 4;
			document.getElementById('player').style.top = 0 - pSize;
		}
		else
		{
			pVelX = eVelX * 1.5;
			pVelY -= 10;
			eVelX *= -1;
			document.getElementById('enemy').style.top = document.getElementById('enemy').offsetTop - 5;
		}
	}

	document.getElementById('score').textContent = "Score: " + score;
	document.getElementById('size').textContent = "Size: " + pSize;

	if (amogus && score >= 10 && pSize >= 500) { var audio = new Audio('AMOGUS.mp3'); audio.play(); amogus = false; } // funny amogus reward
	else if (pSize < 500) { amogus = true; }
}


function jump () { if (document.getElementById('player').offsetTop + pSize >= ground) { pVelY -= 10 + Math.floor(Math.sqrt(eSize)); } } // standing on ground line: jump

function left () { pVelX = -8 } // slide left

function right () { pVelX = 8 } // slide right

document.addEventListener('keydown', function(event) // checks for keys pressed
{
	if (event.keyCode == 38) { jump(); } // up arrow key
	if (event.keyCode == 37) { left(); } // left arrow key
	if (event.keyCode == 39) { right(); } // right arrow key
});
