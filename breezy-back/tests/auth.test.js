const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TEST_SECRET = "secret_de_test"

jest.mock("../src/models", () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock("../src/config/vault", () => ({
    getJwtSecret: () => "secret_de_test",
    loadSecrets: jest.fn(),
}));

const db = require("../src/models");
const authController = require("../src/controllers/authController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("authController.register", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse si un champ obligatoire manque", async () => {
        const req = { body: { email: "a@b.com" } };
        const res = mockRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("refuse si l'email existe déjà", async () => {
        db.User.findOne.mockResolvedValue({ _id: "u1" });
        const req = { body: { username: "flora", email: "a@b.com", password: "1234" } };
        const res = mockRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    test("crée un user avec un mot de passe hashé", async () => {
        db.User.findOne.mockResolvedValue(null);
        db.User.create.mockImplementation(async (data) => ({ _id: "u1", ...data }));

        const req = { body: { username: "flora", email: "a@b.com", password: "1234" } };
        const res = mockRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        // on vérifie que le mot de passe stocké n'est pas le clair
        const createArg = db.User.create.mock.calls[0][0];
        expect(createArg.password).not.toBe("1234");
        const isHashed = await bcrypt.compare("1234", createArg.password);
        expect(isHashed).toBe(true);
    });
});

describe("authController.login", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse des identifiants invalides (user inexistant)", async () => {
        db.User.findOne.mockResolvedValue(null);
        const req = { body: { email: "a@b.com", password: "1234" } };
        const res = mockRes();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test("retourne un token JWT valide si identifiants corrects", async () => {
        const hashed = await bcrypt.hash("1234", 10);
        db.User.findOne.mockResolvedValue({
            _id: "u1", email: "a@b.com", password: hashed, username: "flora", role: "user",
        });

        const req = { body: { email: "a@b.com", password: "1234" } };
        const res = mockRes();

        await authController.login(req, res);

        expect(res.json).toHaveBeenCalled();
        const payload = res.json.mock.calls[0][0];
        expect(payload).toHaveProperty("token");
        jwt.verify(payload.token, TEST_SECRET);
    });

    test("le token contient l'id et le rôle du user", async () => {
        const hashed = await bcrypt.hash("1234", 10);
        db.User.findOne.mockResolvedValue({
            _id: "u1", email: "a@b.com", password: hashed, username: "flora", role: "admin",
        });
        const req = { body: { email: "a@b.com", password: "1234" } };
        const res = mockRes();
        await authController.login(req, res);

        const payload = res.json.mock.calls[0][0];
        const decoded = jwt.verify(payload.token, TEST_SECRET);
        expect(decoded.id).toBe("u1");
        expect(decoded.role).toBe("admin");
    });

    test("rejette (400) une tentative d'injection NoSQL sur l'email", async () => {
        const req = { body: { email: { $gt: "" }, password: "1234" } };
        const res = mockRes();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(db.User.findOne).not.toHaveBeenCalled();
    });
});