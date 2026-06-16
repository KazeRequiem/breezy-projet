const vaultLib = require("node-vault");
const env = require("./env");

const vault = vaultLib({
  endpoint: env.vault.addr,
  token: env.vault.token,
});

let jwtSecret = null;

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadSecrets() {
  for (let i = 0; i < 10; i++) {
    try {
      const result = await vault.read("secret/data/breezy");
      jwtSecret = result.data.data.jwt_secret;
      if (jwtSecret) {
        console.log("Secrets chargés depuis Vault");
        return;
      }
    } catch (err) {
      console.log(`Secret pas encore dispo, tentative ${i + 1}/10...`);
    }
    await wait(2000);
  }
  throw new Error("Impossible de charger le secret depuis Vault après 10 tentatives");
}

function getJwtSecret() {
  if (!jwtSecret) throw new Error("Secrets non chargés, appelez loadSecrets() au démarrage");
  return jwtSecret;
}

module.exports = { loadSecrets, getJwtSecret };