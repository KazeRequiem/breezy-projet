const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/secrets");

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token manquant" });
        }
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};
