const express = require("express");
const CompetitiveGame = require("./../games/snake/comp/game");
const crypto = require("crypto");
const Config = require("../games/snake/config");

const router = express.Router();

module.exports = (params) => {

    const compIoServer = params.compIoServer;
    const highscoreService = params.highscoreService;

    compIoServer.on("connection", socket => {
        games.push(new CompetitiveGame(socket, highscoreService, Config));

        socket.on("get_game_config", () => {
            socket.emit("game_config", JSON.stringify({
                tileSize: Config.tileSize,
                tileCount: Config.compTileCount,
                snakeGap: Config.snakeGap,
                snakeColor: Config.snakeColor1,
                bgColor1: Config.bgColor1,
                bgColor2: Config.bgColor2
            }));
        })
    });

    function updateGames() {
        games.forEach((game, i) => {
            if (game.shouldQuit) {
                games.splice(i, 1);
                return;
            }
            game.update();
        });
    }

    const games = [];

    setInterval(updateGames, Config.frameTime);

    router.get("/", (request, response) => {
        response.render("snake/comp/game.ejs");
    });

    return router;
}