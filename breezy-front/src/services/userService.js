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
