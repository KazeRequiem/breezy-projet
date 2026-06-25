/**
 * userService : Couche d'accès à l'API utilisateurs.
 */

import { apiFetch } from './api'

/**
 * getUserByUsername() : Récupère le profil public d'un utilisateur.
 * @param {string} username
 * @returns {Promise<{ id, username, email, biography, profile_picture, role, tags, createdAt }>}
 */
export async function getUserByUsername(username) {
    return apiFetch(`/api/users/${encodeURIComponent(username)}`)
}

/**
 * searchUsers() : Recherche des utilisateurs par nom d'utilisateur (autocomplétion).
 * @param {string} query - Le terme de recherche
 * @returns {Promise<Array<{ _id, username, profile_picture, biography }>>}
 */
export async function searchUsers(query) {
    if (!query || !query.trim()) return []
    const encoded = encodeURIComponent(query.trim())
    const data = await apiFetch(`/api/users/search?q=${encoded}`)
    return Array.isArray(data) ? data : []
}

/**
 * updateProfile() : Met à jour le profil de l'utilisateur connecté.
 * @param {{ username?, biography?, profile_picture?, tags? }} data
 */
export async function updateProfile(data) {
    return apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}
