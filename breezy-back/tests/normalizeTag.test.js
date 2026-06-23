const { normalizeTag, normalizeTags } = require("../src/utils/normalizeTag");

describe("normalizeTag", () => {
    test("met en minuscules", () => {
        expect(normalizeTag("Dofus")).toBe("dofus");
        expect(normalizeTag("MMO")).toBe("mmo");
    });

    test("enlève les espaces autour (trim)", () => {
        expect(normalizeTag("  dofus  ")).toBe("dofus");
        expect(normalizeTag(" WoW ")).toBe("wow");
    });

    test("combine trim + lowercase", () => {
        expect(normalizeTag("  Forgelance  ")).toBe("forgelance");
    });
});

describe("normalizeTags (tableau)", () => {
    test("normalise chaque tag du tableau", () => {
        expect(normalizeTags(["Dofus", " MMO ", "WoW"])).toEqual(["dofus", "mmo", "wow"]);
    });

    test("supprime les doublons après normalisation", () => {
        // "Dofus" et "dofus" deviennent le même tag
        expect(normalizeTags(["Dofus", "dofus", "DOFUS"])).toEqual(["dofus"]);
    });

    test("supprime les tags vides", () => {
        expect(normalizeTags(["dofus", "", "   ", "mmo"])).toEqual(["dofus", "mmo"]);
    });

    test("renvoie un tableau vide si l'entrée n'est pas un tableau", () => {
        expect(normalizeTags(undefined)).toEqual([]);
        expect(normalizeTags("pas un tableau")).toEqual([]);
        expect(normalizeTags(null)).toEqual([]);
    });
});