const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

let Config = null;
let textures = null;
let player = 1;

const socket = io(window.location.host, {
    path: "/snake/pvp/socket/"
});

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
        if (message === "instructionsP1") {
            player = 1
            if (window.showInstructions) {
                window.showInstructions(1, "You are purple");
            }
            return;
        } else if (message === "instructionsP2") {
            player = 2;
            if (window.showInstructions) {
                window.showInstructions(2, "You are yellow");
            }
            return;
        }
        if (window.showMessage) {
            window.showMessage(message);
        }
    } else {
        if (window.hideMessageBox) {
            window.hideMessageBox();
        }
    }
});

socket.on("game_over", message => {
    if (window.showGameOver) {
        window.showGameOver(message);
    }
});

socket.on("update_length", lengths => {
    lengths = JSON.parse(lengths);
    if (window.updateScore) {
        window.updateScore(`${lengths.me} - ${lengths.other}`);
    }
});

socket.on("redirect", () => {
    window.location = "/snake/pvp";
});

function start() {
    const code = CookieUtil.get("code") || new URLSearchParams(window.location.search).get("code");
    if (!code) {
        window.location = "/snake/pvp";
        return;
    }
    // Store code in cookie for future use
    CookieUtil.set("code", code, 30);
    socket.emit("join_game", code);
    if (window.updateScore) {
        window.updateScore(`Code: ${code}`);
    }
    window.addEventListener("keydown", (e) => {
        socket.emit("game_input", e.code);
    });
    socket.emit("get_game_config");
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

    canvas.width = Config.tileCount * Config.tileSize;
    canvas.height = Config.tileCount * Config.tileSize;

    textures = createTextures(Config);
    textures.setContext(context);

    textures.drawBackground();
    socket.emit("get_game_state");
}