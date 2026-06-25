const vault = require("node-vault")({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  let ready = false;
  for (let i = 0; i < 10; i++) {
    try {
      await vault.health();
      ready = true;
      break;
    } catch (e) {
      console.log(`Vault pas encore prêt, tentative ${i + 1}/10...`);
      await wait(2000);
    }
  }

  if (!ready) {
    console.error("Vault injoignable après 10 tentatives");
    process.exit(1);
  }
  try {
    try {
      await vault.read("secret/data/breezy");
      console.log("Secret déjà présent dans Vault, rien à faire.");
      return;
    } catch (e) {
        console.log("Secret non trouvé, création en cours")
    }

    const secret =
      process.env.JWT_SECRET || require("crypto").randomBytes(48).toString("hex");

    await vault.write("secret/data/breezy", {
      data: { jwt_secret: secret },
    });
    console.log("JWT_SECRET écrit dans Vault");
  } catch (err) {
    console.error("Erreur init Vault:", err.message);
    process.exit(1);
  }
})();