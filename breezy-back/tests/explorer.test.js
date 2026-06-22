jest.mock("../src/models", () => ({
    Message: {
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

// Helper : build a chain find().sort().limit().populate() mocked
// which resolve into `result`. Also return spy in order to check args.
function mockChain(result) {
    const populate = jest.fn().mockResolvedValue(result);
    const limit = jest.fn().mockReturnValue({ populate });
    const sort = jest.fn().mockReturnValue({ limit });
    db.Message.find.mockReturnValue({ sort });
    return { sort, limit, populate };
}

describe("messageController.explore", () => {
    beforeEach(() => jest.clearAllMocks());

    test("sans before : renvoie les messages récents, limit 20 par défaut", async () => {
        const fake = [{ _id: "m1", content: "récent" }];
        const chain = mockChain(fake);

        const req = { query: {} };
        const res = mockRes();
        await messageController.explore(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fake);

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.createdAt).toBeUndefined();

        expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(chain.limit).toHaveBeenCalledWith(20);
    });

    test("avec before valide : ajoute le filtre createdAt $lt", async () => {
        const chain = mockChain([]);
        const before = "2026-06-01T10:00:00.000Z";

        const req = { query: { before } };
        const res = mockRes();
        await messageController.explore(req, res);

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.createdAt).toBeDefined();
        expect(findArg.createdAt.$lt).toEqual(new Date(before));
    });

    test("avec before invalide : ignoré, pas de filtre createdAt", async () => {
        mockChain([]);

        const req = { query: { before: "pas-une-date" } };
        const res = mockRes();
        await messageController.explore(req, res);

        const findArg = db.Message.find.mock.calls[0][0];
        expect(findArg.createdAt).toBeUndefined();
    });

    test("respecte un limit fourni mais le plafonne à 20 max", async () => {
        const chain = mockChain([]);

        const req = { query: { limit: "100" } };
        const res = mockRes();
        await messageController.explore(req, res);

        expect(chain.limit).toHaveBeenCalledWith(20);
    });

    test("renvoie un tableau vide (200) quand plus rien à charger", async () => {
        mockChain([]);

        const req = { query: { before: "2020-01-01T00:00:00.000Z" } };
        const res = mockRes();
        await messageController.explore(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });
});