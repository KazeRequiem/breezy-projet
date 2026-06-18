const checkRole = require("../src/middlewares/checkRole");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("middleware checkRole", () => {
    test("bloque (403) si le rôle de l'utilisateur n'est pas autorisé", () => {
        const req = { user: { id: "u1", role: "user" } };
        const res = mockRes();
        const next = jest.fn();

        checkRole(["moderator", "admin"])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test("bloque (401) si aucun utilisateur n'est attaché à la requête", () => {
        const req = {};
        const res = mockRes();
        const next = jest.fn();

        checkRole(["user"])(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("laisse passer un user simple si user est dans les rôles autorisés", () => {
        const req = { user: { id: "u2", role: "user" } };
        const res = mockRes();
        const next = jest.fn();

        checkRole(["user", "moderator", "admin"])(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});