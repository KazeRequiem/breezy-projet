jest.mock("../src/models", () => ({
    Message: {
        findById: jest.fn(),
        create: jest.fn(),
    },
    Reply: {
        create: jest.fn(),
        find: jest.fn(),
    },
}));

const db = require("../src/models");
const replyController = require("../src/controllers/replyController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("replyController.create", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le message parent n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { id: "p1" }, user: { id: "u1" }, body: { content: "ma réponse" } };
        const res = mockRes();
        await replyController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Message.create).not.toHaveBeenCalled();
        expect(db.Reply.create).not.toHaveBeenCalled();
    });

    test("refuse (400) si le contenu est vide", async () => {
        db.Message.findById.mockResolvedValue({ _id: "p1" });
        const req = { params: { id: "p1" }, user: { id: "u1" }, body: { content: "" } };
        const res = mockRes();
        await replyController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(db.Message.create).not.toHaveBeenCalled();
    });

    test("refuse (400) si le contenu dépasse 280 caractères", async () => {
        db.Message.findById.mockResolvedValue({ _id: "p1" });
        const req = { params: { id: "p1" }, user: { id: "u1" }, body: { content: "a".repeat(281) } };
        const res = mockRes();
        await replyController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("crée la réponse (201) : un Message puis un Reply liant le parent", async () => {
        db.Message.findById.mockResolvedValue({ _id: "p1" });
        db.Message.create.mockResolvedValue({ _id: "m_new", content: "ma réponse", author: "u1" });
        db.Reply.create.mockResolvedValue({ _id: "r1", message: "p1", reply: "m_new" });

        const req = { params: { id: "p1" }, user: { id: "u1" }, body: { content: "ma réponse" } };
        const res = mockRes();
        await replyController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);

        const msgArg = db.Message.create.mock.calls[0][0];
        expect(msgArg.content).toBe("ma réponse");
        expect(msgArg.author).toBe("u1");

        const replyArg = db.Reply.create.mock.calls[0][0];
        expect(replyArg.message).toBe("p1");
        expect(replyArg.reply).toBe("m_new");
    });
});

describe("replyController.getByMessage", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) les messages-réponses déballés (option B)", async () => {

        const fakeReplies = [
            { _id: "r1", message: "p1", reply: { _id: "m1", content: "réponse 1", author: { username: "bob" } } },
            { _id: "r2", message: "p1", reply: { _id: "m2", content: "réponse 2", author: { username: "alice" } } },
        ];
        db.Reply.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeReplies),
        });

        const req = { params: { id: "p1" } };
        const res = mockRes();
        await replyController.getByMessage(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const findArg = db.Reply.find.mock.calls[0][0];
        expect(findArg.message).toBe("p1");

        const payload = res.json.mock.calls[0][0];
        expect(payload).toHaveLength(2);
        expect(payload[0].content).toBe("réponse 1");   // a message, not a link
        expect(payload[0]._id).toBe("m1");
        expect(payload[1].content).toBe("réponse 2");
    });

    test("retourne (200) un tableau vide si aucune réponse", async () => {
        db.Reply.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
        });
        const req = { params: { id: "p1" } };
        const res = mockRes();
        await replyController.getByMessage(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });
});