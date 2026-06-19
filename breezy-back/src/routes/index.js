const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/messages", require("./message"));
router.use("/follow", require("./follow"));

module.exports = router;