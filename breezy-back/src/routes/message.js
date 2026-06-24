const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middlewares/auth");
const replyController = require("../controllers/replyController");

router.post("/", verifyToken, messageController.create);
//Feed---
router.get("/feed", verifyToken, messageController.feed);
router.get("/explore", verifyToken, messageController.explore);
//---
//TagSearch---
router.get("/search", verifyToken, messageController.search);
//---
router.get("/user/:id_user",verifyToken, messageController.getByUser);
router.get("/profile/:username", verifyToken, messageController.getByUsername);
router.patch("/:id", verifyToken, messageController.update);
router.delete("/:id", verifyToken, messageController.remove);
//Reply
router.post("/:id/replies", verifyToken, replyController.create);
router.get("/:id/replies", verifyToken, replyController.getByMessage);



module.exports = router;