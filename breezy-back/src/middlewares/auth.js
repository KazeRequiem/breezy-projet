const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/vault");

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token manquant" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};