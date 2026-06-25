process.env.NODE_ENV = "test";

const { globalLimiter, authLimiter } = require("../src/middlewares/rateLimiters");

describe("rateLimiters — neutralisés en environnement de test", () => {
    test("globalLimiter est un passe-plat en test (appelle next)", () => {
        const next = jest.fn();
        globalLimiter({}, {}, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test("authLimiter est un passe-plat en test (appelle next)", () => {
        const next = jest.fn();
        authLimiter({}, {}, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});