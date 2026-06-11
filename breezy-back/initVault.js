require("dotenv").config();
const vault = require("node-vault")({
    endpoint: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN,
});

(async () => {
    try {

        const secret = require("crypto").randomBytes(48).toString("hex");
        await vault.write("secret/data/breezy", {
            data: { jwt_secret: secret },
        });
        console.log("JWT_SECRET écrit en vault");
    } catch (err){
        console.error("Erreur init du vault", err.message);
        process.exit(1);
    }
})();