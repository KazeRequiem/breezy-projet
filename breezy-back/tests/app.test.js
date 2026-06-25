process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.VAULT_ADDR = "http://localhost:8200";
process.env.VAULT_TOKEN = "test_token";
process.env.APP_PORT = "3000";

const request = require("supertest");
const app = require("../src/app");

describe("App — sécurité HTTP", () => {
    test("GET / répond et confirme que l'API tourne", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.body.message).toBeDefined();
    });

    test("ne divulgue pas le moteur (pas de X-Powered-By)", async () => {
        const res = await request(app).get("/");
        expect(res.headers["x-powered-by"]).toBeUndefined();
    });

    test("expose les en-têtes de sécurité ajoutés par helmet", async () => {
        const res = await request(app).get("/");
        expect(res.headers["x-content-type-options"]).toBe("nosniff");
        expect(res.headers["x-frame-options"]).toBeDefined();
        expect(res.headers["strict-transport-security"]).toBeDefined();
    });
});