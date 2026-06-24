const express = require("express");
const router = express.Router();
const whisperController = require("../controllers/whisperController");
const verifyToken = require("../middlewares/auth");

router.delete("/:id", verifyToken, whisperController.remove);

module.exports = router;