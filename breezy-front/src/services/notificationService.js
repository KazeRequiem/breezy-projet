import { apiFetch } from './api'

export async function getNotifications() {
    return apiFetch('/api/notifications')
}

export async function markNotificationRead(id) {
    return apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllNotificationsRead() {
    return apiFetch('/api/notifications/read-all', { method: 'PATCH' })
}
