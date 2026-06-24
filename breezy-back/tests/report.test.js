jest.mock("../src/models", () => ({
    Report: {
        findOne: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
        aggregate: jest.fn(),
    },
    Message: {
        findById: jest.fn(),
    },
}));

const db = require("../src/models");
const reportController = require("../src/controllers/reportController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("reportController.report", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le message a signaler n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.report(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Report.create).not.toHaveBeenCalled();
    });

    test("refuse (409) si l'user a deja signale ce message", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1" });
        db.Report.findOne.mockResolvedValue({ _id: "r1" });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.report(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(db.Report.create).not.toHaveBeenCalled();
    });

    test("cree le signalement (201) avec le user du token", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1" });
        db.Report.findOne.mockResolvedValue(null);
        db.Report.create.mockImplementation(async (data) => ({ _id: "r1", ...data }));
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.report(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        const createArg = db.Report.create.mock.calls[0][0];
        expect(createArg.user).toBe("u1");
        expect(createArg.message).toBe("m1");
    });
});

describe("reportController.getReports", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) les signalements groupes par message avec compteur", async () => {
        const aggregated = [
            { _id: "m1", reportsCount: 3, message: { content: "spam" }, author: { username: "bob" } },
            { _id: "m2", reportsCount: 1, message: { content: "insulte" }, author: { username: "alice" } },
        ];
        db.Report.aggregate.mockResolvedValue(aggregated);
        const req = {};
        const res = mockRes();
        await reportController.getReports(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(aggregated);
        expect(db.Report.aggregate).toHaveBeenCalled();
    });

    test("retourne (200) un tableau vide s'il n'y a aucun signalement", async () => {
        db.Report.aggregate.mockResolvedValue([]);
        const req = {};
        const res = mockRes();
        await reportController.getReports(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });
});

describe("reportController.dismiss", () => {
    beforeEach(() => jest.clearAllMocks());

    test("supprime tous les signalements d'un message (200)", async () => {
        db.Report.deleteMany.mockResolvedValue({ deletedCount: 3 });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.dismiss(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        // on supprime bien par message
        const deleteArg = db.Report.deleteMany.mock.calls[0][0];
        expect(deleteArg.message).toBe("m1");
    });

    test("renvoie (404) si aucun signalement a traiter", async () => {
        db.Report.deleteMany.mockResolvedValue({ deletedCount: 0 });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.dismiss(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});