const express = require("express");
const PvPGame = require("./../games/snake/pvp/game");
const crypto = require("crypto");

const router = express.Router();

module.exports = (params) => {

    const Config = params.Config;
    const pvpIoServer = params.pvpIoServer;

    pvpIoServer.on("connection", socket => {

        socket.on("get_game_config", () => {
            socket.emit("game_config", JSON.stringify({
                tileSize: Config.tileSize,
                tileCount: Config.pvpTileCount,
                snakeGap: Config.snakeGap,
                snakeColor1: Config.snakeColor1,
                snakeColor2: Config.snakeColor2,
                bgColor1: Config.bgColor1,
                bgColor2: Config.bgColor2,
            }));
        });

        socket.on("join_game", code => {
            if (games.has(code)) {
                socket.join(code);
                games.get(code).join(socket);
            } else {
                socket.emit("redirect");
            }
        });
    });

    const MAX_GAMES = 10;

    function updateGames() {
        games.forEach((game, code) => {
            if (game.shouldQuit) {
                games.delete(code);
                return;
            }
            game.update();
        });
    }

    const games = new Map();

    setInterval(updateGames, Config.frameTime);

    router.get("/", (request, response) => {
        const errorMessage = (request.session.errorMessage || "");
        request.session.errorMessage = "";
        response.render("snake/pvp/landing", {errorMessage: errorMessage});
    })
    router.post("/create", (request, response) => {
        const code = request.body.code;
        if (games.has(code)) {
            request.session.errorMessage = `Code ${code} is already in use`;
            return response.redirect("/");
        }
        if (games.size >= MAX_GAMES) {
            request.session.errorMessage = "Servers are full. Try again in a few minutes."
            return response.redirect("/");
        }

        games.set(code, new PvPGame(pvpIoServer, code));
        return response.redirect("/");
    });

    router.post("/join", (request, response) => {
        const code = request.body.code;
        if (!games.has(code)) {
            request.session.errorMessage = `Game with code ${code} does not exist`;
            return response.redirect("/");
        }
        if (games.get(code).isFull()) {
            request.session.errorMessage = `Game with code ${code} is already in progress`;
            return response.redirect("/");
        }
        response.redirect("/snake/pvp/play");
    });

    router.get("/play", (request, response) => {

        request.session.errorMessage = "";

        let nonce = crypto.randomBytes(16).toString("base64");

        //Ugly code to remove old 'script-src' policy and add new one with a nonce
        let csp = response.get("Content-Security-Policy");
        let policies = csp.split(";")
        policies = policies.filter(policy => { return !policy.startsWith("script-src"); });
        csp = policies.join(";");
        csp = `script-src 'self' 'nonce-${nonce}'; ` + csp

        response.set("Content-Security-Policy", csp);

        response.render("snake/pvp/game", {nonce});
    });


    return router;
}