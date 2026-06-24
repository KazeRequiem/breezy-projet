import { apiFetch } from './api'

export function mapMessage(m) {
    return {
        ...m,
        id_message: m._id ?? m.id_message,
        date_publication: m.createdAt ?? m.date_publication,
        reply_to: null,
    }
}

function buildQuery({ before, limit = 20 } = {}) {
    const params = new URLSearchParams()
    if (limit) params.set('limit', limit)
    if (before) params.set('before', before)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
}

export async function getExplore(options = {}) {
    const data = await apiFetch(`/api/messages/explore${buildQuery(options)}`)
    return Array.isArray(data) ? data.map(mapMessage) : []
}

export async function getFeed(options = {}) {
    const data = await apiFetch(`/api/messages/feed${buildQuery(options)}`)
    return Array.isArray(data) ? data.map(mapMessage) : []
}

export async function deleteMessage(id) {
    return apiFetch(`/api/messages/${id}`, { method: 'DELETE' })
}

export async function updateMessage(id, content, tags) {
    const data = await apiFetch(`/api/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content, tags }),
    })
    return mapMessage(data)
}

export async function getMessagesByUsername(username) {
    const data = await apiFetch(`/api/messages/profile/${encodeURIComponent(username)}`)
    return Array.isArray(data) ? data.map(mapMessage) : []
}

export async function searchMessagesByTags(tags) {
    const raw = Array.isArray(tags) ? tags : String(tags).split(/[\s,]+/)
    const clean = raw.map(t => t.replace(/^#/, '').trim().toLowerCase()).filter(Boolean)
    if (clean.length === 0) return []
    const data = await apiFetch(`/api/messages/search?tags=${encodeURIComponent(clean.join(','))}`)
    return Array.isArray(data) ? data.map(mapMessage) : []
}

export async function createMessage({ content, image_url = null, video_url = null, tags = [] }) {
    const data = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ content, image_url, video_url, tags }),
    })
    return mapMessage(data)
}

export async function getReplies(messageId) {
    const data = await apiFetch(`/api/messages/${messageId}/replies`)
    return Array.isArray(data) ? data.map(mapMessage) : []
}

export async function createReply(messageId, content) {
    const data = await apiFetch(`/api/messages/${messageId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    })
    return mapMessage(data.message)
}
