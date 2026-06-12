const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const verifyToken = require("../middlewares/auth");

router.post("/:id_user_follow",verifyToken,followController.follow);
router.delete("/:id_user_follow",verifyToken,followController.unfollow);

module.exports = router;