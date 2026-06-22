jest.mock("../src/models", () => ({
    User: {
        findOne: jest.fn(),
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
        expect(payload.password).toBeUndefined(); // never pass in clear
        expect(payload.email).toBeUndefined();    // no email in public
    });
});