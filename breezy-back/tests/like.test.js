jest.mock("../src/models", () => ({
    Like: {
        findOne: jest.fn(),
        create: jest.fn(),
        deleteOne: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
    Message: {
        findById: jest.fn(),
    },
}));

const db = require("../src/models");
const likeController = require("../src/controllers/likeController");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("likeController.like", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le message à liker n'existe pas", async () => {
        db.Message.findById.mockResolvedValue(null);
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();

        await likeController.like(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(db.Like.create).not.toHaveBeenCalled();
    });

    test("refuse (409) si le like existe déjà", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1" });
        db.Like.findOne.mockResolvedValue({ _id: "l1" });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();

        await likeController.like(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(db.Like.create).not.toHaveBeenCalled();
    });

    test("crée le like (201) avec le user issu du token", async () => {
        db.Message.findById.mockResolvedValue({ _id: "m1" });
        db.Like.findOne.mockResolvedValue(null);
        db.Like.create.mockImplementation(async (data) => ({ _id: "l1", ...data }));

        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();

        await likeController.like(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        const createArg = db.Like.create.mock.calls[0][0];
        expect(createArg.user).toBe("u1");      // vient du token
        expect(createArg.message).toBe("m1");   // vient de l'URL
    });
});

describe("likeController.unlike", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse (404) si le like n'existe pas", async () => {
        db.Like.deleteOne.mockResolvedValue({ deletedCount: 0 });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();

        await likeController.unlike(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test("supprime le like (200) s'il existe", async () => {
        db.Like.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();

        await likeController.unlike(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const deleteArg = db.Like.deleteOne.mock.calls[0][0];
        expect(deleteArg.user).toBe("u1");
        expect(deleteArg.message).toBe("m1");
    });
});

describe("likeController.getByMessage", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) la liste des likes d'un message", async () => {
        const fake = [{ _id: "l1", user: "u3", message: "m1" }];
        db.Like.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(fake),
        });

        const req = { params: { messageId: "m1" } };
        const res = mockRes();

        await likeController.getByMessage(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fake);
        const findArg = db.Like.find.mock.calls[0][0];
        expect(findArg.message).toBe("m1");
    });
});

describe("likeController.getStatus", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne (200) likesCount et likedByMe=true si l'user a liké", async () => {
        db.Like.countDocuments.mockResolvedValue(42);
        db.Like.findOne.mockResolvedValue({ _id: "l1" }); // mon like existe

        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await likeController.getStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload.likesCount).toBe(42);
        expect(payload.likedByMe).toBe(true);
    });

    test("retourne (200) likedByMe=false si l'user n'a pas liké", async () => {
        db.Like.countDocuments.mockResolvedValue(7);
        db.Like.findOne.mockResolvedValue(null); // pas de like de ma part

        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await likeController.getStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.json.mock.calls[0][0];
        expect(payload.likesCount).toBe(7);
        expect(payload.likedByMe).toBe(false);
    });

    test("likedByMe est un booléen strict, jamais l'objet like", async () => {
        db.Like.countDocuments.mockResolvedValue(1);
        db.Like.findOne.mockResolvedValue({ _id: "l1", user: "u1", message: "m1" });

        const req = { params: { messageId: "m1" }, user: { id: "u1" } };
        const res = mockRes();
        await likeController.getStatus(req, res);

        const payload = res.json.mock.calls[0][0];
        expect(payload.likedByMe).toBe(true);          // pas l'objet
        expect(typeof payload.likedByMe).toBe("boolean");
    });
});