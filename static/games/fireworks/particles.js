class FireworkShooter {
    constructor(config) {
        this.shootInterval = config.shootInterval;
        this.shootCounter = 0;
        this.origin = config.origin;
        this.mouseDown = false;
        this.fireworks = [];
        this.explosions = [];
        this.speedRange = config.speedRange;
        this.explosionAmount = config.explosionAmount;
        this.colors = config.colors;
        this.lifetimeRange = config.lifetimeRange;
        this.fill = config.fill;
        this.explosionRadius = config.explosionsRadius;
        this.gravity = config.gravity;

        ["mousedown", "touchstart"].forEach(type => {
            canvas.canvas.addEventListener(type, e => {
                this.mouseDown = true;
            });
        });

        ["mouseup", "touchend"].forEach(type => {
            canvas.canvas.addEventListener(type, e => {
                this.mouseDown = false;
            });

            window.addEventListener(type, e => {
                this.mouseDown = false;
            });
        });

        canvas.canvas.addEventListener("touchmove", e => {
            e.preventDefault();
        });
    }

    update(dt) {
        this.shootCounter += dt;

        if (this.shootCounter >= this.shootInterval && this.mouseDown) {
            this.shootCounter = 0;
            this.shoot();
        }

        for (var i = this.fireworks.length - 1; i >= 0; i--) {
            this.fireworks[i].update();
            if (this.fireworks[i].done) {
                this.explode(i);
            }
        }

        for (var i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update();
            if (this.explosions[i].done) {
                this.explosions.splice(i, 1);
            }
        }
    }

    draw() {
        for (var i = this.fireworks.length - 1; i >= 0; i--) {
            this.fireworks[i].draw();
        }

        for (var i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].draw();
        }
    }

    shoot() {
        var p3 = createVector(mouseX, mouseY);
        var p2 = createVector(this.origin.x, (this.origin.y - p3.y) / 5 + p3.y);
    
        this.fireworks.push(new Firework(this.origin.x, this.origin.y, p2.x, p2.y, p3.x, p3.y, 15, 25, true));
    }

    explode(i) {
        var pos = createVector(this.fireworks[i].pos.x, this.fireworks[i].pos.y);

        this.explosions.push(new Explosion(pos.x, pos.y, this.explosionRadius, this.fill, this.speedRange, this.explosionAmount, this.colors, this.lifetimeRange, this.gravity));
        this.fireworks.splice(i, 1);
    }
}

class Firework {
    constructor(x, y, aX, aY, tX, tY, radius, color, fill) {
        this.pos = createVector(x, y);
        this.radius = radius;
        this.fill = fill;
        this.color = color;
        this.target = createVector(tX, tY);
        this.control = createVector(aX, aY);
        this.start = createVector(x, y);
        this.t = 0;
        this.done = false;
    }

    update() {
        if(this.done) {
            return;
        }

        this.pos.x = bezierPoint(this.start.x, this.start.x, this.control.x, this.target.x, this.t);
        this.pos.y = bezierPoint(this.start.y, this.start.y, this.control.y, this.target.y, this.t);
        this.t += globalSpeed / 100;

        if (this.t > 1) {
            this.done = true;
        }
    }

    draw() {
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

class Explosion {
    constructor(x, y, radius, fill, speedRange, amount, colors, lifetimeRange, gravity) {
        this.pos = createVector(x, y);
        this.amount = amount;
        this.colors = colors;
        this.lifetimeRange = lifetimeRange;
        this.lifespan = lifetimeRange[1];
        this.gravity = gravity;
        this.particles = new Array(amount);
        this.radius = radius;
        this.fill = fill;
        this.speedRange = speedRange;
        this.done = false;

        for (var i = this.particles.length - 1; i >= 0; i--) {
            var color = this.colors[floor(random(this.colors.length))];
            var lifespan = floor(random(this.lifetimeRange[0], this.lifetimeRange[1]));
            var speed = random(this.speedRange[0], this.speedRange[1]);
            var vel = p5.Vector.random2D().mult(speed);

            this.particles[i] = new ExplosionParticle(this.pos.x, this.pos.y, vel.x, vel.y, this.radius, color, this.fill, lifespan, this.gravity);
        }
    }

    update() {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
        }
        this.lifespan -= globalSpeed;

        if (this.lifespan <= 0) {
            this.done = true;
        }
    }

    draw() {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].draw();
        }
    }
}

class ExplosionParticle {
    constructor(x, y, velX, velY, radius, color, fill, lifespan, gravity) {
        this.pos = createVector(x, y);
        this.vel = createVector(velX, velY);
        this.radius = radius;
        this.maxRadius = radius;
        this.fill = fill;
        this.color = color;
        this.lifespan = lifespan;
        this.maxLifespan = lifespan;
        this.gravity = gravity;
    }

    update() {
        if(this.lifespan <= 0) {
            return;
        }
        this.vel.y += this.gravity;
        this.lifespan -= globalSpeed;

        this.radius = map(this.lifespan, 0, this.maxLifespan, 0, this.maxRadius);

        this.pos.add(p5.Vector.mult(this.vel, globalSpeed));
    }

    draw() {
        if (this.lifespan <= 0) {
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