const scoreCounter = document.querySelector(".score-counter");
const messageBox = document.querySelector(".message-box");

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
            scoreCounter.textContent = state.snake.length;
        }
    }

    if (game.running) {
        requestAnimationFrame(run);
    }
}

function gameOver(score) {
    setMessageBoxContents("#game-over-template");
    messageBox.querySelector("#game-over-score-display")
        .textContent = `Final score: ${score}`;
    messageBox.querySelector(".restart-button").onclick = function () {
        window.location.reload();
    };
    showMessageBox();
}

function getPlayerInfo(score) {
    setMessageBoxContents("#highscore-submit-template");
    messageBox.querySelector("#score").value = score;
    messageBox.querySelector("#info-submit-button").onclick = function () {
        submitInfo(score);
    };
    showMessageBox();
}

async function submitInfo(score) {
    const infoForm = document.getElementById("info-form");
    const name = infoForm.elements["name"].value;
    const message = infoForm.elements["message"].value;
    const badName = document.getElementById("bad-name-text");
    const badMessage = document.getElementById("bad-message-text");

    badName.style.display = "none";
    badMessage.style.display = "none";

    let errors = false;
    if (name.length < 3) {
        badName.style.display = "block";
        errors = true;
    }
    if (message.length < 5) {
        badMessage.style.display = "block";
        errors = true;
    }

    if (!errors) {
        try {
            await fetch('/api/highscores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, message: message, score: String(score) })
            });
        } catch (err) {
            console.error("Failed to submit highscore:", err);
        }
        window.location.href = "/snake/comp/leaderboard";
    }
}

function hideMessageBox() {
    messageBox.style.display = "none";
}

function showMessageBox() {
    messageBox.style.display = "block";
}

function setMessageBoxContents(templateID) {
    let templateContents = document.querySelector(templateID);
    messageBox.innerHTML = "";
    messageBox.appendChild(templateContents.content.cloneNode(true));
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
            scoreCounter.textContent = state.snake.length;
        },
        onGameOver: function (gameOverStatus) {
            if (gameOverStatus.podium) {
                getPlayerInfo(gameOverStatus.score);
            } else {
                gameOver(gameOverStatus.score);
            }
        },
        onDisplayMessage: function (message) {
            if (message) {
                showMessageBox();
                setMessageBoxContents("#message-display-template");
                document.querySelector("#message-display").innerHTML = message;
            } else {
                hideMessageBox();
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

    setMessageBoxContents("#instructions-template");
    showMessageBox();
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
