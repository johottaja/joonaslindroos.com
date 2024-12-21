const express = require("express");
const crypto = require("crypto");
const createError = require("http-errors");

const pvpSnakeRoute = require("./pvpSnake")
const compSnakeRoute = require("./compSnake")
const leaderboardRoute = require("./leaderboard");
const scoreApiRoute = require("./scoreApiRoute");
const contactMeRoute = require("./contactMe");

const router = express.Router();

module.exports = (params) => {

    const highscoreService = params.highscoreService;

    //Landing route
    router.get("/", (request, response) => {
        return response.render("index", { recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY });
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
    router.get("/error", (request, response) => {
        response.render("error", { code: 404, message: "the page was not found" })
    });

    router.use("/snake/comp", compSnakeRoute(params));
    router.use("/snake/pvp", pvpSnakeRoute(params))
    router.use("/snake/comp/leaderboard", leaderboardRoute({ highscoreService }));
    router.use("/api", scoreApiRoute({ highscoreService })); //TODO: Maybe move the api route to snake/comp/
    router.use("/contact_me", contactMeRoute(params));

    router.use((request, response, next) => {
       return response.render("message", { heading: 404, message: "The page was not found"})
    });

    router.use((error, request, response, next) => {
        const status = error.status || 500;
        console.log(error);
        if (error.code !== 404) {
            return response.render("message", { heading: status, message: "An unexpected error has occurred" })
        }
        response.status(status);
        return response.render("message", { heading: status, message: error.message || "An unexpected error has occurred" })
    });

    return router;
}