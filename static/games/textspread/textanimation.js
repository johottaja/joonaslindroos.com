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
        this.particleConfig = config.particles;
        this.buffer = document.createElement("canvas");
        this.bufferContext = this.buffer.getContext("2d");
        this.particleAmount = 0;

        this.buffer.width = canvas.width;
        this.buffer.height = canvas.height;

        this.particleBuffers = [];

        this.accumulatedTime = 0;
        this.particleSendInterval = 1000 / 90;
        this.mouseDown = false;
        this.mousePos = {x: 0, y: 0};
    }

    init(x, y) {
        let points = getPointsFromText(this.font, this.fontSize, this.text, x, y);

        let config = {
            radius: this.particleConfig.radius,
            maxS: this.particleConfig.maxspeed,
            maxF: this.particleConfig.maxforce
        }

        this.initParticleBuffers();

        if (this.randomize) {
            while (points.length > 0) {
                let index = Math.floor(Math.random() * points.length);
                let pos = points[index];
                let texture = this.particleBuffers[Math.floor(Math.random() * this.particleBuffers.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                points.splice(index, 1);

                this.unAParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, texture, config.maxS, config.maxF));
            }
        } else {
            for (let i = 0; i < points.length; i++) {
                let pos = points[i];
                let texture = this.particleBuffers[Math.floor(Math.random() * this.particleBuffers.length)];
                let SP = this.spreadFunction.next().value;
                let v = SP.vel;
                let p = SP.pos;

                this.unAParticles.push(new Particle(p.x, p.y, v.x, v.y, pos.x, pos.y, config.radius, texture, config.maxS, config.maxF));
            }
        }

        this.particleAmount = this.unAParticles.length;
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

    activate() {
        this.activated = true;
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
            this.AParticles[i].update(deltaTime, this.mouseDown, this.mousePos);
            /*if (this.AParticles[i].isInPlace()){
                this.AParticles[i].drawToBuffer(this.bufferContext);
                this.bufferParticles.push(this.AParticles[i]);
                this.AParticles.splice(i, 1);
            }*/
        }

        this.accumulatedTime += deltaTime;
        while (this.accumulatedTime >= this.particleSendInterval) {
            if (this.unAParticles.length !== 0) {
                this.AParticles.push(this.unAParticles[0]);
                this.unAParticles.splice(0, 1);
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