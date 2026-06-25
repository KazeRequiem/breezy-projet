jest.mock("../src/models", () => ({
    Message: {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
        deleteMany: jest.fn(),
    },
    User: {
        findOne: jest.fn(),
    },
    Reply: {
        find: jest.fn(),
        deleteMany: jest.fn(),
    },
    Like: {
        deleteMany: jest.fn(),
    },
}));

const db = require("../src/models");
jest.mock("../src/utils/notifyMentions");
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

    test("enregistre le mood fourni s'il est valide", async () => {
        db.Message.create.mockImplementation(async (data) => ({ _id: "m1", ...data }));
        const req = { body: { content: "Post", mood: "stormy" }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.create(req, res);
        const createArg = db.Message.create.mock.calls[0][0];
        expect(createArg.mood).toBe("stormy");
    });

    test("retombe sur le mood par défaut si mood inconnu", async () => {
        db.Message.create.mockImplementation(async (data) => ({ _id: "m1", ...data }));
        const req = { body: { content: "Post", mood: "banane" }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.create(req, res);
        const createArg = db.Message.create.mock.calls[0][0];
        expect(createArg.mood).toBe("cloudy");
    });

    test("retombe sur le mood par défaut si aucun mood fourni", async () => {
        db.Message.create.mockImplementation(async (data) => ({ _id: "m1", ...data }));
        const req = { body: { content: "Post" }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.create(req, res);
        const createArg = db.Message.create.mock.calls[0][0];
        expect(createArg.mood).toBe("cloudy");
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

    test("change le mood à l'édition si un mood valide est fourni", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u1" }, tags: [], mood: "cloudy" });
        db.Message.findByIdAndUpdate.mockResolvedValue({ _id: "m1", content: "modifié", mood: "sunny" });
        const req = { params: { id: "m1" }, user: { id: "u1" }, body: { content: "modifié", mood: "sunny" } };
        const res = mockRes();
        await messageController.update(req, res);
        const updateArg = db.Message.findByIdAndUpdate.mock.calls[0][1];
        expect(updateArg.mood).toBe("sunny");
    });

    test("conserve le mood existant si aucun mood n'est fourni à l'édition", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u1" }, tags: [], mood: "stormy" });
        db.Message.findByIdAndUpdate.mockResolvedValue({ _id: "m1", content: "modifié", mood: "stormy" });
        const req = { params: { id: "m1" }, user: { id: "u1" }, body: { content: "modifié" } };
        const res = mockRes();
        await messageController.update(req, res);
        const updateArg = db.Message.findByIdAndUpdate.mock.calls[0][1];
        expect(updateArg.mood).toBe("stormy");
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
        db.Reply.find.mockResolvedValue([]);
        db.Reply.deleteMany.mockResolvedValue({});
        db.Like.deleteMany.mockResolvedValue({});
        db.Message.deleteMany.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { id: "m1" }, user: { id: "u1", role: "user" } };
        const res = mockRes();
        await messageController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("autorise (200) un moderateur a supprimer le message d'un autre", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1", author: { toString: () => "u999" } });
        db.Reply.find.mockResolvedValue([]);
        db.Reply.deleteMany.mockResolvedValue({});
        db.Like.deleteMany.mockResolvedValue({});
        db.Message.deleteMany.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { id: "m1" }, user: { id: "u1", role: "moderator" } };
        const res = mockRes();
        await messageController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("messageController.getByUsername", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si l'utilisateur n'existe pas", async () => {
        db.User.findOne.mockResolvedValue(null);
        const req = { params: { username: "inconnu" } };
        const res = mockRes();
        await messageController.getByUsername(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Message.find).not.toHaveBeenCalled();
    });

    test("retourne (200) les messages de l'utilisateur trouvé", async () => {
        db.User.findOne.mockResolvedValue({ _id: "u1", username: "flora" });
        const fakeMessages = [
            { _id: "m1", content: "Post 1", author: "u1" },
            { _id: "m2", content: "Post 2", author: "u1" },
        ];
        db.Message.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeMessages),
        });

        const req = { params: { username: "flora" } };
        const res = mockRes();
        await messageController.getByUsername(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeMessages);
        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.author).toBe("u1");
    });

    test("retourne (200) un tableau vide si l'utilisateur n'a pas de message", async () => {
        db.User.findOne.mockResolvedValue({ _id: "u1", username: "flora" });
        db.Message.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([]),
        });

        const req = { params: { username: "flora" } };
        const res = mockRes();
        await messageController.getByUsername(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });
});