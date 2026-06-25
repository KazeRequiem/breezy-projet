import { apiFetch } from './api'

export async function getWhispers(messageId) {
    return apiFetch(`/api/messages/${messageId}/whispers`)
}

export async function sendWhisper(messageId, content, mood) {
    return apiFetch(`/api/messages/${messageId}/whispers`, {
        method: 'POST',
        body: JSON.stringify({ content, mood }),
    })
}

export async function deleteWhisper(id) {
    return apiFetch(`/api/whispers/${id}`, { method: 'DELETE' })
}
