const express = require("express");
const crypto = require("crypto");

const router = express.Router();

module.exports = (params) => {
    const { highscoreService } = params;

    router.get("/", async (request, response) => {
        const scores = await highscoreService.getData();

        let nonce = crypto.randomBytes(16).toString("base64");

        //Ugly code to remove old 'script-src' policy and add new one with a nonce
        let csp = response.get("Content-Security-Policy");
        let policies = csp.split(";")
        policies = policies.filter(policy => { return !policy.startsWith("script-src"); });
        csp = policies.join(";");
        csp = `script-src 'nonce-${nonce}'; ` + csp

        response.set("Content-Security-Policy", csp);

        if (scores.length === 0) {
            return response.render("leaderboard-empty", { nonce });
        }
        response.render("leaderboard", { scores, nonce });
    });

    return router;
}