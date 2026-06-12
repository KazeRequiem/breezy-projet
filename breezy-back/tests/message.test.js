jest.mock("../models", () => ({
    Message: {
        create: jest.fn(),
        findAll: jest.fn(),
    },
}));

const db = require("../models");
const messageController = require("../controllers/messageController.js");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("messageController.create", () => {
    beforeEach(() => jest.clearAllMocks());

    test("refuse si le contenu est vide", async () => {
        const req = { body: { content: "" }, user: { id_user: 1 } };
        const res = mockRes();
        await messageController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("refuse si le contenu dépasse 280 caractères", async () => {
        const req = { body: { content: "a".repeat(281) }, user: { id_user: 1 } };
        const res = mockRes();
        await messageController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("crée un message en utilisant l'id_user du token, pas du body", async () => {
        db.Message.create.mockImplementation(async (data) => ({ id_message: 1, ...data }));

        const req = {
            body: { content: "Mon premier post", id_user: 999 },//try to usurpate a fake user
            user: { id_user: 1 },//true user there
        };
        const res = mockRes();
        await messageController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        const createArg = db.Message.create.mock.calls[0][0];
        expect(createArg.id_user).toBe(1); //From the token
        expect(createArg.id_user).not.toBe(999);//not from the body
        expect(createArg.content).toBe("Mon premier post");
    });

    test("accepte un contenu de 280 caractères pile", async () => {
        db.Message.create.mockImplementation(async (data) => ({ id_message: 1, ...data }));
        const req = { body: { content: "a".repeat(280) }, user: { id_user: 1 } };
        const res = mockRes();
        await messageController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});