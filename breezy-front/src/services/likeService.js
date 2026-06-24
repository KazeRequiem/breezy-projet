import { apiFetch } from './api'

export async function likePost(messageId) {
    return apiFetch(`/api/likes/${messageId}`, { method: 'POST' })
}

export async function unlikePost(messageId) {
    return apiFetch(`/api/likes/${messageId}`, { method: 'DELETE' })
}

export async function getLikeStatus(messageId) {
    return apiFetch(`/api/likes/${messageId}/status`)
}
