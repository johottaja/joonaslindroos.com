const express = require("express");
const pvpSnakeRoute = require("./pvpSnake")
const compSnakeRoute = require("./compSnake")
const leaderboardRoute = require("./leaderboard");
const scoreApiRoute = require("./scoreApiRoute");

const router = express.Router();

module.exports = (params) => {

    const highscoreService = params.highscoreService;

    router.get("/", (request, response) => {
        response.redirect("/snake/pvp");
    });

    router.use("/snake/comp", compSnakeRoute(params));
    router.use("/snake/pvp", pvpSnakeRoute(params))
    router.use("/snake/comp/leaderboard", leaderboardRoute({ highscoreService }));
    router.use("/api", scoreApiRoute({ highscoreService })); //TODO: Maybe move the api route to snake/comp/

    return router;
}