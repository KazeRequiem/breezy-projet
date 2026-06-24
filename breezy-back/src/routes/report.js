const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

// Warn a message : all connected user
router.post("/:messageId", verifyToken, reportController.report);

// Dashboard moderation : modérateurs + admins
router.get("/", verifyToken, checkRole(["moderator", "admin"]), reportController.getReports);

//Resolve a warn on a message (moderation)
router.delete("/:messageId", verifyToken, checkRole(["moderator", "admin"]), reportController.dismiss);

module.exports = router;