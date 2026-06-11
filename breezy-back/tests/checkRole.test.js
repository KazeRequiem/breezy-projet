const checkRole = require("../middlewares/checkRole");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("middleware checkRole", () => {
    test("bloque (403) si le rôle de l'utilisateur n'est pas autorisé", () => {
        const req = { user: { id_user: 1, role: "user" } }
        const res = mockRes();
        const next = jest.fn();

        checkRole(["moderator", "admin",])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test("bloque (401) si aucun utilisateur n'est attaché à la requête", () => {
        const req = {}; //Empty if verifyToken didn't run
        const res = mockRes();
        const next = jest.fn();

        checkRole(["user"])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("laisse passer un user simple si user est dans les rôles autorisées", () => {
        const req = { user: { id_user: 2, role: "user" } };
        const res = mockRes();
        const next = jest.fn();

        checkRole(["user", "moderator", "admin"])(req, res, next);

        expect(next).toHaveBeenCalled();
    });
})