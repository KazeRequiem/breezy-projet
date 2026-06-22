import { apiFetch } from './api'

export async function followUser(id) {
    return apiFetch(`/api/follow/${id}`, { method: 'POST' })
}

export async function unfollowUser(id) {
    return apiFetch(`/api/follow/${id}`, { method: 'DELETE' })
}

export async function getFollowers(id) {
    return apiFetch(`/api/follow/${id}/followers`)
}

export async function getFollowing(id) {
    return apiFetch(`/api/follow/${id}/following`)
}
