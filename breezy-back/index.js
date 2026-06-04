require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-expres");
const swaggerSpec = require("./swagger");
const db = require("./entity");

const app = express();
app.use(express.json());

// Doc of the swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.APP_PORT || 3000;

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Db synchronisée");
    app.listen(PORT, () => console.log(`Serveur sur port : ${PORT}`));
  })
  .catch((err) => console.error("Erreur DB:", err));