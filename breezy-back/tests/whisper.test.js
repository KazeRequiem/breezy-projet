jest.mock("../src/models", () => ({
    Whisper: {
        find: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        deleteOne: jest.fn(),
    },
    Message: {
        findById: jest.fn(),
    },
}));

const db = require("../src/models");
const whisperController = require("../src/controllers/whisperController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

// chain find().populate() mocked -> resolves into result
function mockFindChain(result) {
    const populate = jest.fn().mockResolvedValue(result);
    db.Whisper.find.mockReturnValue({ populate });
    return { populate };
}

describe("whisperController.create", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le message cible n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { id: "m1" }, body: { content: "coucou" }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Whisper.create).not.toHaveBeenCalled();
    });

    test("refuse (400) si le contenu est vide", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: "u2" });
        const req = { params: { id: "m1" }, body: { content: "   " }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(db.Whisper.create).not.toHaveBeenCalled();
    });

    test("refuse (400) si le contenu depasse 280 caracteres", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: "u2" });
        const req = { params: { id: "m1" }, body: { content: "a".repeat(281) }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(db.Whisper.create).not.toHaveBeenCalled();
    });

    test("cree le whisper (201) avec author du token, message du param, content du body", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: "u2" });
        db.Whisper.create.mockImplementation(async (data) => ({ _id: "w1", ...data }));
        const req = { params: { id: "m1" }, body: { content: "psst" }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        const arg = db.Whisper.create.mock.calls[0][0];
        expect(arg.author).toBe("u1");
        expect(arg.message).toBe("m1");
        expect(arg.content).toBe("psst");
    });
});

describe("whisperController.getByMessage (visibilite)", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le message n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { id: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.getByMessage(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Whisper.find).not.toHaveBeenCalled();
    });

    test("auteur du message : voit TOUS les whispers du message", async () => {
        // le demandeur u2 EST l'auteur du message
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u2" } });
        const all = [{ _id: "w1", content: "a" }, { _id: "w2", content: "b" }];
        mockFindChain(all);

        const req = { params: { id: "m1" }, user: { id: "u2" } };
        const res = mockRes();
        await whisperController.getByMessage(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(all);
        // filtre : uniquement le message, PAS de filtre author
        const findArg = db.Whisper.find.mock.calls[0][0];
        expect(findArg.message).toBe("m1");
        expect(findArg.author).toBeUndefined();
    });

    test("autre user : ne voit QUE ses propres whispers sur ce message", async () => {
        // le demandeur u1 n'est PAS l'auteur du message (u2)
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u2" } });
        const mine = [{ _id: "w3", content: "mon whisper", author: "u1" }];
        mockFindChain(mine);

        const req = { params: { id: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.getByMessage(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mine);
        // filtre : message ET author = moi
        const findArg = db.Whisper.find.mock.calls[0][0];
        expect(findArg.message).toBe("m1");
        expect(findArg.author).toBe("u1");
    });
});

describe("whisperController.remove", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le whisper n'existe pas", async () => {
        db.Whisper.findById.mockResolvedValue(null);
        const req = { params: { id: "w1" }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Whisper.deleteOne).not.toHaveBeenCalled();
    });

    test("refuse (403) si le demandeur n'est pas l'auteur du whisper", async () => {
        db.Whisper.findById.mockResolvedValue({ _id: "w1", author: { toString: () => "u2" } });
        const req = { params: { id: "w1" }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(db.Whisper.deleteOne).not.toHaveBeenCalled();
    });

    test("supprime (200) si le demandeur est l'auteur du whisper", async () => {
        db.Whisper.findById.mockResolvedValue({ _id: "w1", author: { toString: () => "u1" } });
        db.Whisper.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { id: "w1" }, user: { id: "u1" } };
        const res = mockRes();
        await whisperController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(db.Whisper.deleteOne).toHaveBeenCalled();
    });
});