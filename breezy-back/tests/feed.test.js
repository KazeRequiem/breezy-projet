jest.mock("../src/models", () => ({
    Message: { find: jest.fn() },
    Follow: { find: jest.fn() },
    Reply: {
        distinct: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue([]),
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

// chain find().sort().limit().populate() mocked
function mockChain(result) {
    const withToObject = result.map((m) => ({ ...m, toObject: () => m }));
    const populate = jest.fn().mockResolvedValue(withToObject);
    const limit = jest.fn().mockReturnValue({ populate });
    const sort = jest.fn().mockReturnValue({ limit });
    db.Message.find.mockReturnValue({ sort });
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
        const fake = [{ _id: "m1", content: "post de u2" }];
        const chain = mockChain(fake);

        const req = { query: {}, user: { id: "u1" } };
        const res = mockRes();
        await messageController.feed(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ _id: "m1", content: "post de u2", replies_count: 0 }]);

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