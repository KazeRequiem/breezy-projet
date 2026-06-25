jest.mock("../src/models", () => ({
    Message: { find: jest.fn() },
    Follow: { find: jest.fn() },
    Reply: { distinct: jest.fn(), aggregate: jest.fn() },
}));

const db = require("../src/models");
const messageController = require("../src/controllers/messageController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}
function asDocs(arr) {
    return arr.map((o) => ({ ...o, toObject: () => o }));
}
function mockChain(result) {
    const populate = jest.fn().mockResolvedValue(asDocs(result));
    const limit = jest.fn().mockReturnValue({ populate });
    const sort = jest.fn().mockReturnValue({ limit });
    db.Message.find.mockReturnValue({ sort });
    db.Reply.distinct.mockResolvedValue([]);
    db.Reply.aggregate.mockResolvedValue([]);
    return { sort, limit, populate };
}

describe("messageController.feed", () => {
    beforeEach(() => jest.clearAllMocks());

    test("court-circuite (200 + []) si l'user ne suit personne", async () => {
        db.Follow.find.mockResolvedValue([]);

        const req = { query: {}, user: { id: "u1" } };
        const res = mockRes();
        await messageController.feed(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
        expect(db.Message.find).not.toHaveBeenCalled();
    });

    test("filtre les messages sur les ids des gens suivis ($in)", async () => {
        db.Follow.find.mockResolvedValue([
            { follower: "u1", following: "u2" },
            { follower: "u1", following: "u3" },
        ]);
        const chain = mockChain([{ _id: "m1", content: "post de u2" }]);

        const req = { query: {}, user: { id: "u1" } };
        const res = mockRes();
        await messageController.feed(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload[0].content).toBe("post de u2");
        expect(payload[0].replies_count).toBe(0);

        const followArg = db.Follow.find.mock.calls[0][0];
        expect(followArg.follower).toBe("u1");

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.author.$in).toEqual(["u2", "u3"]);

        expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(chain.limit).toHaveBeenCalledWith(20);
    });

    test("applique le curseur before (createdAt $lt)", async () => {
        db.Follow.find.mockResolvedValue([{ follower: "u1", following: "u2" }]);
        mockChain([]);
        const before = "2026-06-01T10:00:00.000Z";

        const req = { query: { before }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.feed(req, res);

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.createdAt.$lt).toEqual(new Date(before));
        expect(findArg.author.$in).toEqual(["u2"]);
    });

    test("plafonne le limit à 20", async () => {
        db.Follow.find.mockResolvedValue([{ follower: "u1", following: "u2" }]);
        const chain = mockChain([]);

        const req = { query: { limit: "100" }, user: { id: "u1" } };
        const res = mockRes();
        await messageController.feed(req, res);

        expect(chain.limit).toHaveBeenCalledWith(20);
    });
});