const express = require("express");
const { check, validationResult } = require("express-validator");

const router = express.Router();

module.exports = (params) => {

    const { highscoreService } = params;

    router.post("/scores", async (request, response) => {
        const highscores = await highscoreService.getData();
        const score = request.body.score;


        if (highscores.length < 5) {
            return response.status(200).end();
        }

        for (let i = 0; i < highscores.length; i++) {
            if (score > parseInt(highscores[i].score)) {
                return response.status(200).end();
            }
        }
        return response.status(204).end();
    })

    router.post("/highscores", [
        check("name")
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("Name is invalid"),
        check("message")
            .trim()
            .isLength({ min: 3, max: 150 })
            .withMessage("Message is invalid"),
        check("score")
            .trim()
            .isLength({ min: 1, max: 3 })
    ], async (request, response) => {
        const errors = validationResult(request);

        if (errors.isEmpty()) {
            await highscoreService.setNewHighscore(request.body);
            response.status(204);
            return response.redirect("/leaderboard");
        } else {
            return response.send("lol no hacking");
        }
    });

    router.get("/highscores", async (request, response) => {
        response.send(await highscoreService.getData());
    });

    return router;
}
