const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Inscription et authentification
 *   - name: Users
 *     description: Profils et recherche d'utilisateurs
 *   - name: Messages
 *     description: Publication, fil, recherche, réponses et whispers
 *   - name: Likes
 *     description: Likes des messages
 *   - name: Follow
 *     description: Abonnements entre utilisateurs
 *   - name: Reports
 *     description: Signalement de messages (modération)
 *   - name: Whispers
 *     description: Messages privés laissés sur un post
 *   - name: Notifications
 *     description: Notifications de l'utilisateur
 *   - name: Admin
 *     description: Administration et modération
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         username: { type: string, example: "flora_99" }
 *         biography: { type: string, nullable: true }
 *         profile_picture: { type: string, nullable: true }
 *         role: { type: string, enum: [user, moderator, admin] }
 *     Message:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         content: { type: string, maxLength: 280, example: "Hello @flora ! #dofus" }
 *         author: { type: string, description: "ID de l'auteur" }
 *         tags: { type: array, items: { type: string } }
 *         image_url: { type: string, nullable: true }
 *         video_url: { type: string, nullable: true }
 *         mood:
 *           type: string
 *           enum: [sunny, joking, teasing, sarcastic, serious, rainy, stormy, rhetorical, genuine_q, cloudy]
 *           default: cloudy
 *         replies_count: { type: integer, example: 0 }
 *         createdAt: { type: string, format: date-time }
 *     Notification:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         recipient: { type: string }
 *         sender: { type: string }
 *         type: { type: string, enum: [follow, like, mention, reply, whisper] }
 *         message: { type: string, nullable: true }
 *         read: { type: boolean }
 *     Error:
 *       type: object
 *       properties:
 *         message: { type: string }
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 description: "Lettres, chiffres et underscore uniquement"
 *                 example: "flora_99"
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: Compte créé
 *       400:
 *         description: Champs invalides (username non conforme, champ manquant)
 *       409:
 *         description: Email déjà utilisé
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Connexion réussie, renvoie un token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Identifiants incorrects
 */
router.post("/login", authController.login);

module.exports = router;