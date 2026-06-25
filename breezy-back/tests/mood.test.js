const { MOODS, DEFAULT_MOOD, sanitizeMood } = require("../src/utils/moods");

describe("sanitizeMood (validation permissive)", () => {
    test("garde une valeur de mood connue", () => {
        expect(sanitizeMood("sunny")).toBe("sunny");
        expect(sanitizeMood("stormy")).toBe("stormy");
    });

    test("retombe sur le défaut si la valeur est inconnue", () => {
        expect(sanitizeMood("banane")).toBe(DEFAULT_MOOD);
    });

    test("retombe sur le défaut si absent (undefined / null / vide)", () => {
        expect(sanitizeMood(undefined)).toBe(DEFAULT_MOOD);
        expect(sanitizeMood(null)).toBe(DEFAULT_MOOD);
        expect(sanitizeMood("")).toBe(DEFAULT_MOOD);
    });

    test("le défaut fait bien partie de la liste normée", () => {
        expect(MOODS).toContain(DEFAULT_MOOD);
    });
});