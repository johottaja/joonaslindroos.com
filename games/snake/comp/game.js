const Snake = require("./snake");

module.exports = class Game {
    constructor(socket, highscoreService) {
        this.running = false;
        this.shouldQuit = false;
        this.playerReady = false;
        this.highscoreService = highscoreService;
        this.snake = new Snake(7, 13);
        this.apple = {
            x: 0,
            y: 0,
            game: this,
            spawn: function () {
                let positions = [];
                for (let i = 0; i < Config.tileCount; i++) {
                    for (let j = 0; j < Config.tileCount; j++) {
                        if (this.game.snake.collides(i, j)) continue;
                        positions.push({ x: i, y: j });
                    }
                }
                let selected = positions[Math.floor(Math.random() * positions.length)];
                this.x = selected.x;
                this.y = selected.y;
            },
            toString() {
                return {
                    x: this.x,
                    y: this.y
                }
            }
        }
        this.apple.spawn();
        this.socket = socket;
        this.socket.on("game_input", code => {
            if (!this.running && !this.playerReady) {
                if (code === "KeyW" ||
                    code === "KeyA" ||
                    code === "KeyD" ||
                    code === "KeyS" ||
                    code === "ArrowRight" ||
                    code === "ArrowLeft" ||
                    code === "ArrowUp" ||
                    code === "ArrowDown" ) {
                    this.playerReady = true;
                    this.start();
                }
            }
            if (this.running) {
                this.snake.handleInput(code);
            } else {
                this.snake.setVel(code);
            }
        });
        this.socket.on("get_game_state", () => {
            this.socket.emit("game_state", JSON.stringify(this.toString()));
        });

        this.socket.on("disconnect", () => {
            this.shouldQuit = true;
        });

        this.socket.on("player_info", info => {
            info.score = this.snake.trueLength.toString();
            if (info.name.length < 3 || info.message.length < 5) {
                this.socket.disconnect();
                return;
            }
            this.highscoreService.setNewHighscore(info);
            this.socket.disconnect();
        })
    }

    async update() {
        if (!this.running) {
            return;
        }

        this.snake.update();
        if (this.snake.collidesBorderOrSelf()) {
            this.running = false;
            await this.gameOver();
        }
        if (this.snake.headCollides(this.apple.x, this.apple.y)) {
            this.snake.grow();
            this.apple.spawn();
        }
        this.socket.emit("game_state", JSON.stringify(this.toString()));
    }

    start() {
        this.socket.emit("display_message", "3");
        setTimeout(() => {
            this.socket.emit("display_message", "2");
        }, 1000);
        setTimeout(() => {
            this.socket.emit("display_message", "1");
        }, 2000);
        setTimeout(() => {
            this.socket.emit("display_message", "GO!");
        }, 3000);
        setTimeout(() => {
            this.running = true;
            this.socket.emit("display_message", "");
        }, 4000);
    }

    async gameOver() {
        const highscores = await this.highscoreService.getData();
        const score = this.snake.trueLength;


        if (highscores.length < 5) {
            this.socket.emit("game_over", {podium: true, score: this.snake.trueLength});
            return
        }

        for (let i = 0; i < highscores.length; i++) {
            if (score > parseInt(highscores[i].score)) {
                this.socket.emit("game_over", {podium: true, score: this.snake.trueLength});
                return;
            }
        }

        this.socket.emit("game_over", {podium: false, score: this.snake.trueLength});
    }

    toString() {
        return {
            snake: this.snake.toString(),
            apple: this.apple.toString()
        }
    }
}