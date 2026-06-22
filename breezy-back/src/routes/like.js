const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const verifyToken = require("../middlewares/auth");

router.post("/:messageId", verifyToken, likeController.like);
router.delete("/:messageId", verifyToken, likeController.unlike);
router.get("/:messageId/status", verifyToken, likeController.getStatus);
router.get("/:messageId", likeController.getByMessage);
module.exports = router;