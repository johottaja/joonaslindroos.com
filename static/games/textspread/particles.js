class Particle {
    constructor(x, y, vx, vy, tX, tY, radius, color, fill, maxS, maxF) {
        this.pos = createVector(x, y);
        this.radius = radius;
        this.fill = fill;
        this.color = color;
        this.vel = createVector(vx, vy);
        this.acc = createVector();
        this.target = createVector(tX, tY);
        this.maxspeed = maxS;
        this.maxforce = maxF;
    }

    update() {
        let arrive = this.arrive(this.target);

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
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();
        let speed = this.maxspeed;
        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxspeed);
        }
        desired.setMag(speed);
        let steer = p5.Vector.sub(desired, this.vel);
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
        this.randomize = config.randomize;
        this.spreadFunction = config.spreadFunction;
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
        let posses = font.textToPoints(this.text, x, y, this.fontSize, {sampleFactor: 0.1});

        let config = {
            radius: this.particleConfig.radius,
            fill: this.particleConfig.fill,
            maxS: this.particleConfig.maxspeed,
            maxF: this.particleConfig.maxforce
        }

        if (this.randomize) {
            while (posses.length > 0) {
                let index = Math.floor(Math.random() * posses.length);
                let pos = posses[index];
                let color = this.colors[Math.floor(Math.random() * this.colors.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                posses.splice(index, 1);

                this.unAParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, color, config.fill, config.maxS, config.maxF));
            }
        } else {
            for (let i = 0; i < posses.length; i++) {
                let pos = posses[i];
                let color = this.colors[Math.floor(Math.random() * this.colors.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                this.unAParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, color, config.fill, config.maxS, config.maxF));
            }
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

        for (let i = this.AParticles.length - 1; i >= 0; i--) {
            this.AParticles[i].draw();
        }

        image(this.buffer, 0, 0);
    }

    update() {
        if (!this.activated){
            return;
        }

        for (let i = this.AParticles.length - 1; i >= 0; i--) {
            this.AParticles[i].update();
            if (this.AParticles[i].isInPlace()){
                this.AParticles[i].drawToBuffer(this.buffer);
                this.bufferParticles.push(this.AParticles[i]);
                this.AParticles.splice(i, 1);
            }
        }

        if (this.unAParticles.length != 0) {
            this.AParticles.push(this.unAParticles[0]);
            this.unAParticles.splice(0, 1);
        }

        if (this.unAParticles.length != 0) {
            this.AParticles.push(this.unAParticles[0]);
            this.unAParticles.splice(0, 1);
        }

        if (this.running) {
            if (this.bufferParticles.length == this.particleAmount) {
                this.running = false;
            }
        }
    }
}