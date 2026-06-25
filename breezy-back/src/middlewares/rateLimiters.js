const rateLimit = require("express-rate-limit");
const isTest = process.env.NODE_ENV === "test";

const passthrough = (req, res, next) => next();

const globalLimiter = isTest
    ? passthrough
    : rateLimit({
        windowMs: 15 * 60 * 1000,   // 15 minutes
        max: 300,                   // 300 requêtes / IP / fenêtre
        standardHeaders: true,      // expose les en-têtes RateLimit-*
        legacyHeaders: false,
        message: { message: "Trop de requêtes, réessayez plus tard." },
    });

const authLimiter = isTest
    ? passthrough
    : rateLimit({
        windowMs: 15 * 60 * 1000,   // 15 minutes
        max: 10,                    // 10 tentatives / IP / fenêtre
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: "Trop de tentatives, réessayez plus tard." },
    });

module.exports = { globalLimiter, authLimiter };