const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const db = require("./src/models");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash("Admin@1234!", 10);
  const user = await db.User.create({
    username: "admin",
    email: "admin@breezy.ovh",
    password: hash,
    role: "admin",
  });
  console.log("Utilisateur créé :", user.username, user.email, user.role);
  await mongoose.disconnect();
})().catch(e => { console.error("Erreur:", e.message); process.exit(1); });
