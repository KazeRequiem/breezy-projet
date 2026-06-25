jest.mock("../src/models", () => ({
    User: { find: jest.fn() },
}));
jest.mock("../src/utils/notify");

const db = require("../src/models");
const notify = require("../src/utils/notify");
const notifyMentions = require("../src/utils/notifyMentions");

describe("notifyMentions (helper)", () => {
    beforeEach(() => jest.clearAllMocks());

    test("extrait les @username, les résout et notifie chacun (type mention)", async () => {
        db.User.find.mockResolvedValue([
            { _id: "u2", username: "alice" },
            { _id: "u3", username: "bob" },
        ]);

        await notifyMentions("coucou @alice et @bob ça va ?", "u1", "m1");

        const findArg = db.User.find.mock.calls[0][0];
        expect(findArg.username.$in.sort()).toEqual(["alice", "bob"]);

        expect(notify).toHaveBeenCalledTimes(2);
        const recipients = notify.mock.calls.map((c) => c[0].recipient).sort();
        expect(recipients).toEqual(["u2", "u3"]);
        notify.mock.calls.forEach((c) => {
            expect(c[0].sender).toBe("u1");
            expect(c[0].type).toBe("mention");
            expect(c[0].message).toBe("m1");
        });
    });

    test("déduplique un même pseudo cité plusieurs fois", async () => {
        db.User.find.mockResolvedValue([{ _id: "u2", username: "alice" }]);

        await notifyMentions("@alice salut @alice encore @alice", "u1", "m1");

        const findArg = db.User.find.mock.calls[0][0];
        expect(findArg.username.$in).toEqual(["alice"]);
        expect(notify).toHaveBeenCalledTimes(1);
    });

    test("ignore les pseudos qui ne correspondent à aucun user", async () => {
        db.User.find.mockResolvedValue([{ _id: "u2", username: "alice" }]);

        await notifyMentions("@alice et @fantome", "u1", "m1");

        expect(notify).toHaveBeenCalledTimes(1);
        expect(notify.mock.calls[0][0].recipient).toBe("u2");
    });

    test("ne fait rien (pas de requête, pas de notif) si aucune mention", async () => {
        await notifyMentions("un message sans mention", "u1", "m1");
        expect(db.User.find).not.toHaveBeenCalled();
        expect(notify).not.toHaveBeenCalled();
    });

    test("n'échoue jamais si la résolution plante (isolation des erreurs)", async () => {
        db.User.find.mockRejectedValue(new Error("DB down"));
        await expect(
            notifyMentions("@alice", "u1", "m1")
        ).resolves.toBeUndefined();
    });
});