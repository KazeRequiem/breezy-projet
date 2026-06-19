/**
 * authService : Couche d'accès à l'API d'authentification.
 *
 * Toutes les fonctions retournent une Promise et lèvent une Error
 * avec un message lisible en cas d'échec (extrait du JSON de l'API).
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/**
 * Envoie une requête à l'API et parse le JSON.
 * Distingue deux types d'erreurs :
 *   - Erreur réseau (CORS, serveur inaccessible) → message français explicite
 *   - Erreur HTTP (400, 401, 409...) → message renvoyé par le serveur
 */
async function apiFetch(path, options = {}) {
    let res
    try {
        // TODO (Sécurité) : Quand le back sera en httpOnly, décommenter cette ligne pour envoyer automatiquement le cookie :
        // options.credentials = 'include'
        res = await fetch(`${API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        })
    } catch {
        // TypeError: Failed to fetch → serveur inaccessible ou CORS
        throw new Error('Impossible de joindre le serveur. Vérifie que le back-end est démarré et que CORS est configuré.')
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.message ?? `Erreur ${res.status}`)
    }
    return data
}

import { USE_MOCK, mockLogin, mockRegister } from './mockData'

/**
 * login() : Authentifie un utilisateur.
 * @returns {Promise<{ token: string, user: { id_user: number, username: string, email: string, role: string } }>}
 */
export async function login(email, password) {
    if (USE_MOCK) {
        return mockLogin(email, password)
    }
    return apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
}

/**
 * register() : Crée un nouveau compte utilisateur.
 * @param {string}      username
 * @param {string}      email
 * @param {string}      password
 * @param {string|null} biography
 * @param {string[]}    tags - Tableau des noms de tags sélectionnés
 * @param {string|null} profile_picture - Data URL base64 de l'image (optionnel)
 * @returns {Promise<{ id: string, username: string, email: string, role: string }>}
 */
export async function register(username, email, password, biography = null, tags = [], profile_picture = null) {
    if (USE_MOCK) {
        return mockRegister(username, email, password, biography)
    }
    return apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, biography, tags, profile_picture }),
    })
}
