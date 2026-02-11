const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

let game = null;
let textures = null;

let lastTime = 0;
let accumulator = 0;

function run(time = performance.now()) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (game.running) {
        accumulator += deltaTime;
        if (accumulator >= CompConfig.frameTime) {
            while (accumulator >= CompConfig.frameTime && game.running) {
                accumulator -= CompConfig.frameTime;
                game.update();
            }
            // Render current state
            const state = game.getState();
            textures.drawBackground();
            textures.drawApple(state.apple);
            textures.drawSnake(state.snake);
            if (window.updateScore) {
                window.updateScore(state.snake.length);
            }
        }
    }

    if (game.running) {
        requestAnimationFrame(run);
    }
}

function initCanvas() {
    let tileSize = Math.floor(window.innerHeight / 2 / CompConfig.tileCount);
    CompConfig.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;

    if (CompConfig.tileSize * CompConfig.tileCount >= window.innerWidth - window.innerWidth / 10) {
        tileSize = Math.floor(window.innerWidth / 10 * 9 / CompConfig.tileCount);
        CompConfig.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;
    }

    canvas.width = CompConfig.tileCount * CompConfig.tileSize;
    canvas.height = CompConfig.tileCount * CompConfig.tileSize;

    textures = createTextures(CompConfig);
    textures.setContext(context);
    textures.drawBackground();
}

function start() {
    game = new CompetitiveGame({
        onGameState: function (state) {
            textures.drawBackground();
            textures.drawApple(state.apple);
            textures.drawSnake(state.snake);
            if (window.updateScore) {
                window.updateScore(state.snake.length);
            }
        },
        onGameOver: function (gameOverStatus) {
            if (window.showGameOver) {
                window.showGameOver(gameOverStatus);
            }
        },
        onDisplayMessage: function (message) {
            if (message) {
                if (window.showCountdown) {
                    window.showCountdown(message);
                }
            } else {
                if (window.startGame) {
                    window.startGame();
                }
                // Game is starting, begin the game loop
                lastTime = performance.now();
                accumulator = 0;
                run();
            }
        }
    });

    initCanvas();

    // Draw initial state
    const state = game.getState();
    textures.drawApple(state.apple);
    textures.drawSnake(state.snake);

    window.addEventListener("keydown", e => {
        game.handleInput(e.code);
    });

    if (window.showInstructions) {
        window.showInstructions();
    }
}

if (document.readyState === 'complete') {
    start();
} else {
    window.addEventListener('load', start);
}

window.onresize = function () {
    if (!textures) return;
    initCanvas();
    if (game) {
        const state = game.getState();
        textures.drawApple(state.apple);
        textures.drawSnake(state.snake);
    }
};
