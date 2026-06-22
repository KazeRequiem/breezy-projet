const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middlewares/auth");

router.post("/", verifyToken, messageController.create);
router.get("/feed", verifyToken, messageController.feed);
router.get("/explore", verifyToken, messageController.explore);
router.get("/user/:id_user",verifyToken, messageController.getByUser);
router.get("/profile/:username", verifyToken, messageController.getByUsername);
router.patch("/:id", verifyToken, messageController.update);
router.delete("/:id", verifyToken, messageController.remove);



module.exports = router;