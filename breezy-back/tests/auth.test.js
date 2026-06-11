const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../models", () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock("../config/secrets", () => ({
    getJwtSecret: () => "secret_de_test",
    loadSecrets: jest.fn(),
}));

const db = require("../models");
const authController = require("../controllers/authController");
const user = require("../models/user");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("authController.register", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse si un champ obligatoire manque", async () => {
        const req = { body: { email: "a@b.com" } }; //We don't give any username or password in order to have missing field
        const res = mockRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("refuse si l'email existe déjà", async () => {
        db.User.findOne.mockResolvedValue({ id_user: 1 });
        const req = { body: { username: "flora", email: "a@b.com", password: "1234" } };  // ← cette ligne
        const res = mockRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    test("Crée un user avec une mot de passe hashé", async () => {
        db.User.findOne.mockResolvedValue(null);
        db.User.create.mockImplementation(async (data) => ({ id_user: 1, ...data }));

        const req = { body: { username: "flora", email: "a@b.com", password: "1234" } };
        const res = mockRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        //We check that the pass is not visible
        const createArg = db.User.create.mock.calls[0][0];
        expect(createArg.password).not.toBe("1234");
        const isHashed = await bcrypt.compare("1234", createArg.password);
        expect(isHashed).toBe(true);
    });
});

describe("authController.login", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse des identifiants invalide (user inexsitant)", async () => {
        db.User.findOne.mockResolvedValue(null);
        const req = { body: { email: "a@b.com", password: "1234" } };
        const res = mockRes();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("retourne un token JWT valide si identifiants corrects", async () => {
        const hashed = await bcrypt.hash("1234", 10);
        db.User.findOne.mockResolvedValue({
            id_user: 1, email: "a@b.com", password: hashed, username: "flora", role: "user",
        });

        const req = { body: { email: "a@b.com", password: "1234" } };
        const res = mockRes();

        await authController.login(req, res);

        expect(res.json).toHaveBeenCalled();
        const payload = res.json.mock.calls[0][0];
        // The token must be checkable with the secret
        expect(payload).toHaveProperty("token");
        const decoded = jwt.verify(payload.token, "secret_de_test");
    });
})