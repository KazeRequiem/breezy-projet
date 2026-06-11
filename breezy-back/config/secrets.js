const vault = require("node_vault")({
    endpoint: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN,
});

let jwtSecret = null;

async function loadSecrets() {
  const result = await vault.read("secret/data/breezy");
  jwtSecret = result.data.data.jwt_secret;
  if (!jwtSecret) throw new Error("jwt_secret introuvable dans le vault");
  console.log("Secrets chargés dans le vault");
}

function getJwtSecret() {
  if (!jwtSecret) throw new Error("Secrets non chargés - appelez loadSecrets() au démarrage");
  return jwtSecret;
}

module.exports = { loadSecrets, getJwtSecret };