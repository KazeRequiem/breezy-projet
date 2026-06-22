jest.mock("../src/models", () => ({
    Message: {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
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

    test("crée un message avec l'auteur du token, pas du body", async () => {
        db.Message.create.mockImplementation(async (data) => ({ _id: "m1", ...data }));
        const req = { body: { content: "Post", author: "fake999" }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        const createArg = db.Message.create.mock.calls[0][0];
        expect(createArg.author).toBe("u1");
        expect(createArg.author).not.toBe("fake999");
    });
});

describe("messageController.getByUser", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne les messages d'un utilisateur", async () => {
        const fake = [{ _id: "m1", content: "P1", author: "5" }];
        db.Message.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fake) });
        const req = { params: { id_user: "5" } };
        const res = mockRes();
        await messageController.getByUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fake);
    });
});

describe("messageController.update", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le message n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { id: "m1" }, user: { id: "u1" }, body: { content: "n" } };
        const res = mockRes();
        await messageController.update(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test("refuse (403) si on n'est pas l'auteur", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u999" } });
        const req = { params: { id: "m1" }, user: { id: "u1" }, body: { content: "n" } };
        const res = mockRes();
        await messageController.update(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(db.Message.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("refuse (400) si le contenu est vide", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u1" } });
        const req = { params: { id: "m1" }, user: { id: "u1" }, body: { content: "" } };
        const res = mockRes();
        await messageController.update(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("met à jour (200) content et tags si on est l'auteur", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u1" }, tags: [] });
        db.Message.findByIdAndUpdate.mockResolvedValue({ _id: "m1", content: "modifié", tags: ["news"] });
        const req = { params: { id: "m1" }, user: { id: "u1" }, body: { content: "modifié", tags: ["news"] } };
        const res = mockRes();
        await messageController.update(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        const updateArg = db.Message.findByIdAndUpdate.mock.calls[0][1];
        expect(updateArg.content).toBe("modifié");
        expect(updateArg.tags).toEqual(["news"]);
    });
});

describe("messageController.remove", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le message n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { id: "m1" }, user: { id: "u1", role: "user" } };
        const res = mockRes();
        await messageController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test("refuse (403) si un user normal supprime le message d'un autre", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u999" } });
        const req = { params: { id: "m1" }, user: { id: "u1", role: "user" } };
        const res = mockRes();
        await messageController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(db.Message.deleteOne).not.toHaveBeenCalled();
    });

    test("autorise (200) l'auteur a supprimer son message", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u1" } });
        db.Message.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { id: "m1" }, user: { id: "u1", role: "user" } };
        const res = mockRes();
        await messageController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("autorise (200) un moderateur a supprimer le message d'un autre", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u999" } });
        db.Message.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { id: "m1" }, user: { id: "u1", role: "moderator" } };
        const res = mockRes();
        await messageController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});