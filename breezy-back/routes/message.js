const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middlewares/auth");

router.post("/", verifyToken, messageController.create);
router.get("/user/:id_user",verifyToken, messageController.getByUser);

module.exports = router;