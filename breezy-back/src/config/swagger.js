const swaggerJsdoc = require("swagger-jsdoc");
const env = require("./env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Breezy API",
      version: "1.0.0",
      description: "API du réseau social Breezy",
    },
    servers: [
      { url: "https://breezy.badeline.ovh", description: "Production" },
      { url: `http://localhost:${env.port}`, description: "Local" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
