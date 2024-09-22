class Particle {
    constructor(x, y, vx, vy, tX, tY, radius, color, maxS, maxF) {
        this.pos = {x: x, y: y};
        this.radius = radius;
        this.color = color;
        this.vel = {x: vx, y: vy};
        this.target = {x: tX, y: tY};
        this.maxspeed = maxS;
        this.maxforce = maxF;
    }

    update(deltaTime) {
        let arrive = this.arrive(this.target);

        this.vel.x += arrive.x;
        this.vel.y += arrive.y;

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        context.fill();
    }

    arrive(target) {
        let desired = {x: target.x - this.pos.x, y: target.y - this.pos.y};
        let d = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
        let speed = this.maxspeed;

        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxspeed);
        }

        let norm = {x: desired.x / d, y: desired.y / d};

        desired = {x: norm.x * speed, y: norm.y * speed};

        let steer = {x: desired.x - this.vel.x, y: desired.y - this.vel.y};

        d = Math.sqrt(steer.x**2 + steer.y**2);
        if (d > this.maxforce) {
            norm = {x: steer.x / d, y: steer.y / d};
            steer = {x: norm.x * this.maxforce, y: norm.y * this.maxforce};
        }

        return steer;
    }

    drawToBuffer(buffer) {
        buffer.fillStyle = this.color;
        buffer.beginPath();
        buffer.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        buffer.fill();
    }

    isInPlace() {
        let d = Math.sqrt((this.pos.x - this.target.x)**2 + (this.pos.y - this.target.y)**2);
        let m = Math.sqrt(this.vel.x**2 + this.vel.y**2);
        return (d < 1 && m < 0.5);
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
        this.buffer = document.createElement("canvas");
        this.bufferContext = this.buffer.getContext("2d");
        this.particleAmount = 0;

        this.buffer.width = canvas.width;
        this.buffer.height = canvas.height;

        this.accumulatedTime = 0;
        this.particleInterval = 1000 / 90;
    }

    init(x, y) {
        let points = getPointsFromText(this.font, this.fontSize, this.text, x, y);

        let config = {
            radius: this.particleConfig.radius,
            maxS: this.particleConfig.maxspeed,
            maxF: this.particleConfig.maxforce
        }

        if (this.randomize) {
            while (points.length > 0) {
                let index = Math.floor(Math.random() * points.length);
                let pos = points[index];
                let color = this.colors[Math.floor(Math.random() * this.colors.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                points.splice(index, 1);

                this.unAParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, color, config.maxS, config.maxF));
            }
        } else {
            for (let i = 0; i < points.length; i++) {
                let pos = points[i];
                let color = this.colors[Math.floor(Math.random() * this.colors.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                this.unAParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, color, config.maxS, config.maxF));
            }
        }

        this.particleAmount = this.unAParticles.length;
    }

    activate() {
        this.activated = true;
        this.running = true;
    }

    draw() {
        if (!this.activated) {
            return;
        }

        for (let i = this.AParticles.length - 1; i >= 0; i--) {
            this.AParticles[i].draw();
        }

        context.drawImage(this.buffer, 0, 0);
    }

    update(deltaTime) {
        if (!this.activated){
            return;
        }

        for (let i = this.AParticles.length - 1; i >= 0; i--) {
            this.AParticles[i].update(deltaTime);
            if (this.AParticles[i].isInPlace()){
                this.AParticles[i].drawToBuffer(this.bufferContext);
                this.bufferParticles.push(this.AParticles[i]);
                this.AParticles.splice(i, 1);
            }
        }

        this.accumulatedTime += deltaTime;
        while (this.accumulatedTime >= this.particleInterval) {
            if (this.unAParticles.length !== 0) {
                this.AParticles.push(this.unAParticles[0]);
                this.unAParticles.splice(0, 1);
            }
            this.accumulatedTime -= this.particleInterval;
        }

        if (this.running) {
            if (this.bufferParticles.length === this.particleAmount) {
                this.running = false;
            }
        }
    }
}