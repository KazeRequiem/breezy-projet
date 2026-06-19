const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const env = require("./config/env");

const app = express();
app.disable("x-powered-by"); //Disable the fact that the back says Hey i turn on express bro

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (req, res) => res.json({ message: "Breezy API up" }));
app.use("/api", require("./routes"));

module.exports = app;