jest.mock("../src/models", () => ({
    Message: { find: jest.fn() },
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

describe("messageController.search", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) un tableau vide si aucun tag fourni", async () => {
        const req = { query: {} };
        const res = mockRes();
        await messageController.search(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
        expect(db.Message.find).not.toHaveBeenCalled();
    });

    test("retourne (200) un tableau vide si tags ne contient que du vide", async () => {
        const req = { query: { tags: " , ,  " } };
        const res = mockRes();
        await messageController.search(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
        expect(db.Message.find).not.toHaveBeenCalled();
    });

    test("normalise les tags cherchés et filtre avec $in (OU)", async () => {
        mockChain([{ _id: "m1", content: "post dofus" }]);

        const req = { query: { tags: "Dofus, MMO" } };
        const res = mockRes();
        await messageController.search(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload[0].content).toBe("post dofus");
        expect(payload[0].replies_count).toBe(0);

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.tags.$in).toEqual(["dofus", "mmo"]);
    });

    test("déduplique les tags cherchés", async () => {
        mockChain([]);
        const req = { query: { tags: "Dofus,dofus,DOFUS" } };
        const res = mockRes();
        await messageController.search(req, res);

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.tags.$in).toEqual(["dofus"]);
    });

    test("applique la pagination (limit 20 + tri récent) via le helper", async () => {
        const chain = mockChain([]);
        const req = { query: { tags: "dofus" } };
        const res = mockRes();
        await messageController.search(req, res);

        expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(chain.limit).toHaveBeenCalledWith(20);
    });

    test("respecte le curseur before", async () => {
        mockChain([]);
        const before = "2026-06-01T10:00:00.000Z";
        const req = { query: { tags: "dofus", before } };
        const res = mockRes();
        await messageController.search(req, res);

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.createdAt.$lt).toEqual(new Date(before));
        expect(findArg.tags.$in).toEqual(["dofus"]);
    });
});