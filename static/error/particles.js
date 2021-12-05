class Particle {
    constructor(x, y, velX, velY, radius, speed, color, fill) {
        this.pos = createVector(x, y);
        this.originalRadius = radius;
        this.radius = radius;
        this.fill = fill;
        this.color = color;
        this.speed = speed;
        this.vel = p5.Vector.random2D().mult(2);
        this.show = false;
    }

    update() {
        this.pos.add(this.vel);

        if (this.pos.x - this.radius <= 0) {
            this.vel.x = this.speed;
        } else if (this.pos.x + this.radius >= window.innerWidth) {
            this.vel.x = -this.speed;
        }

        if (this.pos.y - this.radius <= 0) {
            this.vel.y = this.speed;
        } else if (this.pos.y + this.radius >= window.innerHeight) {
            this.vel.y = -this.speed;
        }

        let d = dist(this.pos.x, this.pos.y, mouseX, mouseY);

        if (d < 300) {
            this.radius = (300-d) / 2;
            this.show = true;
        } else {
            this.radius = 0;
            this.show = false;
        }

        //this.radius = constrain(this.radius, this.originalRadius, 80);

    }

    draw() {
        if (!this.show && this.radius === this.originalRadius) {
            return;
        }

        if (this.fill) {
            fill(this.color);
            noStroke();
        } else {
            stroke(this.color);
            noFill();
        }

        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    }
}

class BackgroundParticleSystem {
    constructor(config) {
        this.particles = new Array(config.particleAmount);
        this.particleAmount = config.particleAmount;
        this.radiuses = config.radiuses;
        this.speeds = config.speeds;
        this.colors = config.colors;
        this.fill = config.fill;
        this.active = false;
    }

    init() {
        for (let i = 0; i < this.particles.length; i++) {

            let color = this.colors[floor(random(this.colors.length))];
            let radius = this.radiuses[floor(random(this.radiuses.length))];
            let speed = this.speeds[floor(random(this.speeds.length))];

            let velX = random() < 0.5 ? speed : -speed;

            let velY = random() < 0.5 ? speed : -speed;

            let x = random(window.innerWidth);
            let y = random(window.innerHeight);

            this.particles[i] = new Particle(x, y, velX, velY, radius, speed, color, this.fill);
        } 
    }

    update() {
        if (!this.active)
            return;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
        }
    }

    draw() {
        if (!this.active)
            return;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].draw();
        }
    }

    activate() {
        this.active = true;
    }
}