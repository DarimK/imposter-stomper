class Amogus
{
    // Amogus class to define player and enemy Amogus objects
    // Handles HTML element accessors and Amogus behaviour/physics

    constructor(amogusDOM, healthDOM, xSpawn=0, ySpawn=0, speed=5, maxHealth=50, regen=5, damage=5, resistance=1, healthBarColor="#66FF00") {
        // HTML DOM elements
        this.amogusDOM = amogusDOM;
        this.healthDOM = healthDOM;
        // Movement properties
        this.xSpawn = xSpawn;
        this.ySpawn = ySpawn;
        this.pos = { x: xSpawn, y: ySpawn };
        this.nextPos = { x: xSpawn, y: ySpawn };
        this.vel = { x: 0, y: 0 };
        this.gravity = 1;
        this.following;
        this.collision;
        // Modifiable properties
        this.alive = true;
        this.speed = speed;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.size = 50 + maxHealth / 2;
        this.regen = regen;
        this.damage = damage;
        this.resistance = resistance;
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

    // Amogus jump up action (when enabled and touching ground or a platform)
    jump(ground) {
        if (this.disableMove == 0 && (this.nextPos.y + this.size >= ground || this.following && this.pos.y + this.size >= this.following.pos.y)) {
            this.vel.y = -10 - 1.5 * this.speed;// - Math.sqrt(this.maxHealth / 5);
            this.following = null;
        }
    }

    // Amogus crouch down action (when enabled)
    crouch(ground) {
        if (this.disableMove == 0) {
            // Shrinks Amogus height, reduces x velocity and increases downward y velocity
            this.crouching = this.size / 4;
            this.vel.x *= 0.8;
            if (this.pos.y + this.size < ground)
                this.vel.y += this.speed / 5 + Math.sqrt(this.maxHealth / 100);
            if (this.following) {
                this.following = null;
            }
        }
    }

    // Amogus slide left action (when enabled and not touching left wall)
    left(leftWall) {
        if (this.disableMove == 0 && this.pos.x > leftWall)
            this.vel.x = -this.speed;
    }

    // Amogus slide right action (when enabled and not touching right wall)
    right(rightWall) {
        if (this.disableMove == 0 && this.pos.x + this.size < rightWall)
            this.vel.x = this.speed;
    }

    // Checks if the Amogus had a stomp collision, normal collision, or no collision, and alters the movement of both the Amogus
    // Returns 2 for stomped other, 1 for normal collide, 0 for no collision, -1 for stomped on
    touching(other) {
        // Calculated next x and y position distances between the two Amogus
        var xDiff = Math.abs(this.nextPos.x + this.size / 2 - other.nextPos.x - other.size / 2);
        var yDiff = Math.abs(this.nextPos.y + this.size / 2 - other.nextPos.y - other.size / 2);
        
        // Checks for collisions, alters movement, and returns a collision value
        if (xDiff < (this.size + other.size) / 2 && yDiff < (this.size + other.size) / 2 && other.alive) {
            // Amogus stomps the other, gets bounced slightly and stops following platforms
            if (this.pos.y + this.size <= other.pos.y) {
                this.vel.y = other.vel.y - 15;
                this.nextPos.y = other.nextPos.y - this.size;
                this.following = null;
                if (other.vel.y < 0) other.vel.y = 0;
                return 2;
            }
            // The other stomps Amogus, gets bounced slightly and stops following platforms
            else if (other.pos.y + other.size <= this.pos.y) {
                other.vel.y = this.vel.y - 15;
                other.nextPos.y = this.nextPos.y - other.size;
                other.following = null;
                if (this.vel.y < 0) this.vel.y = 0;
                return -1;
            }

            // Both Amogus horizontally collide, are knocked back and cannot move for a while
            var tempXVel = this.vel.x;
            if (!this.collision) {
                // Alter Amogus movement on first collision only (prevents hitbox merging and damage stacking)
                this.disableMove = 20;
                this.nextPos.x = this.pos.x;
                this.nextPos.y = this.pos.y;
                this.following = null;
                this.vel.x = other.vel.x + this.vel.x * -0.5;
                this.vel.y -= 10;
            }
            other.disableMove = 20;
            other.nextPos.x = other.pos.x;
            other.nextPos.y = other.pos.y;
            other.following = null;
            other.vel.x = tempXVel + other.vel.x * -0.5;
            other.vel.y -= 10;
            if (this.collision)
                return 0; // No collision if already registered once
            this.collision = other;
            return 1;
        }

        // No collision
        if (this.collision == other)
            this.collision = null; // Re-enables Amogus collision movement if other amogus (collision initiator) is no longer colliding
        return 0;
    }

    // Applies the damage dealt by the other amogus to this amogus
    // Returns 0 if the Amogus has health left, 1 otherwise
    takeDamage(other) {
        this.health -= (other.damage + (other.maxHealth / 100) ** 1.5) / this.resistance;
        if (this.health <= 0) {
            // Disable updates and position off screen once killed
            this.alive = false;
            this.disableMove = 1;
            this.health = 0;
            this.pos = { x: 0, y: -window.innerHeight };
            this.nextPos = { x: 0, y: -window.innerHeight };
            this.amogusDOM.style.display = "none";
            this.healthDOM.style.display = "none";
            this.amogusDOM.style.top = -window.innerHeight + "px";
            this.healthDOM.style.top = -window.innerHeight + "px";
            return 1;
        }
        return 0;
    }

    // Respawns the Amogus at its spawn point
    respawn() {
        this.alive = true;
        this.health = this.maxHealth;
        this.disableRegen = 250;
        this.pos.x = this.xSpawn;
        this.pos.y = this.ySpawn;
        this.nextPos.x = this.xSpawn;
        this.nextPos.y = this.ySpawn;
        this.amogusDOM.style.display = "block";
        this.healthDOM.style.display = "block";
    }


    // Calculates and validates the next position of the Amogus
    computeNextFrame(ground, leftWall, rightWall) {
        // Checks if Amogus is alive, computes nothing if it's not
        if (!this.alive)
            return;

        // Slows x movement and applies gravity
        this.vel.x -= this.vel.x / 20;
        this.vel.y += this.gravity;

        // Applies regen when enabled and valid
        if (this.disableRegen == 0 && this.health < this.maxHealth) {
            this.health += this.regen;
            if (this.health > this.maxHealth)
                this.health = this.maxHealth;
            this.disableRegen = 250;
        }

        // Movement, regen, and crouching disable timer tick
        if (this.disableMove > 0)
            this.disableMove--;
        if (this.disableRegen > 0 && this.health < this.maxHealth)
            this.disableRegen--;
        if (this.crouching > 0)
            this.crouching = 0; //this.crouching -= this.size / 16; // idk might change this later (smoother release)

        // Update next x and y position of the Amogus
        this.nextPos.x += this.vel.x;
        this.nextPos.y += this.vel.y;

        // Update size of the Amogus
        this.size = 50 + this.maxHealth / 2;

        // Check and set the next Amogus x position to the left or right wall, if out of bounds
        if (this.nextPos.x < leftWall) {
            this.vel.x = 0;
            this.nextPos.x = leftWall;
        }
        else if (this.nextPos.x + this.size > rightWall) {
            this.vel.x = 0;
            this.nextPos.x = rightWall - this.size;
        }

        // Check and set the Amogus y position to the ground, if out of bounds
        if (this.nextPos.y + this.size > ground) {
            this.vel.y = 0;
            this.nextPos.y = ground - this.size;
        }
    }

    // Processes all changes to the Amogus and updates the Amogus HTML element
    update(ground, leftWall, rightWall) {
        // Checks if Amogus is alive, updates nothing if it's not
        if (!this.alive)
            return;

        // Update x and y position of the Amogus
        this.pos.x = this.nextPos.x;
        this.pos.y = this.nextPos.y;

        // Sets the position of the Amogus HTML element
        this.amogusDOM.style.left = this.pos.x + "px";
        this.amogusDOM.style.top = this.pos.y + this.crouching + "px";

        // Sets the position of the health bar HTML element
        this.healthDOM.style.left = this.pos.x + "px";
        this.healthDOM.style.top = this.pos.y + this.crouching - this.size / 5 + "px";

        // Sets the Amogus HTML element size
        this.amogusDOM.width = this.size;
        this.amogusDOM.height = this.size - this.crouching;

        // Sets the health bar HTML element size
        this.healthDOM.width = this.size;

        // Sets the direction for which the Amogus HTML element should face
        if (this.vel.x > 0 || this.pos.x == leftWall)
            this.amogusDOM.style.transform = 'scaleX(1)'; // Face right
        else
            this.amogusDOM.style.transform = 'scaleX(-1)'; // Face left

        // Sets the health bar HTML element to current Amogus health (with color)
        this.healthDOM.getContext("2d").clearRect(0, 0, this.size, 5);
        this.healthDOM.getContext("2d").fillStyle = this.healthBarColor;
        this.healthDOM.getContext("2d").fillRect(0, 0, this.size * (this.health / this.maxHealth), 5);
    }
}