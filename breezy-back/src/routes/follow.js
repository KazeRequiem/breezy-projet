const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const verifyToken = require("../middlewares/auth");

router.post("/:id", verifyToken, followController.follow);
router.delete("/:id", verifyToken, followController.unfollow);

router.get("/:id/followers", followController.getFollowers);
router.get("/:id/following", followController.getFollowing);

module.exports = router;