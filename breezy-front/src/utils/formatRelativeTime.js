/**
 * Formate une date ISO en temps relatif lisible.
 * Ex: "4s", "12m", "3h", "2j"
 *
 * @param {string} isoDate - Date au format ISO 8601
 * @returns {string}
 */
export function formatRelativeTime(isoDate) {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
    if (diff < 60)    return `${diff}s`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}j`
}
