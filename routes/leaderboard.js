const express = require("express");
const crypto = require("crypto");

const router = express.Router();

module.exports = (params) => {
    const { highscoreService } = params;

    router.get("/", async (request, response, next) => {
        try {
            const scores = await highscoreService.getData();
            if (scores.length === 0) {
                return response.render("snake/comp/leaderboard-empty");
            }
            return response.render("snake/comp/leaderboard", { scores } );

        } catch (err) {
            next(err);
        }
    });

    return router;
}