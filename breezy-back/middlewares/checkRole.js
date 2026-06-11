//Function takes role list and throwback a middleware
module.exports = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Accès refusé : privilège insuffisants" });
        }
        next();
    };
};