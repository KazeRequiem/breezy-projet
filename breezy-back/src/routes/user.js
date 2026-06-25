const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/auth");

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Rechercher des utilisateurs (autocomplétion)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: "Terme recherché (contenu dans le pseudo, insensible à la casse). Vide = []"
 *     responses:
 *       200:
 *         description: Jusqu'à 5 utilisateurs correspondants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get("/search", verifyToken, userController.search);

// PUT /api/users/me : mise à jour du profil de l'utilisateur connecté
// (déclarée avant /:username pour ne pas être capturée comme un username)
router.put("/me", verifyToken, userController.updateProfile);

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Profil public d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profil public + compteurs
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     followersCount: { type: integer }
 *                     followingCount: { type: integer }
 *                     messagesCount: { type: integer }
 *       404:
 *         description: Utilisateur introuvable
 */
router.get("/:username", userController.getByUsername);

module.exports = router;