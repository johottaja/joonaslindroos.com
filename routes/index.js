const express = require("express");
const crypto = require("crypto");

const pvpSnakeRoute = require("./pvpSnake")
const compSnakeRoute = require("./compSnake")
const leaderboardRoute = require("./leaderboard");
const scoreApiRoute = require("./scoreApiRoute");

const router = express.Router();

module.exports = (params) => {

    const highscoreService = params.highscoreService;

    //Landing route
    router.get("/", (request, response) => {

        let nonce = crypto.randomBytes(16).toString("base64");

        //Ugly code to remove old 'script-src' policy and add new one with a nonce
        let csp = response.get("Content-Security-Policy");
        let policies = csp.split(";")
        policies = policies.filter(policy => { return !policy.startsWith("script-src"); });
        csp = policies.join(";");
        csp = `script-src 'self' 'nonce-${nonce}'; ` + csp

        response.set("Content-Security-Policy", csp);

        return response.render("index", { nonce });
    });

    //Text spread route
    router.get("/textspread", (request, response) => {
        return response.render("textspread");
    });

    //Fireworks route
    router.get("/fireworks", (request, response) => {
        return response.render("fireworks");
    });

    //Other routes
    router.use("/snake/comp", compSnakeRoute(params));
    router.use("/snake/pvp", pvpSnakeRoute(params))
    router.use("/snake/comp/leaderboard", leaderboardRoute({ highscoreService }));
    router.use("/api", scoreApiRoute({ highscoreService })); //TODO: Maybe move the api route to snake/comp/

    return router;
}