const MOODS = [
    "sunny",       // ☀️  sincère / positif
    "joking",      // 🌤️  blague / léger
    "teasing",     // 🌬️  taquin / chambrage
    "sarcastic",   // 🌩️  sarcastique / ironique
    "serious",     // 🌫️  sérieux / posé
    "rainy",       // 🌧️  triste
    "stormy",      // ⛈️  énervé / coup de gueule
    "rhetorical",  // 🌪️  question rhétorique
    "genuine_q",   // 🌈  vraie question
    "cloudy",      // 🌥️  défaut : ton non précisé
];

const DEFAULT_MOOD = "cloudy";

module.exports = { MOODS, DEFAULT_MOOD };

function sanitizeMood(value) {
    return MOODS.includes(value) ? value : DEFAULT_MOOD;
}

module.exports.sanitizeMood = sanitizeMood;