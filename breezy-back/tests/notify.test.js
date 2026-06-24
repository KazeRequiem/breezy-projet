jest.mock("../src/models", () => ({
    Notification: { create: jest.fn() },
}));

const db = require("../src/models");
const notify = require("../src/utils/notify");

describe("notify (helper)", () => {
    beforeEach(() => jest.clearAllMocks());

    test("crée une notification avec les bons champs", async () => {
        db.Notification.create.mockResolvedValue({ _id: "n1" });
        await notify({ recipient: "u2", sender: "u1", type: "like", message: "m1" });

        expect(db.Notification.create).toHaveBeenCalledTimes(1);
        const arg = db.Notification.create.mock.calls[0][0];
        expect(arg.recipient).toBe("u2");
        expect(arg.sender).toBe("u1");
        expect(arg.type).toBe("like");
        expect(arg.message).toBe("m1");
    });

    test("ne se notifie pas soi-même (recipient === sender)", async () => {
        await notify({ recipient: "u1", sender: "u1", type: "like", message: "m1" });
        expect(db.Notification.create).not.toHaveBeenCalled();
    });

    test("n'échoue jamais si la création plante (isolation des erreurs)", async () => {
        db.Notification.create.mockRejectedValue(new Error("DB down"));
        // must not throw
        await expect(
            notify({ recipient: "u2", sender: "u1", type: "follow" })
        ).resolves.toBeUndefined();
    });

    test("gère l'absence de message (ex: follow) sans planter", async () => {
        db.Notification.create.mockResolvedValue({ _id: "n2" });
        await notify({ recipient: "u2", sender: "u1", type: "follow" });
        const arg = db.Notification.create.mock.calls[0][0];
        expect(arg.type).toBe("follow");
        expect(arg.recipient).toBe("u2");
    });
});