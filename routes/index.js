const express = require("express");
const crypto = require("crypto");
const leaderboardRoute = require("./leaderboard");
const scoreApiRoute = require("./scoreApiRoute");

const router = express.Router();

module.exports = (params) => {
    const { highscoreService } = params;

    router.get("/", (request, response) => {

        let nonce = crypto.randomBytes(16).toString("base64");

        //Ugly code to remove old 'script-src' policy and add new one with a nonce
        let csp = response.get("Content-Security-Policy");
        let policies = csp.split(";")
        policies = policies.filter(policy => { return !policy.startsWith("script-src"); });
        csp = policies.join(";");
        csp = `script-src 'self' 'nonce-${nonce}'; ` + csp

        response.set("Content-Security-Policy", csp);

        response.render("game.ejs", { nonce });
    });


    router.use("/leaderboard", leaderboardRoute({ highscoreService }));
    router.use("/api", scoreApiRoute({ highscoreService }))

    return router;
}