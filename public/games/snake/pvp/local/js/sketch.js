let game;

let player1ready = false;
let player2ready = false;

let lastTime = 0;
let accumulator = 0;
function run(time=performance.now()) {
    const deltaTime = time - lastTime;
    lastTime = time;
    if (game.running) {
        accumulator += deltaTime;
        if (accumulator >= Config.frameTime) {
            while (accumulator >= Config.frameTime && game.running) {
                accumulator -= Config.frameTime;
                game.update(deltaTime);
            }
            if (window.updateScore) {
                window.updateScore(`${String(game.getScore()[0])} - ${String(game.getScore()[1])}`);
            }
            game.draw();
        }
    } else {
        gameOver();
        return;
    }

    requestAnimationFrame(run);
}

function gameOver() {
    if (window.showGameOver) {
        window.showGameOver(game.gameEndText);
    }
}

function firstKeystrokeListener(event) {
    let code = event.code;

    if (code === "KeyW" ||
        code === "KeyS" ||
        code === "KeyA" ||
        code === "KeyD"
    ) {
        player1ready = true;
        if (window.setPlayer1Ready) {
            window.setPlayer1Ready(true);
        }
    }

    if (code === "ArrowUp" ||
        code === "ArrowDown" ||
        code === "ArrowLeft" ||
        code === "ArrowRight"
    ) {
        player2ready = true;
        if (window.setPlayer2Ready) {
            window.setPlayer2Ready(true);
        }
    }

    if (player1ready && player2ready) {
        if (window.startCountdown) {
            window.startCountdown();
        }
        setTimeout(() => {
            if (window.updateCountdown) {
                window.updateCountdown(2);
            }
        }, 1000);
        setTimeout(() => {
            if (window.updateCountdown) {
                window.updateCountdown(1);
            }
        }, 2000);
        setTimeout(() => {
            if (window.hideMessageBox) {
                window.hideMessageBox();
            }
            window.removeEventListener("keydown", firstKeystrokeListener);
            window.addEventListener("keydown", e => { game.handleInput(e.code); });
            game.running = true;
            lastTime = performance.now();
            run();
        }, 3000);
    }
}

function start() {
    game = new Game();
    game.initialize();

    if (window.showInstructions) {
        window.showInstructions();
    }

    window.addEventListener("keydown", firstKeystrokeListener);
}

if (document.readyState === 'complete') {
    start();
} else {
    window.addEventListener('load', start);
}
window.onresize = function() {
    let tileSize = Math.floor(window.innerHeight / 5 * 3 / 20);
    Config.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;

    if (Config.tileSize * Config.tileCount >= window.innerWidth - window.innerWidth / 10) {
        tileSize = Math.floor(window.innerWidth / 10 * 9 / 20);
        Config.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;
    }

    game.canvas.width = Config.tileCount * Config.tileSize;
    game.canvas.height = Config.tileCount * Config.tileSize;

    game.initializeTextures();
    game.draw();
}