const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");
const verifyToken = require("../middlewares/auth");

router.post("/", verifyToken, messageController.create);

module.exports = router;