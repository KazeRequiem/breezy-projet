const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

// Modération des messages : admin + modérateur
router.get("/messages", verifyToken, checkRole(["admin", "moderator"]), adminController.listMessages);

// Liste des utilisateurs : admin + modérateur (le modérateur peut suspendre des utilisateurs)
router.get("/users", verifyToken, checkRole(["admin", "moderator"]), adminController.listUsers);
// Changement de rôle : admin uniquement
router.patch("/users/:id/role", verifyToken, checkRole(["admin"]), adminController.updateRole);

// Suspension / bannissement : admin + modérateur
router.patch("/users/:id/suspend", verifyToken, checkRole(["admin", "moderator"]), adminController.toggleSuspend);

module.exports = router;
