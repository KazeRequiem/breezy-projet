const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/**
 * Envoie une requête à l'API et parse le JSON.
 * Distingue deux types d'erreurs :
 *   - Erreur réseau (CORS, serveur inaccessible) → message français explicite
 *   - Erreur HTTP (400, 401, 409...) → message renvoyé par le serveur
 */
export async function apiFetch(path, options = {}) {
    let res
    try {
        // TODO (Sécurité) : Quand le back sera en httpOnly, décommenter cette ligne pour envoyer automatiquement le cookie :
        // options.credentials = 'include'
        const token = sessionStorage.getItem('breezy_token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        res = await fetch(`${API_BASE}${path}`, {
            headers,
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
