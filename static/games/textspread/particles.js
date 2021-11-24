class Particle {
    constructor(x, y, tX, tY, radius, color, fill, maxS, maxF) {
        this.pos = createVector(x, y);
        this.radius = radius;
        this.fill = fill;
        this.color = color;
        this.vel = createVector();
        this.acc = createVector();
        this.target = createVector(tX, tY);
        this.maxspeed = maxS;
        this.maxforce = maxF;
    }

    update() {
        var arrive = this.arrive(this.target);

        this.applyForce(arrive);
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
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

    applyForce(f) {
        this.acc.add(f);
    }

    arrive(target) {
        var desired = p5.Vector.sub(target, this.pos);
        var d = desired.mag();
        var speed = this.maxspeed;
        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxspeed);
        }
        desired.setMag(speed);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;
    }

    drawToBuffer(buffer) {
        if (this.fill) {
            buffer.fill(this.color);
            buffer.noStroke();
        } else {
            buffer.stroke(this.color);
            buffer.noFill();
        }

        buffer.ellipseMode(RADIUS);

        buffer.ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    }

    isInPlace() {
        if ((dist(this.pos.x, this.pos.y, this.target.x, this.target.y) < 1) && this.vel.mag() < 0.5) {
            return true;
        }
        return false;
    }
}

class PointSpreadParticleText {
    constructor(config) {
        this.font = config.font;
        this.text = config.text;
        this.fontSize = config.fontSize;
        this.colors = config.colors;
        this.spreadPoints = config.spreadPoints;
        this.unAParticles = [];
        this.AParticles = [];
        this.bufferParticles = [];
        this.activated = false;
        this.running = false;
        this.particleConfig = config.particles;
        this.buffer = createGraphics(windowWidth, windowHeight);
        this.particleAmount = 0;
        this.callback = config.callback;

        textSize(this.fontSize);
        textFont(this.font);

        this.w = textWidth(this.text);
        this.h = this.fontSize;
    }

    init(x, y) {
        var posses = font.textToPoints(this.text, x, y, this.fontSize, {sampleFactor: 0.1});

        var config = {
            radius: this.particleConfig.radius,
            fill: this.particleConfig.fill,
            maxS: this.particleConfig.maxspeed,
            maxF: this.particleConfig.maxforce
        }

        for (var i = 0; i < posses.length; i++) {
            var pos = posses[i];
            var color = this.colors[Math.floor(Math.random() * this.colors.length)];
            var SP = this.spreadPoints[Math.floor(Math.random() * this.spreadPoints.length)];

            this.unAParticles.push(new Particle(SP.x, SP.y, pos.x, pos.y, config.radius, color, config.fill, config.maxS, config.maxF));
        }

        this.particleAmount = this.unAParticles.length;
    }

    activate() {
        this.activated = true;
        this.running = true;
    }

    draw() {

        ellipseMode(RADIUS);

        if (!this.activated) {
            return;
        }

        for (var i = this.AParticles.length - 1; i >= 0; i--) {
            this.AParticles[i].draw();
        }

        image(this.buffer, 0, 0);
    }

    update() {
        if (!this.activated){
            return;
        }

        for (var i = this.AParticles.length - 1; i >= 0; i--) {
            this.AParticles[i].update();
            if (this.AParticles[i].isInPlace()){
                this.AParticles[i].drawToBuffer(this.buffer);
                this.bufferParticles.push(this.AParticles[i]);
                this.AParticles.splice(i, 1);
            }
        }

        if (this.unAParticles.length != 0) {
            var index = Math.floor(Math.random() * this.unAParticles.length);
            this.AParticles.push(this.unAParticles[index]);
            this.unAParticles.splice(index, 1);
        }

        if (this.unAParticles.length != 0) {
            var index = Math.floor(Math.random() * this.unAParticles.length);
            this.AParticles.push(this.unAParticles[index]);
            this.unAParticles.splice(index, 1);
        }

        if (this.running) {
            if (this.bufferParticles.length == this.particleAmount) {
                this.running = false;
            }
        }
    }
}