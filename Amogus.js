class Amogus
{
    // Amogus class to define player and enemy Amogus objects
    // Handles HTML element accessors and Amogus behaviour/physics

    constructor(amogusDOM, healthDOM, xSpawn=0, ySpawn=0, speed=5, maxHealth=50, regen=5, damage=5, healthBarColor="#66FF00")
    {
        // HTML DOM elements
        this.amogusDOM = amogusDOM;
        this.healthDOM = healthDOM;
        // Movement properties
        this.xSpawn = xSpawn;
        this.ySpawn = ySpawn;
        this.xPos = xSpawn;
        this.yPos = ySpawn;
        this.xVel = 0;
        this.yVel = 0;
        this.gravity = 1;
        // Modifiable properties
        this.alive = true;
        this.speed = speed;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.size = 50 + maxHealth / 2;
        this.regen = regen;
        this.damage = damage;
        this.healthBarColor = healthBarColor;
        // Counters
        this.disableMove = 0;
        this.disableRegen = 250;
        this.crouching = 0;
        // Initial display enabling and positioning off screen
        amogusDOM.style.display = "block";
        healthDOM.style.display = "block";
        amogusDOM.style.top = -window.innerHeight + "px";
        healthDOM.style.top = -window.innerHeight + "px";
    }

    // Amogus jump up action (when touching ground)
    jump(ground)
    {
        if (this.yPos + this.size >= ground)
            this.yVel = -10 - 1.5 * this.speed;
    }

    // Amogus crouch down action (when enabled)
    crouch()
    {
        if (this.disableMove == 0)
        {
            this.xVel *= 0.8;
            this.crouching = this.size / 4;
        }
    }

    // Amogus slide left action (when enabled)
    left()
    {
        if (this.disableMove == 0)
            this.xVel = -this.speed;
    }

    // Amogus slide right action (when enabled)
    right()
    {
        if (this.disableMove == 0)
            this.xVel = this.speed;
    }

    // Checks if the Amogus had a stomp collision, normal collision, or no collision, and alters the movement of both the Amogus
    // Returns 2 for stomped other, 1 for normal collide, 0 for no collision, -1 for stomped on
    touching(other)
    {
        // Calculated x and y position distances between the two Amogus
        var xDiff = Math.abs(this.xPos + this.size / 2 + this.xVel - other.xPos - other.size / 2 - other.xVel);
        var yDiff = Math.abs(this.yPos + this.size / 2 + this.yVel - other.yPos - other.size / 2 - other.yVel);

        // Checks for collisions, alters movement, and returns a collision value
        if (xDiff < (this.size + other.size) / 2 && yDiff < (this.size + other.size) / 2)
        {
            if (this.yPos + 0.9 * this.size - this.yVel < other.yPos - other.yVel)
            {
                // Bounce the Amogus slightly
                this.yVel = other.yVel - 15;
                this.yPos = other.yPos - this.size;
                if (other.yVel < 0) other.yVel = 0;
                return 2;
            }
            else if (other.yPos + 0.9 * other.size - other.yVel < this.yPos - this.yVel)
            {
                // Bounce the other Amogus slightly
                other.yVel = this.yVel - 15;
                other.yPos = this.yPos - other.size;
                if (this.yVel < 0) this.yVel = 0;
                return -1;
            }
            // Both Amogus are knocked back and cannot move for a while
            this.disableMove = 20;
            other.disableMove = 20;
            var tempXVel = this.xVel;
            this.xVel = other.xVel + this.xVel * -0.5;
            this.yVel -= 10;
            other.xVel = tempXVel + other.xVel * -0.5;
            other.yVel -= 10;
            return 1;
        }
        // No collision
        return 0;
    }

    // Applies the damage dealt by the other Amogus to this Amogus
    // Returns 0 if the Amogus has health left, 1 otherwise
    takeDamage(other)
    {
        this.health -= other.damage;
        if (this.health <= 0)
        {
            this.alive = false;
            this.health = 0;
            this.xPos = 0;
            this.yPos = -window.innerHeight;
            this.amogusDOM.style.display = "none";
            this.healthDOM.style.display = "none";
            this.amogusDOM.style.top = -window.innerHeight + "px";
            this.healthDOM.style.top = -window.innerHeight + "px";
            return 1;
        }
        return 0;
    }

    // Respawns the Amogus at its spawn point
    respawn()
    {
        this.alive = true;
        this.health = this.maxHealth;
        this.disableRegen = 250;
        this.xPos = this.xSpawn;
        this.yPos = this.ySpawn;
        this.amogusDOM.style.display = "block";
        this.healthDOM.style.display = "block";
    }

    // Processes all changes to the Amogus object and updates the Amogus HTML element
    update(roof, ground, leftWall, rightWall)
    {
        // Checks if Amogus is alive, updates nothing if it's not
        if (!this.alive) return;

        // Update x and y position of the Amogus
        this.xPos += this.xVel;
        this.yPos += this.yVel;

        // Check and set the Amogus x position to the left or right wall, if out of bounds
        if (this.xPos < leftWall)
        {
            this.xVel = 0;
            this.xPos = leftWall;
        }
        else if (this.xPos + this.size > rightWall)
        {
            this.xVel = 0;
            this.xPos = rightWall - this.size;
        }

        // Check and set the Amogus y position to the roof or ground, if out of bounds
        if (this.yPos < roof)
        {
            this.yVel = 0;
            this.yPos = roof;
        }
        else if (this.yPos + this.size > ground)
        {
            this.yVel = 0;
            this.yPos = ground - this.size;
        }

        // Sets the position of the Amogus HTML element
        this.amogusDOM.style.left = this.xPos + "px";
        this.amogusDOM.style.top = this.yPos + this.crouching + "px";

        // Sets the position of the health bar HTML element
        this.healthDOM.style.left = this.xPos + "px";
        this.healthDOM.style.top = this.yPos + this.crouching - this.size / 5 + "px";

        // Sets the Amogus HTML element size
        this.amogusDOM.width = this.size;
        this.amogusDOM.height = this.size - this.crouching;

        // Sets the health bar HTML element size
        this.healthDOM.width = this.size;

        // Sets the direction for which the Amogus HTML element should face
        if (this.xVel > 0 || this.xPos == leftWall)
            this.amogusDOM.style.transform = 'scaleX(1)'; // Face right
        else
            this.amogusDOM.style.transform = 'scaleX(-1)'; // Face left

        // Sets the health bar HTML element to current Amogus health (with color)
        this.healthDOM.getContext("2d").clearRect(0, 0, this.size, 5);
        this.healthDOM.getContext("2d").fillStyle = this.healthBarColor;
        this.healthDOM.getContext("2d").fillRect(0, 0, this.size * (this.health / this.maxHealth), 5);

        // Slows x movement, applies gravity, and applies regen
        this.xVel -= this.xVel / 20;
        this.yVel += this.gravity;
        if (this.disableRegen == 0 && this.health < this.maxHealth)
        {
            this.health += this.regen;
            if (this.health > this.maxHealth)
                this.health = this.maxHealth;
            this.disableRegen = 250;
        }

        // Movement, regen, and crouching disable timers
        if (this.disableMove > 0)
            this.disableMove--;
        if (this.disableRegen > 0 && this.health < this.maxHealth)
            this.disableRegen--;
        if (this.crouching > 0)
            this.crouching = 0; //this.crouching -= this.size / 16;
    }
}