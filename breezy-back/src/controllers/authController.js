const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { getJwtSecret } = require("../config/vault");

const User = db.User;

exports.register = async (req, res) => {
    try {
        const { username, email, password, biography, profile_picture, tags } = req.body;

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({ message: "username, email et mot de passe sont requis" });
        }

        const existing = await User.findOne({ email: String(email) });
        if (existing) {
            return res.status(409).json({ message: "Cet email est déjà utilisé" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashed,
            biography: biography || null,
            profile_picture: profile_picture || null,
            role: "user",
            tags: tags || [],
        });

        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            biography: user.biography,
            profile_picture: user.profile_picture,
            role: user.role,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "email et mot de passe sont requis" });
        }

        const user = await User.findOne({ email: String(email) });
        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            getJwtSecret(),
            { expiresIn: "24h" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile_picture: user.profile_picture || null,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};