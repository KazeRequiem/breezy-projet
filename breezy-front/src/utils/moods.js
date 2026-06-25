// Les 10 moods (thème météo, alignés sur le backend utils/moods.js)
export const MOODS = [
    { id: 'sunny',      emoji: '☀️',  label: 'Sincère',        phrase: 'partage avec sincérité',        desc: 'Ton positif et sincère.' },
    { id: 'joking',     emoji: '🌤️', label: 'Blague',          phrase: 'plaisante',                     desc: 'C\'est une blague, à prendre à la légère.' },
    { id: 'teasing',    emoji: '🌬️', label: 'Taquin',          phrase: 'taquine gentiment',             desc: 'Petit chambrage amical, sans méchanceté.' },
    { id: 'sarcastic',  emoji: '🌩️', label: 'Sarcastique',     phrase: 'est sarcastique',               desc: 'Ironie / sarcasme : à ne pas prendre au premier degré.' },
    { id: 'serious',    emoji: '🌫️', label: 'Sérieux',         phrase: 'est sérieux',                   desc: 'Message posé et sérieux.' },
    { id: 'rainy',      emoji: '🌧️', label: 'Triste',          phrase: 'est triste',                    desc: 'Humeur triste ou mélancolique.' },
    { id: 'stormy',     emoji: '⛈️', label: 'Énervé',          phrase: 'pousse un coup de gueule',      desc: 'Colère, coup de gueule.' },
    { id: 'rhetorical', emoji: '🌪️', label: 'Rhétorique',      phrase: 'pose une question rhétorique',  desc: 'Question rhétorique : pas vraiment de réponse attendue.' },
    { id: 'genuine_q',  emoji: '🌈',  label: 'Vraie question',  phrase: 'pose une vraie question',       desc: 'Vraie question : une réponse est attendue.' },
    { id: 'cloudy',     emoji: '🌥️', label: 'Neutre',          phrase: 'au ton neutre',                 desc: 'Ton non précisé (valeur par défaut).' },
]

export const DEFAULT_MOOD = 'cloudy'

const MOOD_MAP = Object.fromEntries(MOODS.map(m => [m.id, m]))

export function getMood(id) {
    return MOOD_MAP[id] || MOOD_MAP[DEFAULT_MOOD]
}
