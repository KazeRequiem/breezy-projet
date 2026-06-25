jest.mock("../src/models", () => ({
    Follow: {
        findOne: jest.fn(),
        create: jest.fn(),
        deleteOne: jest.fn(),
        find: jest.fn(),
    },
}));

jest.mock("../src/utils/notify");

const db = require("../src/models");
const followController = require("../src/controllers/followController");
const notify = require("../src/utils/notify");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("followController.follow", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (400) si l'utilisateur essaie de se suivre lui-même", async () => {
        const req = { params: { id: "u1" }, user: { id: "u1" } };
        const res = mockRes();

        await followController.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(db.Follow.create).not.toHaveBeenCalled();
    });

    test("refuse (409) si le follow existe déjà", async () => {
        db.Follow.findOne.mockResolvedValue({ _id: "f1" });
        const req = { params: { id: "u2" }, user: { id: "u1" } };
        const res = mockRes();

        await followController.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(db.Follow.create).not.toHaveBeenCalled();
    });

    test("crée le follow (201) avec le follower issu du token", async () => {
        db.Follow.findOne.mockResolvedValue(null);
        db.Follow.create.mockImplementation(async (data) => ({ _id: "f1", ...data }));

        const req = {
            params: { id: "u2" },
            user: { id: "u1" },
        };
        const res = mockRes();

        await followController.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        const createArg = db.Follow.create.mock.calls[0][0];
        expect(createArg.follower).toBe("u1");   // from token
        expect(createArg.following).toBe("u2");  // from URL
    });

    test("notifie la personne suivie (type follow)", async () => {
        db.Follow.findOne.mockResolvedValue(null);
        db.Follow.create.mockImplementation(async (data) => ({ _id: "f1", ...data }));

        const req = { params: { id: "u2" }, user: { id: "u1" } };
        const res = mockRes();

        await followController.follow(req, res);

        expect(notify).toHaveBeenCalledTimes(1);
        const notifyArg = notify.mock.calls[0][0];
        expect(notifyArg.recipient).toBe("u2");   // la personne suivie
        expect(notifyArg.sender).toBe("u1");      // celui qui suit
        expect(notifyArg.type).toBe("follow");
    });

    test("ne notifie pas si le follow échoue en amont (déjà suivi)", async () => {
        db.Follow.findOne.mockResolvedValue({ _id: "f1" }); // déjà suivi -> 409

        const req = { params: { id: "u2" }, user: { id: "u1" } };
        const res = mockRes();

        await followController.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(notify).not.toHaveBeenCalled();
    });
});

describe("followController.unfollow", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si la relation de follow n'existe pas", async () => {
        db.Follow.deleteOne.mockResolvedValue({ deletedCount: 0 });
        const req = { params: { id: "u2" }, user: { id: "u1" } };
        const res = mockRes();

        await followController.unfollow(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test("supprime le follow (200) s'il existe", async () => {
        db.Follow.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { id: "u2" }, user: { id: "u1" } };
        const res = mockRes();

        await followController.unfollow(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const deleteArg = db.Follow.deleteOne.mock.calls[0][0];
        expect(deleteArg.follower).toBe("u1");
        expect(deleteArg.following).toBe("u2");
    });
});

describe("followController.getFollowers", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) la liste de ceux qui suivent l'utilisateur", async () => {
        const fake = [{ _id: "f1", follower: "u3", following: "u2" }];
        db.Follow.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(fake),
        });

        const req = { params: { id: "u2" } };
        const res = mockRes();

        await followController.getFollowers(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fake);
        const findArg = db.Follow.find.mock.calls[0][0];
        expect(findArg.following).toBe("u2");
    });
});

describe("followController.getFollowing", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) la liste de ceux que l'utilisateur suit", async () => {
        const fake = [{ _id: "f1", follower: "u2", following: "u5" }];
        db.Follow.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(fake),
        });

        const req = { params: { id: "u2" } };
        const res = mockRes();

        await followController.getFollowing(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fake);
        const findArg = db.Follow.find.mock.calls[0][0];
        expect(findArg.follower).toBe("u2");
    });
});