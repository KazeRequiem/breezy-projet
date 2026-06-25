import { apiFetch } from './api'

export async function getAdminMessages() {
    return apiFetch('/api/admin/messages')
}

export async function getUsers() {
    return apiFetch('/api/admin/users')
}

export async function updateUserRole(id, role) {
    return apiFetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    })
}

export async function setUserSuspended(id, suspended) {
    return apiFetch(`/api/admin/users/${id}/suspend`, {
        method: 'PATCH',
        body: JSON.stringify({ suspended }),
    })
}
