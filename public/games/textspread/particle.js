class Particle {
    constructor(x, y, vx, vy, tX, tY, radius, texture, maxS, maxF) {
        this.pos = {x: x, y: y};
        this.radius = radius;
        this.texture = texture;
        this.vel = {x: vx, y: vy};
        this.target = {x: tX, y: tY};
        this.maxspeed = maxS;
        this.maxforce = maxF;
    }

    update(deltaTime, mouseDown, mousePos) {
        let arrive = this.arrive(this.target);

        if (mouseDown) {
            let avoid = this.avoid(mousePos);
            this.vel.x += avoid.x;
            this.vel.y += avoid.y;
        }

        this.vel.x += arrive.x;
        this.vel.y += arrive.y;

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    draw() {
        context.drawImage(this.texture, this.pos.x, this.pos.y);
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

    avoid(mouse) {
        let desired = {x: -(mouse.x - this.pos.x), y: -(mouse.y - this.pos.y)};
        let d = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
        if (d > 100) return {x: 0, y: 0};

        let speed = this.maxspeed / 10;

        let norm = {x: desired.x / d, y: desired.y / d};

        desired = {x: norm.x * speed, y: norm.y * speed};

        return desired;
    }

    drawToBuffer(buffer) {
        buffer.drawImage(this.texture, this.pos.x, this.pos.y);
    }

    isInPlace() {
        let d = Math.sqrt((this.pos.x - this.target.x)**2 + (this.pos.y - this.target.y)**2);
        let m = Math.sqrt(this.vel.x**2 + this.vel.y**2);
        return (d < 1 && m < 0.5);
    }
}
