const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

/**
 * @swagger
 * /api/admin/messages:
 *   get:
 *     summary: Lister les messages (modération)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Liste des messages }
 *       403: { description: Réservé aux admins/modérateurs }
 */
router.get("/messages", verifyToken, checkRole(["admin", "moderator"]), adminController.listMessages);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lister les utilisateurs (modération)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Liste des utilisateurs }
 *       403: { description: Réservé aux admins/modérateurs }
 */
router.get("/users", verifyToken, checkRole(["admin", "moderator"]), adminController.listUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Changer le rôle d'un utilisateur (admin uniquement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [user, moderator, admin] }
 *     responses:
 *       200: { description: Rôle mis à jour }
 *       403: { description: Réservé aux admins }
 *       404: { description: Utilisateur introuvable }
 */
router.patch("/users/:id/role", verifyToken, checkRole(["admin"]), adminController.updateRole);

/**
 * @swagger
 * /api/admin/users/{id}/suspend:
 *   patch:
 *     summary: Suspendre / réactiver un utilisateur
 *     description: "Un modérateur ne peut suspendre que des utilisateurs simples, ni lui-même."
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Statut de suspension basculé }
 *       403: { description: Action non autorisée }
 *       404: { description: Utilisateur introuvable }
 */
router.patch("/users/:id/suspend", verifyToken, checkRole(["admin", "moderator"]), adminController.toggleSuspend);

module.exports = router;