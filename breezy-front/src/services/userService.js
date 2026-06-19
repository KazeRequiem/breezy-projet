/**
 * userService : Couche d'accès à l'API utilisateurs.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function apiFetch(path, options = {}) {
    let res
    try {
        res = await fetch(`${API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        })
    } catch {
        throw new Error('Impossible de joindre le serveur.')
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.message ?? `Erreur ${res.status}`)
    }
    return data
}

/**
 * getUserByUsername() : Récupère le profil public d'un utilisateur.
 * @param {string} username
 * @returns {Promise<{ id, username, email, biography, profile_picture, role, tags, createdAt }>}
 */
export async function getUserByUsername(username) {
    return apiFetch(`/api/users/${encodeURIComponent(username)}`)
}
