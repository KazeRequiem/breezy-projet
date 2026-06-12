jest.mock("../models", () => ({
    Follow: {
        create: jest.fn(),
        findOne: jest.fn(),
        destroy: jest.fn(),
    },
}));

const db = require("../models");
const followController = require("../controllers/followController"); 

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return (res);
}

describe("followController.follow", () => {
    beforeEach(() => jest.clearAllMocks());

    test("Refus de se suivre soit même", async () => {
        const req = { params: { id_user_follow: "1" }, user: { id_user: 1 } };
        const res = mockRes();
        await followController.follow(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(db.Follow.create).not.toHaveBeenCalled();
    });

    test("Refus si on suit déjà cette personne", async () => {
        db.Follow.findOne.mockResolvedValue({ id_user: 1, id_user_follow: 2 });
        const req = { params: { id_user_follow: "2" }, user: { id_user: 1 } };
        const res = mockRes();
        await followController.follow(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(db.Follow.create).not.toHaveBeenCalled();
    });

    test("Crée le suivi avec l'id du token comme follower", async () => {
        db.Follow.findOne.mockResolvedValue(null);
        db.Follow.create.mockImplementation(async (data) => data);

        const req = { params: { id_user_follow: "2" }, user: { id_user: 1 } };
        const res = mockRes();
        await followController.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        const createArg = db.Follow.create.mock.calls[0][0];
        expect(createArg.id_user).toBe(1); //Follower = token
        expect(createArg.id_user_follow).toBe("2"); // Target = URL
    });
});

describe("followController.unfollow", () => {
    beforeEach(() => jest.clearAllMocks());

    test("Supprime le suivi existant", async () => {
        db.Follow.destroy.mockResolvedValue(1);
        const req = { params: { id_user_follow: "2" }, user: { id_user: 1 } };
        const res = mockRes();
        await followController.unfollow(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("renvoie 404 si le suivi n'existait pas", async () => {
        db.Follow.destroy.mockResolvedValue(0);
        const req = { params: { id_user_follow: "2" }, user: { id_user: 1 } };
        const res = mockRes();
        await followController.unfollow(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});