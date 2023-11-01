class Platform
{
    // Platform class to define passable platform objects
    // Handles HTML canvas accessors and Amogus interactions

    constructor(platformDOM, xStart=0, yStart=0, xEnd=0, yEnd=0, size=100, speed=0, passable=true, platformColor="#444444") {
        // HTML DOM elements
        this.platformDOM = platformDOM;
        // Movement properties
        this.start = { x: xStart, y: yStart };
        this.end = { x: xEnd, y: yEnd };
        this.pos = { x: xStart, y: yStart };
        this.nextPos = { x: xStart, y: yStart };
        // Modifiable properties
        this.width = size;
        this.height = size / 10;
        this.pauseLength = 100;
        this.platformColor = platformColor;
        this.passable = passable;
        // Counters
        this.disableMove = 0;

        // Velocity calculations from start/end positions and speed
        if (xStart == xEnd && yStart == yEnd)
            this.vel = { x: 0, y: 0 };
        else if (xStart == xEnd)
            this.vel = { x: 0, y: speed };
        else if (yStart == yEnd)
            this.vel = { x: speed, y: 0 };
        else {
            let theta = Math.atan(Math.abs(yEnd - yStart) / Math.abs(xEnd - xStart));
            this.vel = { x: Math.cos(theta) * speed, y: Math.sin(theta) * speed };
        }

        // Velocity and start/end position flipping based on start/end position inputs
        if (xStart > xEnd) {
            this.start.x = xEnd;
            this.end.x = xStart;
            this.vel.x = -Math.abs(this.vel.x);
        }
        else
            this.vel.x = Math.abs(this.vel.x);
        if (yStart > yEnd) {
            this.start.y = yEnd;
            this.end.y = yStart;
            this.vel.y = -Math.abs(this.vel.y);
        }
        else
            this.vel.y = Math.abs(this.vel.y);

        // Initial display enabling and positioning on screen
        platformDOM.style.display = "block";
        platformDOM.width = this.width;
        platformDOM.height = this.height;
        platformDOM.style.left = xStart + "px";
        platformDOM.style.top = yStart + "px";
        // Sets the Platform HTML element size
        platformDOM.width = this.width;
        platformDOM.height = this.height;
        // Sets the Platform sprite
        platformDOM.getContext("2d").fillStyle = this.platformColor;
        platformDOM.getContext("2d").fillRect(0, 0, this.width, this.height); // replace with draw image sprite for stage type
    }

    // Checks if the Platform collided with an Amogus
    // Returns 1 for Amogus standing on Platform, 0 otherwise
    touching(amogus) {
        // No collision occurs if already touching another platform
        if (amogus.following != null && amogus.following != this)
            return 0;

        // Calculated next x position distances between the Platform and Amogus
        var xDiff = Math.abs(this.nextPos.x + this.width / 2 - amogus.nextPos.x - amogus.size / 2);

        // Checks for collision, alters Amogus movement, and returns a collision value
        if (xDiff < (this.width + amogus.size) / 2) {
            // The Amogus is already on the platform, follow Platform movement
            if (amogus.following == this) {
                if (amogus.nextPos.y + amogus.size >= this.pos.y) {
                    amogus.vel.y = 0;
                    amogus.nextPos.y = this.pos.y - amogus.size;
                }
                if (this.disableMove == 0) {
                    amogus.nextPos.x += this.vel.x;
                    amogus.nextPos.y += this.vel.y;
                }
                return 1;
            }
            // The Amogus lands on top of the platform (passing through), snap to Platform and follow
            else if (amogus.nextPos.y + amogus.size >= this.nextPos.y && amogus.pos.y + amogus.size <= this.pos.y && !amogus.crouching) {
                amogus.nextPos.y = this.nextPos.y - amogus.size;
                if (amogus.vel.y != -10 - 1.5 * amogus.speed)
                    amogus.following = this; // If Amogus didn't just jump, begin following (for when Platform moves up)
                return 1;
            }
        }

        // No collision
        if (amogus.following == this)
            amogus.nextPos.y = this.nextPos.y - amogus.size; // Snap to Platform one last frame (allows Amogus to walk onto another platform)
        amogus.following = null;
        return 0;
    }

    // Calculates and validates the next position of the Platform
    computeNextFrame() {
        // Platform destination pause (movement disable timer)
        if (this.disableMove > 0)
            this.disableMove--;
        else if (this.disableMove == 0) {
            this.nextPos.x += this.vel.x;
            this.nextPos.y += this.vel.y;
        }

        // Update next Platform x and y positions with velocity
        // Check and set the next positions to the start or end positions, if out of bounds, and pause movement
        if (this.nextPos.x < this.start.x) {
            this.disableMove = this.pauseLength;
            this.vel.x *= -1;
            this.nextPos.x = this.start.x;
        }
        else if (this.nextPos.x > this.end.x) {
            this.disableMove = this.pauseLength;
            this.vel.x *= -1;
            this.nextPos.x = this.end.x;
        }
        if (this.nextPos.y < this.start.y) {
            this.disableMove = this.pauseLength;
            this.vel.y *= -1;
            this.nextPos.y = this.start.y;
        }
        else if (this.nextPos.y > this.end.y) {
            this.disableMove = this.pauseLength;
            this.vel.y *= -1;
            this.nextPos.y = this.end.y;
        }
    }

    // Processes all changes to the Platform and updates the HTML element
    update() {
        // Update x and y position of the Platform
        this.pos.x = this.nextPos.x;
        this.pos.y = this.nextPos.y;

        // Sets the position of the HTML element
        this.platformDOM.style.left = this.pos.x + "px";
        this.platformDOM.style.top = this.pos.y + "px";
    }
}