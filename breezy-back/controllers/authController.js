const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { getJwtSecret } = require("../config/secrets");

const User = db.User;

exports.register = async (req ,res ) => {
    try{
        const {username, email ,password, biography, profile_picture } = req.body;

        if(!username || !email || !password) {
            return res.status(400).json ({message: "username, email et mot de passe sont requis"});
        }

        const existing = await User.findOne({ where: { email }});
        if (existing) {
            return res.status(409).json({ message: "Cet email est déjà utilisé"});
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashed,
            biography: biography || null,
            profile_picture: profile_picture || null,
            role: "User",
        });

        res.status(201).json({
            id_user: user.id_user,
            username: user.username,
            email: user.email,
            biography: user.biography,
            profile_picture: user.profile_picture,
            role: user.role,
        });
    }catch(err){
        console.error(err);
        res.status(500).json({message : "Erreur serveur"});
    }
};