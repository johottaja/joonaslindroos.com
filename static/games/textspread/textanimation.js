class PointSpreadParticleText {
    constructor(config) {
        this.font = config.font;
        this.text = config.text;
        this.fontSize = config.fontSize;
        this.colors = config.colors;
        this.randomize = config.randomize;
        this.spreadFunction = config.spreadFunction;
        this.unActiveParticles = [];
        this.activeParticles = [];
        this.activated = false;
        this.particleConfig = config.particles;
        this.particleAmount = 0;

        this.particleBuffers = [];

        this.accumulatedTime = 0;
        this.particleSendInterval = 1000 / 90;
        this.mouseDown = false;
        this.mousePos = {x: 0, y: 0};
    }

    init(x, y) {
        let targets = getPointsFromText(this.font, this.fontSize, this.text, x, y);

        let config = {
            radius: this.particleConfig.radius,
            maxS: this.particleConfig.maxspeed,
            maxF: this.particleConfig.maxforce
        }

        this.initParticleBuffers();

        if (this.randomize) {
            while (targets.length > 0) {
                let index = Math.floor(Math.random() * targets.length);
                let pos = targets[index];
                let texture = this.particleBuffers[Math.floor(Math.random() * this.particleBuffers.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                targets.splice(index, 1);

                this.unActiveParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, texture, config.maxS, config.maxF));
            }
        } else {
            for (let i = 0; i < targets.length; i++) {
                let pos = targets[i];
                let texture = this.particleBuffers[Math.floor(Math.random() * this.particleBuffers.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                this.unActiveParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, texture, config.maxS, config.maxF));
            }
        }

        this.particleAmount = this.unActiveParticles.length;
    }

    initParticleBuffers() {
        for (let i = 0; i < this.colors.length; i++) {
            let buffer = document.createElement("canvas");
            let bufferContext = buffer.getContext("2d");
            buffer.width = this.particleConfig.radius * 2;
            buffer.height = this.particleConfig.radius * 2;

            bufferContext.fillStyle = this.colors[i];
            bufferContext.beginPath();
            bufferContext.arc(this.particleConfig.radius, this.particleConfig.radius, this.particleConfig.radius, 0, Math.PI * 2);
            bufferContext.fill();

            this.particleBuffers.push(buffer);
        }
    }

    resize(x, y) {
        let targets = getPointsFromText(this.font, this.fontSize, this.text, x, y);

        let config = {
            radius: this.particleConfig.radius,
            maxS: this.particleConfig.maxspeed,
            maxF: this.particleConfig.maxforce
        }

        for (let i = 0; i < this.activeParticles.length; i++) {

            let index = Math.floor(Math.random() * targets.length);
            this.activeParticles[i].target = targets[index];
            targets.splice(index, 1);
        }
    }

    activate() {
        this.activated = true;
    }

    draw() {
        if (!this.activated) {
            return;
        }

        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            this.activeParticles[i].draw();
        }
    }

    update(deltaTime) {
        if (!this.activated){
            return;
        }

        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            this.activeParticles[i].update(deltaTime, this.mouseDown, this.mousePos);
        }

        this.accumulatedTime += deltaTime;
        while (this.accumulatedTime >= this.particleSendInterval) {
            if (this.unActiveParticles.length !== 0) {
                this.activeParticles.push(this.unActiveParticles[0]);
                this.unActiveParticles.splice(0, 1);
            }
            this.accumulatedTime -= this.particleSendInterval;
        }
    }

    updateMouseDown(isDown) {
        this.mouseDown = isDown;
    }

    updateMousePos(x, y) {
        this.mousePos = {x: x, y: y};
    }
}