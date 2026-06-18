jest.mock("../src/models", () => ({
    Message: {
        create: jest.fn(),
        find: jest.fn(),
    },
}));

const db = require("../src/models");
const messageController = require("../src/controllers/messageController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("messageController.create", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse si le contenu est vide", async () => {
        const req = { body: { content: "" }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("refuse si le contenu dépasse 280 caractères", async () => {
        const req = { body: { content: "a".repeat(281) }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("crée un message en utilisant l'auteur du token, pas du body", async () => {
        db.Message.create.mockImplementation(async (data) => ({ _id: "m1", ...data }));

        const req = {
            body: { content: "Mon premier post", author: "fake999" },
            user: { id: "u1" },
        };
        const res = mockRes();
        await messageController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        const createArg = db.Message.create.mock.calls[0][0];
        expect(createArg.author).toBe("u1");
        expect(createArg.author).not.toBe("fake999");
        expect(createArg.content).toBe("Mon premier post");
    });

    test("accepte un contenu de 280 caractères pile", async () => {
        db.Message.create.mockImplementation(async (data) => ({ _id: "m1", ...data }));
        const req = { body: { content: "a".repeat(280) }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe("messageController.getByUser", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne les messages d'un utilisateur donné", async () => {
        const fakeMessages = [
            { _id: "m1", content: "Post 1", author: "5" },
            { _id: "m2", content: "Post 2", author: "5" },
        ];
        db.Message.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeMessages),
        });

        const req = { params: { id_user: "5" } };
        const res = mockRes();
        await messageController.getByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeMessages);
        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.author).toBe("5");
    });

    test("retourne un tableau vide si l'utilisateur n'a pas de message", async () => {
        db.Message.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([]),
        });
        const req = { params: { id_user: "99" } };
        const res = mockRes();
        await messageController.getByUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });
});