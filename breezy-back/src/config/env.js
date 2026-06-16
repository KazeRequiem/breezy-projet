require("dotenv").config();

// Liste des variables requises
const required = ["MONGO_URI", "VAULT_ADDR", "VAULT_TOKEN", "APP_PORT"];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Variables d'environnement manquantes : ${missing.join(", ")}`);
}

module.exports = {
  port: process.env.APP_PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  vault: {
    addr: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN,
  },
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};