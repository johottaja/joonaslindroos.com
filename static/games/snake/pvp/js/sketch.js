const scoreCounter = document.querySelector(".score-counter"); //TODO: Color scheme??
const messageBox = document.querySelector(".message-box");

const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

let Config = null;
let textures = null;
let player = 1;

const socket = io(window.location.host, {
    path: "/snake/pvp/socket/"
});

function gameOver() {
    setMessageBoxContents("#game-over-template");
    //document.querySelector("#game-over-text").textContent = game.gameEndText;
    showMessageBox();
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

socket.on("game_config", message => {
    Config = JSON.parse(message);

    let tileSize = Math.floor(window.innerHeight / 5 * 3 / 20);
    Config.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;

    if (Config.tileSize * Config.tileCount >= window.innerWidth - window.innerWidth / 10) {
        tileSize = Math.floor(window.innerWidth / 10 * 9 / 20);
        Config.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;
    }

    canvas.width = Config.tileCount * Config.tileSize;
    canvas.height = Config.tileCount * Config.tileSize;

    textures = createTextures(Config);
    textures.setContext(context);
    socket.emit("get_game_state");
});

socket.on("game_state", gameStateRaw => {
    const gameState = JSON.parse(gameStateRaw);
    textures.drawBackground();
    textures.drawApple(gameState.apple);
    textures.drawSnake1(gameState.snake1);
    textures.drawSnake2(gameState.snake2);
});

socket.on("display_message", message => {
    if (message) {
        showMessageBox();
        if (message === "instructionsP1") {
            player = 1
            setMessageBoxContents("#instructions-template");
            document.querySelector("#instructions-sideteller").textContent = "You are purple";
            return;
        } else if (message === "instructionsP2") {
            player = 2;
            setMessageBoxContents("#instructions-template");
            document.querySelector("#instructions-sideteller").textContent = "You are yellow";
            return;
        }
        setMessageBoxContents("#message-display-template");
        document.querySelector("#message-display").innerHTML = message;
    } else {
        hideMessageBox();
    }
});

socket.on("game_over", message => {
    setMessageBoxContents("#game-over-template");
    document.querySelector("#game-over-text").textContent = message;
    showMessageBox();
});

socket.on("update_length", lengths => {
    lengths = JSON.parse(lengths);
    scoreCounter.textContent = `${lengths.me} - ${lengths.other}`;
});

socket.on("redirect", () => {
    window.location = "/snake/pvp";
});

function start() {
    const code = document.cookie.split("=")[1];
    if (!code) {
        window.location = "/snake/pvp";
    }
    socket.emit("join_game", code);
    scoreCounter.textContent = `Code: ${code}`;
    window.addEventListener("keydown", (e) => {
        socket.emit("game_input", e.code);
    });
    socket.emit("get_game_config");
}

window.onload = start;
window.onresize = function() {
    let tileSize = Math.floor(window.innerHeight / 5 * 3 / 20);
    Config.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;

    if (Config.tileSize * Config.tileCount >= window.innerWidth - window.innerWidth / 10) {
        tileSize = Math.floor(window.innerWidth / 10 * 9 / 20);
        Config.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;
    }

    canvas.width = Config.tileCount * Config.tileSize;
    canvas.height = Config.tileCount * Config.tileSize;

    textures = createTextures(Config);
    textures.setContext(context);

    textures.drawBackground();
    socket.emit("get_game_state");
}