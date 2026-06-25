const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middlewares/auth");
const replyController = require("../controllers/replyController");
const whisperController = require("../controllers/whisperController");

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Publier un message
 *     description: "Les @mentions présentes dans le contenu génèrent des notifications. Les tags (#) sont normalisés."
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 280 }
 *               tags: { type: array, items: { type: string } }
 *               image_url: { type: string }
 *               video_url: { type: string }
 *               mood:
 *                 type: string
 *                 enum: [sunny, joking, teasing, sarcastic, serious, rainy, stormy, rhetorical, genuine_q, cloudy]
 *                 description: "Ton du message (défaut cloudy si absent ou inconnu)"
 *     responses:
 *       201:
 *         description: Message créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       400: { description: Contenu vide ou trop long }
 */
router.post("/", verifyToken, messageController.create);

/**
 * @swagger
 * /api/messages/feed:
 *   get:
 *     summary: Fil des personnes suivies (pagination par curseur)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: before
 *         schema: { type: string, format: date-time }
 *         description: Curseur - ne renvoie que les messages plus anciens que cette date
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 20 }
 *     responses:
 *       200:
 *         description: Messages des abonnements (récents d'abord)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Message' }
 */
router.get("/feed", verifyToken, messageController.feed);

/**
 * @swagger
 * /api/messages/explore:
 *   get:
 *     summary: Découverte - tous les messages (pagination par curseur)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: before
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 20 }
 *     responses:
 *       200:
 *         description: Tous les messages (récents d'abord)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Message' }
 */
router.get("/explore", verifyToken, messageController.explore);

/**
 * @swagger
 * /api/messages/search:
 *   get:
 *     summary: Rechercher des messages par tags (logique OU)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: "Tags séparés par des virgules, ex : dofus,mmo. Vide = []"
 *       - in: query
 *         name: before
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 20 }
 *     responses:
 *       200:
 *         description: Messages correspondant à au moins un tag
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Message' }
 */
router.get("/search", verifyToken, messageController.search);

/**
 * @swagger
 * /api/messages/user/{id_user}:
 *   get:
 *     summary: Messages d'un utilisateur (par ID)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Messages de l'utilisateur (récents d'abord) }
 */
router.get("/user/:id_user", verifyToken, messageController.getByUser);

/**
 * @swagger
 * /api/messages/profile/{username}:
 *   get:
 *     summary: Messages d'un utilisateur (par username)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Messages de l'utilisateur }
 *       404: { description: Utilisateur introuvable }
 */
router.get("/profile/:username", verifyToken, messageController.getByUsername);

/**
 * @swagger
 * /api/messages/{id}:
 *   patch:
 *     summary: Modifier son message
 *     tags: [Messages]
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
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 280 }
 *               tags: { type: array, items: { type: string } }
 *               mood:
 *                 type: string
 *                 enum: [sunny, joking, teasing, sarcastic, serious, rainy, stormy, rhetorical, genuine_q, cloudy]
 *     responses:
 *       200: { description: Message mis à jour }
 *       400: { description: Contenu invalide }
 *       403: { description: Vous n'êtes pas l'auteur }
 *       404: { description: Message introuvable }
 *   delete:
 *     summary: Supprimer un message (auteur ou modérateur/admin)
 *     description: Suppression en cascade (réponses, liens et likes associés).
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Message supprimé }
 *       403: { description: Action non autorisée }
 *       404: { description: Message introuvable }
 */
router.patch("/:id", verifyToken, messageController.update);
router.delete("/:id", verifyToken, messageController.remove);

/**
 * @swagger
 * /api/messages/{id}/replies:
 *   post:
 *     summary: Répondre à un message
 *     description: Notifie l'auteur du message parent.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID du message parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 280 }
 *     responses:
 *       201: { description: Réponse créée }
 *       400: { description: Contenu invalide }
 *       404: { description: Message parent introuvable }
 *   get:
 *     summary: Réponses d'un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des messages-réponses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Message' }
 */
router.post("/:id/replies", verifyToken, replyController.create);
router.get("/:id/replies", verifyToken, replyController.getByMessage);

/**
 * @swagger
 * /api/messages/{id}/whispers:
 *   post:
 *     summary: Chuchoter (message privé) sur un post
 *     description: "Visible seulement par l'auteur du whisper et l'auteur du message. Notifie ce dernier."
 *     tags: [Whispers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID du message ciblé
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 280 }
 *               mood:
 *                 type: string
 *                 enum: [sunny, joking, teasing, sarcastic, serious, rainy, stormy, rhetorical, genuine_q, cloudy]
 *     responses:
 *       201: { description: Whisper créé }
 *       400: { description: Contenu invalide }
 *       404: { description: Message introuvable }
 *   get:
 *     summary: Whispers visibles sur un message
 *     description: "L'auteur du message voit tous les whispers ; un autre utilisateur ne voit que les siens."
 *     tags: [Whispers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Liste des whispers visibles }
 *       404: { description: Message introuvable }
 */
router.post("/:id/whispers", verifyToken, whisperController.create);
router.get("/:id/whispers", verifyToken, whisperController.getByMessage);

module.exports = router;