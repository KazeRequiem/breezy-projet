const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/auth");

router.get("/search", verifyToken, userController.search);
router.get("/:username", userController.getByUsername);

module.exports = router;
