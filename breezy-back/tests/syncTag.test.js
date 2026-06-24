jest.mock("../src/models", () => ({
    Tag: {
        updateOne: jest.fn(),
    },
}));

const db = require("../src/models");
const { syncTags } = require("../src/utils/syncTags");

describe("syncTags", () => {
    beforeEach(() => jest.clearAllMocks());

    test("retourne les tags normalisés (trim + lowercase + dédup)", async () => {
        db.Tag.updateOne.mockResolvedValue({});
        const result = await syncTags(["Dofus", " MMO ", "dofus"]);
        expect(result).toEqual(["dofus", "mmo"]);
    });

    test("fait un upsert par tag normalisé unique", async () => {
        db.Tag.updateOne.mockResolvedValue({});
        await syncTags(["Dofus", "MMO"]);

        expect(db.Tag.updateOne).toHaveBeenCalledTimes(2);
        const [filter, update, options] = db.Tag.updateOne.mock.calls[0];
        expect(filter).toEqual({ name: "dofus" });
        expect(update).toEqual({ $setOnInsert: { name: "dofus" } });
        expect(options).toEqual({ upsert: true });
    });

    test("ne fait aucun upsert si la liste est vide", async () => {
        const result = await syncTags([]);
        expect(result).toEqual([]);
        expect(db.Tag.updateOne).not.toHaveBeenCalled();
    });

    test("renvoie [] et n'upsert rien si l'entrée n'est pas un tableau", async () => {
        const result = await syncTags(undefined);
        expect(result).toEqual([]);
        expect(db.Tag.updateOne).not.toHaveBeenCalled();
    });

    test("NE THROW JAMAIS et retourne quand meme les tags si l'upsert echoue", async () => {
        db.Tag.updateOne.mockRejectedValue(new Error("DB down"));
        let result;
        await expect((async () => {
            result = await syncTags(["Dofus", "MMO"]);
        })()).resolves.not.toThrow();
        expect(result).toEqual(["dofus", "mmo"]);
    });
});