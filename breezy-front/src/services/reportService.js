import { apiFetch } from './api'

export async function reportMessage(messageId) {
    return apiFetch(`/api/reports/${messageId}`, { method: 'POST' })
}

export async function getReports() {
    return apiFetch('/api/reports')
}

export async function dismissReports(messageId) {
    return apiFetch(`/api/reports/${messageId}`, { method: 'DELETE' })
}
