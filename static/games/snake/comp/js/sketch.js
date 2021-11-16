const scoreCounter = document.querySelector(".score-counter");
const messageBox = document.querySelector(".message-box");

const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

const socket = io();

let Config = null;
let textures = null;

function gameOver(score) {
    setMessageBoxContents("#game-over-template");
    messageBox.querySelector("#game-over-score-display")
        .textContent = `Final score: ${score}`;
    messageBox.querySelector(".restart-button").onclick = function() {
        window.location.reload();
    };
    showMessageBox();
}

function getPlayerInfo(score) {
    setMessageBoxContents("#highscore-submit-template");
    messageBox.querySelector("#score").value = score;
    showMessageBox();
}

function submitInfo() {
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
        socket.emit("player_info", { name: name, message: message });
        window.location = "/leaderboard"
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

socket.on("game_config", config => {
    Config = JSON.parse(config);
    canvas.width = Config.tileCount * Config.tileSize;
    canvas.height = Config.tileCount * Config.tileSize;

    textures = createTextures(Config);
    textures.setContext(context);

    textures.drawBackground();
    socket.emit("get_game_state");
});

socket.on("game_state", state => {
    const gameState = JSON.parse(state);
    textures.drawBackground()
    textures.drawApple(gameState.apple);
    textures.drawSnake(gameState.snake);
    scoreCounter.textContent = gameState.snake.length;
});

socket.on("game_over", gameOverStatus => {
    if (gameOverStatus.podium) {
        getPlayerInfo(gameOverStatus.score);
    } else {
        gameOver(gameOverStatus.score);
    }
});

socket.on("display_message", message => {
    if (message) {
        showMessageBox();
        setMessageBoxContents("#message-display-template");
        document.querySelector("#message-display").innerHTML = message;
    } else {
        hideMessageBox();
    }
});
function start() {
    socket.emit("get_game_config");
    window.addEventListener("keydown", e => {
        socket.emit("game_input", e.code);
    })
    setMessageBoxContents("#instructions-template");
    showMessageBox();
}

window.onload = start;