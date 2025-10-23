class Game {
    constructor() {
        this.canvas = document.querySelector("#game-canvas");
        this.context = this.canvas.getContext("2d");
        this.tailTextures = [];
        this.headTextures = [];
        this.backgroundTexture;
        this.appleTexture;
        this.snake;
        this.apple;
        this.running;
    }

    initialize() {
        this.canvas.width = Config.tileCount * Config.tileSize
        this.canvas.height = Config.tileCount * Config.tileSize
        this.canvas.focus();

        this.snake = new Snake(this, Math.floor(Config.tileCount / 2), Config.tileCount - 2);
        this.apple = {
            x: 0,
            y: 0,
            game: this,
            draw: function () {
                this.game.context.drawImage(
                    this.game.appleTexture,
                    this.x * Config.tileSize,
                    this.y * Config.tileSize
                );
            },
            spawn: function () {
                let positions = [];
                for (let i = 0; i < Config.tileCount; i++) {
                    for (let j = 0; j < Config.tileCount; j++) {
                        if (this.game.snake.collides(i, j)) continue;
                        positions.push(this.game.toVector(i, j));
                    }
                }
                positions.forEach(pos => {
                    let selected = positions[Math.floor(Math.random() * positions.length)];
                    this.x = selected.x;
                    this.y = selected.y;
                }); //WTF ??? TODO: CHECK WTF IS HAPPENING HERE
            }

        }
        this.apple.spawn();
        this.draw();

        Config.setFPS(7);
        this.running = false;
    }

    handleInput(event) {
        this.snake.handleInput(event.code);
    }

    update(deltaTime) {
        this.snake.update();
        if (this.snake.collidesBorderOrSelf()) {
            this.running = false;
        }
        if (this.snake.headCollides(this.apple.x, this.apple.y)) {
            this.snake.grow();
            this.apple.spawn();
        }
    }

    draw() {
        this.context.drawImage(this.backgroundTexture, 0, 0);
        this.apple.draw();
        this.snake.draw();
    }

    getScore() {
        return this.snake.trueLength;
    }
}