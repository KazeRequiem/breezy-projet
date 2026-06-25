const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const verifyToken = require("../middlewares/auth");

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Mes notifications (récentes d'abord)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Notification' }
 */
router.get("/", verifyToken, notificationController.getMine);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marquer toutes mes notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Notifications marquées comme lues }
 */
router.patch("/read-all", verifyToken, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification marquée comme lue }
 *       403: { description: Ce n'est pas votre notification }
 *       404: { description: Notification introuvable }
 */
router.patch("/:id/read", verifyToken, notificationController.markAsRead);

module.exports = router;