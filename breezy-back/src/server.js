const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/database");
const { loadSecrets } = require("./config/vault");

async function start() {
  try {
    await loadSecrets();
    await connectDB();
    app.listen(env.port, () => console.log(`Serveur sur port : ${env.port}`));
  } catch (err) {
    console.error("Erreur au démarrage:", err.message);
    process.exit(1);
  }
}

start();