const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/messages", require("./message"));
router.use("/follow", require("./follow"));
router.use("/likes", require("./like"));
router.use("/users", require("./user"));
router.use("/admin", require("./admin"));
router.use("/reports",require("./report"));
router.use("/whispers", require("./whisper"));

module.exports = router;
