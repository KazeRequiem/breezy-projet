require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const db = require("./models");
const { loadSecrets } = require("./config/secrets");

const app = express();
app.use(express.json());

// Doc of the swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.json({ message: "Breezy API up"}));

const PORT = process.env.APP_PORT || 3000;

async function start() {
  try{
    await loadSecrets();
    await db.sequelize.sync({ alter: true });
    console.log("DB Synchronisée");

    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/messages", require("./routes/message"));
    app.use("/api/follow", require("./routes/follow"));

    app.listen(PORT, () => console.log(`Serveur sur port :  ${PORT}`));
  } catch(err) {
    console.error("Erreur au démarrage", err.message);
    process.exit(1);
  }
}
start();