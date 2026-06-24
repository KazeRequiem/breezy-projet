jest.mock("../src/models", () => ({
    Notification: {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        updateMany: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

const db = require("../src/models");
const notificationController = require("../src/controllers/notificationController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}
// chain find().sort().populate() mocked
function mockFindChain(result) {
    const populate = jest.fn().mockResolvedValue(result);
    const sort = jest.fn().mockReturnValue({ populate });
    db.Notification.find.mockReturnValue({ sort });
    return { sort, populate };
}

describe("notificationController.getMine", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) mes notifs, plus récentes d'abord", async () => {
        const fake = [{ _id: "n1", type: "like" }];
        const chain = mockFindChain(fake);

        const req = { user: { id: "u1" }, query: {} };
        const res = mockRes();
        await notificationController.getMine(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fake);
        const findArg = db.Notification.find.mock.calls[0][0];
        expect(findArg.recipient).toBe("u1");
        expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
});

describe("notificationController.markAsRead", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si la notif n'existe pas", async () => {
        db.Notification.findById.mockResolvedValue(null);
        const req = { params: { id: "n1" }, user: { id: "u1" } };
        const res = mockRes();
        await notificationController.markAsRead(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Notification.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("refuse (403) si la notif n'est pas la mienne", async () => {
        db.Notification.findById.mockResolvedValue({ _id: "n1", recipient: { toString: () => "u2" } });
        const req = { params: { id: "n1" }, user: { id: "u1" } };
        const res = mockRes();
        await notificationController.markAsRead(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(db.Notification.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("marque (200) la notif comme lue si elle est la mienne", async () => {
        db.Notification.findById.mockResolvedValue({ _id: "n1", recipient: { toString: () => "u1" } });
        db.Notification.findByIdAndUpdate.mockResolvedValue({ _id: "n1", read: true });
        const req = { params: { id: "n1" }, user: { id: "u1" } };
        const res = mockRes();
        await notificationController.markAsRead(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        const args = db.Notification.findByIdAndUpdate.mock.calls[0];
        expect(args[0]).toBe("n1");
        expect(args[1]).toEqual({ read: true });
    });
});

describe("notificationController.markAllAsRead", () => {
    beforeEach(() => jest.clearAllMocks());

    test("marque toutes mes notifs comme lues (200)", async () => {
        db.Notification.updateMany.mockResolvedValue({ modifiedCount: 5 });
        const req = { user: { id: "u1" } };
        const res = mockRes();
        await notificationController.markAllAsRead(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        const filterArg = db.Notification.updateMany.mock.calls[0][0];
        expect(filterArg.recipient).toBe("u1");
        const updateArg = db.Notification.updateMany.mock.calls[0][1];
        expect(updateArg).toEqual({ read: true });
    });
});