jest.mock("../src/models", () => ({
    Report: {
        findOne: jest.fn(),
        create: jest.fn(),
        deleteOne: jest.fn(),
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

    test("refuse (404) si le message à signaler n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.report(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Report.create).not.toHaveBeenCalled();
    });

    test("refuse (409) si l'user a déjà signalé ce message", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1" });
        db.Report.findOne.mockResolvedValue({ _id: "r1" });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.report(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(db.Report.create).not.toHaveBeenCalled();
    });

    test("crée le signalement (201) avec le user du token", async () => {
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

    test("retourne (200) les signalements groupés par message avec compteur", async () => {
        const aggregated = [
            { _id: "m1", reportsCount: 3, message: { content: "spam", author: "u9" } },
            { _id: "m2", reportsCount: 1, message: { content: "insulte", author: "u8" } },
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
        db.Report.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.dismiss(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("renvoie (404) si aucun signalement à traiter", async () => {
        db.Report.deleteOne.mockResolvedValue({ deletedCount: 0 });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await reportController.dismiss(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});