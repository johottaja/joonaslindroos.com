// Client-side competitive snake game
// Ported from server-side games/snake/comp/game.js and games/snake/comp/snake.js

const CompConfig = {
    tileSize: 32,
    tileCount: 15,
    snakeGap: 5,
    snakeColor: "#F6B17A",
    bgColor1: "#424769",
    bgColor2: "#7077A1",
    FPS: 7,
    frameTime: 1000 / 7,
};

class CompSnake {
    constructor(x, y) {
        this.vel = { x: 0, y: -1 };
        this.velQueue = [];
        this.pos = { x: x, y: y };
        this.trueLength = 5;
        this.tail = [];

        this.velToTexID = {
            "-10-10": 5,
            "1010": 5,
            "0-10-1": 4,
            "0101": 4,
            "0-110": 2,
            "1001": 3,
            "-100-1": 1,
            "01-10": 0,
            "-1001": 2,
            "0-1-10": 3,
            "0110": 1,
            "100-1": 0,
            "0000": 4,
            "1000": 5,
            "-1000": 5,
            "0100": 4,
            "0-100": 4
        };
    }

    update() {
        let lastVel = { x: this.vel.x, y: this.vel.y };
        if (this.velQueue.length) {
            const nextVel = this.velQueue.shift();
            this.vel = { x: nextVel.x, y: nextVel.y };
        }

        let a = String(this.vel.x) + String(this.vel.y) + String(lastVel.x) + String(lastVel.y);
        let textureID = this.velToTexID[a];
        if (!(a in this.velToTexID)) textureID = 6;

        this.tail.unshift({
            x: this.pos.x,
            y: this.pos.y,
            textureID: textureID
        });

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        if (this.tail.length === this.trueLength) {
            this.tail.pop();
        }
    }

    handleInput(code) {
        if (code === "ArrowLeft" || code === "KeyA") {
            this.queueInput(-1, 0);
        } else if (code === "ArrowRight" || code === "KeyD") {
            this.queueInput(1, 0);
        } else if (code === "ArrowUp" || code === "KeyW") {
            this.queueInput(0, -1);
        } else if (code === "ArrowDown" || code === "KeyS") {
            this.queueInput(0, 1);
        }
    }

    setVel(code) {
        if (code === "ArrowLeft" || code === "KeyA") {
            this.vel = { x: -1, y: 0 };
        } else if (code === "ArrowRight" || code === "KeyD") {
            this.vel = { x: 1, y: 0 };
        } else if (code === "ArrowUp" || code === "KeyW") {
            this.vel = { x: 0, y: -1 };
        } else if (code === "ArrowDown" || code === "KeyS") {
            this.vel = { x: 0, y: 1 };
        }
    }

    queueInput(x, y) {
        if (this.vel.x === 0 && this.vel.y === 0) {
            this.velQueue.push({ x: x, y: y });
            return;
        }
        if (this.velQueue.length === 0) {
            if (x === this.vel.x || y === this.vel.y)
                return;
            else this.velQueue.push({ x: x, y: y });
        }
        let lastInput = this.velQueue[this.velQueue.length - 1];
        if (x === lastInput.x || y === lastInput.y) return;
        this.velQueue.push({ x: x, y: y });
    }

    headCollides(x, y) {
        return this.pos.x === x && this.pos.y === y;
    }

    collides(x, y) {
        if (this.pos.x === x && this.pos.y === y) return true;
        for (let i = 0; i < this.tail.length; i++) {
            if (this.tail[i].x === x && this.tail[i].y === y) return true;
        }
        return false;
    }

    collidesBorderOrSelf() {
        if (this.pos.x === -1 ||
            this.pos.y === -1 ||
            this.pos.x === CompConfig.tileCount ||
            this.pos.y === CompConfig.tileCount
        ) return true;
        for (let i = 0; i < this.tail.length; i++) {
            if (this.headCollides(this.tail[i].x, this.tail[i].y)) {
                return true;
            }
        }
    }

    grow() {
        this.trueLength++;
    }

    toState() {
        return {
            tail: this.tail,
            pos: this.pos,
            vel: this.vel,
            length: this.trueLength
        };
    }
}

class CompetitiveGame {
    constructor(callbacks) {
        // callbacks: { onGameState, onGameOver, onDisplayMessage }
        this.callbacks = callbacks;
        this.running = false;
        this.playerReady = false;
        this.snake = new CompSnake(7, 13);
        this.apple = {
            x: 0,
            y: 0,
            game: this,
            spawn: function () {
                let positions = [];
                for (let i = 0; i < CompConfig.tileCount; i++) {
                    for (let j = 0; j < CompConfig.tileCount; j++) {
                        if (this.game.snake.collides(i, j)) continue;
                        positions.push({ x: i, y: j });
                    }
                }
                let selected = positions[Math.floor(Math.random() * positions.length)];
                this.x = selected.x;
                this.y = selected.y;
            },
            toState() {
                return {
                    x: this.x,
                    y: this.y
                };
            }
        };
        this.apple.spawn();
    }

    handleInput(code) {
        const isMovementKey = (
            code === "KeyW" || code === "KeyA" ||
            code === "KeyD" || code === "KeyS" ||
            code === "ArrowRight" || code === "ArrowLeft" ||
            code === "ArrowUp" || code === "ArrowDown"
        );

        if (!this.running && !this.playerReady && isMovementKey) {
            this.playerReady = true;
            this.startCountdown();
        }

        if (this.running) {
            this.snake.handleInput(code);
        } else {
            this.snake.setVel(code);
        }
    }

    update() {
        if (!this.running) {
            return;
        }

        this.snake.update();
        if (this.snake.collidesBorderOrSelf()) {
            this.running = false;
            this.onGameOver();
            return;
        }
        if (this.snake.headCollides(this.apple.x, this.apple.y)) {
            this.snake.grow();
            this.apple.spawn();
        }
    }

    startCountdown() {
        this.callbacks.onDisplayMessage("3");
        setTimeout(() => {
            this.callbacks.onDisplayMessage("2");
        }, 1000);
        setTimeout(() => {
            this.callbacks.onDisplayMessage("1");
        }, 2000);
        setTimeout(() => {
            this.callbacks.onDisplayMessage("GO!");
        }, 3000);
        setTimeout(() => {
            this.running = true;
            this.callbacks.onDisplayMessage("");
        }, 4000);
    }

    async onGameOver() {
        const score = this.snake.trueLength;
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: score })
            });
            // 200 = qualifies for highscore, 204 = does not
            const podium = response.status === 200;
            this.callbacks.onGameOver({ podium: podium, score: score });
        } catch (err) {
            // If API fails, just show game over without highscore
            this.callbacks.onGameOver({ podium: false, score: score });
        }
    }

    getState() {
        return {
            snake: this.snake.toState(),
            apple: this.apple.toState()
        };
    }
}
