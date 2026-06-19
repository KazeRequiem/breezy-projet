const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connecté");
  } catch (err) {
    console.error("Erreur de connexion MongoDB:", err.message);
    throw err;
  }
}

module.exports = connectDB;