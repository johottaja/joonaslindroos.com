const express = require("express");
const nodemailer = require('nodemailer');
const axios = require('axios');
const {check, validationResult} = require("express-validator");

const router = express.Router();


const recentSubmissions = new Map();


module.exports = (params) => {

    router.post("/", [
        check("name")
            .trim()
            .isLength({min: 1, max: 30})
            .withMessage("Name is invalid"),
        check("message")
            .trim()
            .isLength({min: 1, max: 300})
            .withMessage("Message is invalid"),
        check("email")
            .trim()
            .isLength({min: 1, max: 150})
            .isEmail(),
    ], async (request, response, next) => {
        try {
            const errors = validationResult(request);
            console.log(errors)

            if (errors.isEmpty()) {
                if (recentSubmissions.has(request.ip)) {
                    return response.status(429).render("message", {heading: "Too many messages", message: "Try" +
                            " again later"});
                }

                const success = await verifyRecaptcha(request.body['g-recaptcha-response'], request.ip);
                if (success) {
                    const sent = sendFeedbackEmail(request.body, response, request.ip);
                } else {
                    return response.status(500).render("message", {heading: "An error occurred", message: "Your" +
                            " message was not sent"});
                }
            } else {
                return response.status(400).render("message", {heading: "Invalid request", message: "Your" +
                    " message was not sent"});
            }
        } catch (err) {
            next(err);
        }
    });

    function verifyRecaptcha(token, ip) {
        return axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token,
                remoteip: ip
            }
        }).then(response => {
            const data = response.data;
            if (data.success) {
                return true;
            } else {
                return false;
            }
        }).catch(error => {
            console.error("Recaptcha verification error:", error);
            return false;
        });
    }

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.FEEDBACK_EMAIL_ADDRESS,
            pass: process.env.FEEDBACK_EMAIL_PASSWORD,
        },
    });

    async function sendFeedbackEmail(body, response, ip) {
        const mailOptions = {
            from: body.email,
            to: process.env.FEEDBACK_EMAIL_ADDRESS,
            subject: `New Contact Form Submission from ${body.name}`,
            text: body.email + " [" + ip + "]" + " wants to say the following:\n" + body.message,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                response.status(500).render("message", {heading: "An error occurred", message: "Your message was not" +
                        " sent"});
            } else {
                recentSubmissions.set(ip, Date.now());
                setTimeout(() => recentSubmissions.delete(ip), 60000 * 5);

                response.status(200).render("message", {heading: "Thank you!", message: "Your message was sent" +
                        " successfully" });
            }
        });
    }

    return router;
}