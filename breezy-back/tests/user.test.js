jest.mock("../src/models", () => ({
    User: {
        findOne: jest.fn(),
        find: jest.fn(),
    },
    Follow: {
        countDocuments: jest.fn(),
    },
    Message: {
        countDocuments: jest.fn(),
    },
}));

const db = require("../src/models");
const userController = require("../src/controllers/userController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("userController.getByUsername", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si l'utilisateur n'existe pas", async () => {
        // findOne(...).collation(...) chained -> collation resolve null
        db.User.findOne.mockReturnValue({
            collation: jest.fn().mockResolvedValue(null),
        });

        const req = { params: { username: "inconnu" } };
        const res = mockRes();

        await userController.getByUsername(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test("retourne (200) le profil public avec les compteurs", async () => {
        const fakeUser = {
            _id: "u1",
            username: "flora",
            email: "flora@test.com",
            biography: "bio de test",
            profile_picture: null,
            role: "user",
            tags: ["dev"],
            createdAt: "2026-01-01",
        };
        db.User.findOne.mockReturnValue({
            collation: jest.fn().mockResolvedValue(fakeUser),
        });
        db.Follow.countDocuments
            .mockResolvedValueOnce(42)  // followers (following: u1)
            .mockResolvedValueOnce(7);  // following (follower: u1)
        db.Message.countDocuments.mockResolvedValue(13);

        const req = { params: { username: "flora" } };
        const res = mockRes();

        await userController.getByUsername(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload.followersCount).toBe(42);
        expect(payload.followingCount).toBe(7);
        expect(payload.messagesCount).toBe(13);
        expect(payload.username).toBe("flora");
    });

    test("n'expose JAMAIS le mot de passe ni l'email dans le profil public", async () => {
        const fakeUser = {
            _id: "u1",
            username: "flora",
            email: "flora@test.com",
            password: "hash_secret",
            biography: null,
            profile_picture: null,
            role: "user",
            tags: [],
            createdAt: "2026-01-01",
        };
        db.User.findOne.mockReturnValue({
            collation: jest.fn().mockResolvedValue(fakeUser),
        });
        db.Follow.countDocuments.mockResolvedValue(0);
        db.Message.countDocuments.mockResolvedValue(0);

        const req = { params: { username: "flora" } };
        const res = mockRes();

        await userController.getByUsername(req, res);

        const payload = res.json.mock.calls[0][0];
        expect(payload.password).toBeUndefined();
        expect(payload.email).toBeUndefined();
    });
});
describe("userController.search", () => {
    beforeEach(() => jest.clearAllMocks());

    function mockSearchChain(result) {
        const limit = jest.fn().mockResolvedValue(result);
        const select = jest.fn().mockReturnValue({ limit });
        db.User.find.mockReturnValue({ select });
        return { select, limit };
    }

    test("retourne (200) [] si la query est vide, sans requête", async () => {
        const req = { query: { q: "   " } };
        const res = mockRes();
        await userController.search(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
        expect(db.User.find).not.toHaveBeenCalled();
    });

    test("retourne (200) [] si q est absent", async () => {
        const req = { query: {} };
        const res = mockRes();
        await userController.search(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
        expect(db.User.find).not.toHaveBeenCalled();
    });

    test("recherche 'contient' insensible à la casse + limite 5", async () => {
        const fake = [{ _id: "u1", username: "flora" }];
        const chain = mockSearchChain(fake);

        const req = { query: { q: "flo" } };
        const res = mockRes();
        await userController.search(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fake);

        const findArg = db.User.find.mock.calls[0][0];
        expect(findArg.username.$regex).toBe("flo");
        expect(findArg.username.$options).toBe("i");
        expect(chain.limit).toHaveBeenCalledWith(5);
    });

    test("échappe les caractères spéciaux regex (anti-injection)", async () => {
        mockSearchChain([]);

        const req = { query: { q: "a.*b" } };
        const res = mockRes();
        await userController.search(req, res);

        const findArg = db.User.find.mock.calls[0][0];
        expect(findArg.username.$regex).toBe("a\\.\\*b");
    });
});