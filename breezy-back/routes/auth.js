const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

//TODO : Comments for each routes in order to display it in /api-docs

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;