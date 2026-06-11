import styles from './ConversationItem.module.css'

/**
 * ConversationItem : Une ligne de conversation dans la liste des messages.
 * Affiche l'avatar, le pseudo, le dernier message et l'heure.
 * Prend en charge l'état "non lu" (badge rouge).
 *
 * @param {object}  conv        - Données de la conversation
 * @param {string}  conv.username    - Pseudo de l'interlocuteur
 * @param {string}  conv.lastMessage - Dernier message échangé
 * @param {string}  conv.date        - Date ISO du dernier message
 * @param {number}  conv.unreadCount - Nombre de messages non lus (0 = tout lu)
 * @param {boolean} isActive    - Vrai si cette conversation est ouverte
 * @param {function} onClick    - Handler de sélection
 */
function ConversationItem({ conv, isActive = false, onClick }) {
    const { username = 'utilisateur', lastMessage = '', date, unreadCount = 0 } = conv
    const initial = username.charAt(0).toUpperCase()

    return (
        <button
            className={[styles.item, isActive ? styles.active : ''].join(' ')}
            onClick={onClick}
            aria-label={`Conversation avec @${username}`}
            aria-current={isActive ? 'true' : undefined}
            id={`conv-${username}`}
        >
            {/* Avatar */}
            <div className={styles.avatar} aria-hidden="true">
                {initial}
            </div>

            {/* Texte */}
            <div className={styles.body}>
                <div className={styles.topRow}>
                    <span className={styles.username}>@{username}</span>
                    {date && (
                        <time className={styles.time} dateTime={date}>
                            {formatRelativeTime(date)}
                        </time>
                    )}
                </div>
                <p className={[styles.preview, unreadCount > 0 ? styles.bold : ''].join(' ')}>
                    {lastMessage || 'Nouvelle conversation'}
                </p>
            </div>

            {/* Badge "non lu" */}
            {unreadCount > 0 && (
                <span className={styles.badge} aria-label={`${unreadCount} non lus`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    )
}

function formatRelativeTime(isoDate) {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
    if (diff < 60)    return `${diff}s`
    if (diff < 3600)  return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}j`
}

export default ConversationItem
