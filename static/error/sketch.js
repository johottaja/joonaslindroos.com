const canvas = document.getElementById("canvas"); //TODO: IMPROVE PERFORMANCE ON RESIZE AND SCROLL
const context = canvas.getContext("2d");

const particles = [];
const GRAVITY = { x: 0, y: 0.02 };
const FRICTION = -0.02;
const particleCount = 20;
const radiusRange = {min: 10, max: 30};
const massRange = {min: 10, max: 30};
const colors = ["#03A1DA", "#86BF28", "#CEDA07", "#F3B129", "#F12522"];

const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

function start() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
        let color = colors[Math.floor(Math.random() * (colors.length + 1))];
        let radius = Math.random() * (radiusRange.max - radiusRange.min) + radiusRange.min
        let mass = map(radius, radiusRange.min, radiusRange.max, massRange.min, massRange.max) / 5;
        let x = Math.random() * (canvas.width - radiusRange.max*2) + radiusRange.max;
        particles.push(new Particle(x, 0, radius, mass, color));
    }
    window.requestAnimationFrame(draw);
}

const TPS = 60;
const frameTime = 1000/TPS;
let accumulatedTime = 0;
let lastTime = 0;
function draw(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    accumulatedTime += deltaTime;
    if (accumulatedTime >= frameTime) {
        while (accumulatedTime >= frameTime) {
            for (let i = 0; i < particles.length; i++) {
                particles[i].collisions(i);
                particles[i].outOfOthers(i);
                particles[i].update();
            }
            accumulatedTime -= frameTime;
        }
    }

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
    }

    window.requestAnimationFrame(draw);
}

class Particle {
    constructor(x, y, radius, mass, color) {
        this.pos = { x: x, y: y };
        this.vel = { x: Math.random() * 20 - 10, y: 0 };
        this.acc = { x: 0, y: 0 }
        this.radius = radius;
        this.mass = mass;
        this.color = color;
    }

    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        context.fill();
    }

    update() {
        this.applyForce({ x: GRAVITY.x * this.mass, y: GRAVITY.y * this.mass });

        if (this.pos.y > canvas.height - this.radius) {
            this.vel.y = -this.vel.y;
            this.pos.y = canvas.height - this.radius;
        }

        if (this.pos.x - this.radius < 0) {
            this.vel.x = Math.abs(this.vel.x);
        }
        if (this.pos.x + this.radius > canvas.width) {
            this.vel.x = -Math.abs(this.vel.x);
        }

        this.friction();

        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        this.acc = { x: 0, y: 0 };
    }

    friction() {
        const length = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        let friction = { x: this.vel.x / length * FRICTION, y: this.vel.y / length * FRICTION };
        this.applyForce(friction);
    }

    applyForce(f) {
        this.acc.x += f.x;
        this.acc.y += f.y;
    }

    collisions(thisIndex) {
        for (let i = 0; i < particles.length; i++) {
            if (i === thisIndex) {
                continue;
            }

            let other = particles[i];
            let distance = Math.sqrt((this.pos.x - other.pos.x)**2 + (this.pos.y - other.pos.y)**2);
            if (distance > this.radius + other.radius) {
                continue;
            }

            let normalized = { x: (other.pos.x - this.pos.x) / distance, y: (other.pos.y - this.pos.y) / distance};
            let tangent = { x: -normalized.y, y: (normalized.x)};
            let dpTan1 = this.vel.x * tangent.x + this.vel.y * tangent.y;
            let dpTan2 = other.vel.x * tangent.x + other.vel.y * tangent.y;
            let dpNorm1 = this.vel.x * normalized.x + this.vel.y * normalized.y;
            let dpNorm2 = other.vel.x * normalized.x + other.vel.y * normalized.y;

            let m1 = (dpNorm1 * (this.mass - other.mass) + 2.0 * other.mass * dpNorm2) / (this.mass + other.mass);
            let m2 = (dpNorm2 * (other.mass - this.mass) + 2.0 * this.mass * dpNorm1) / (this.mass + other.mass);

            this.vel.x = tangent.x * dpTan1 + normalized.x * m1;
            this.vel.y = tangent.y * dpTan1 + normalized.y * m1;
            particles[i].vel.x = tangent.x * dpTan2 + normalized.x * m2;
            particles[i].vel.y = tangent.y * dpTan2 + normalized.y * m2;
        }
    }
    outOfOthers(thisIndex) {
        for (let j = particles.length - 1; j >= 0; j--) {
            if (thisIndex !== j) {

                let other = particles[j];
                let distance = Math.sqrt((this.pos.x - other.pos.x)**2 + (this.pos.y - other.pos.y)**2);
                if (distance < this.radius + other.radius) {
                    let overlap = 0.5 * (distance - this.radius - other.radius);

                    this.pos.x -= overlap * (this.pos.x - other.pos.x) / distance;
                    this.pos.y -= overlap * (this.pos.y - other.pos.y) / distance;

                    other.pos.x += overlap * (this.pos.x - other.pos.x) / distance;
                    other.pos.y += overlap * (this.pos.y - other.pos.y) / distance;
                }
            }
        }
    }
}

window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onload = start;