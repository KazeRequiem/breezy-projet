import { Link } from 'react-router-dom'
import { Heart, MessageCircle, UserPlus } from 'lucide-react'
import styles from './NotifItem.module.css'

/**
 * NotifItem : Une ligne de notification.
 *
 * Trois types couverts par la matrice (Fx14, Fx15, Fx16) :
 *   - 'mention'  → Quelqu'un t'a mentionné dans un post
 *   - 'like'     → Quelqu'un a aimé ton post
 *   - 'follower' → Quelqu'un a commencé à te suivre
 *
 * @param {object}  notif       - Données de la notification
 * @param {string}  notif.type  - 'mention' | 'like' | 'follower'
 * @param {string}  notif.from  - Pseudo de l'auteur de l'action
 * @param {string}  [notif.excerpt] - Extrait du post concerné
 * @param {string}  notif.date  - Date ISO
 * @param {boolean} notif.read  - Déjà lue ou non
 */
function NotifItem({ notif }) {
    const { type, from, excerpt, date, read } = notif

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.mention

    return (
        <article
            className={[styles.item, !read ? styles.unread : ''].join(' ')}
            aria-label={`Notification de @${from}`}
        >
            {/* Pastille colorée + icône */}
            <div className={styles.iconWrap} style={{ background: config.bg }}>
                <config.Icon size={16} color={config.color} strokeWidth={2.5} />
            </div>

            {/* Texte */}
            <div className={styles.body}>
                <p className={styles.text}>
                    <Link to={`/profile/${from}`} className={styles.userLink}>
                        <strong>@{from}</strong>
                    </Link>{' '}
                    {config.text}
                </p>
                {excerpt && (
                    <p className={styles.excerpt}>"{excerpt}"</p>
                )}
                <time className={styles.time} dateTime={date}>
                    {formatRelativeTime(date)}
                </time>
            </div>

            {/* Point rouge si non lu */}
            {!read && <div className={styles.unreadDot} aria-hidden="true" />}
        </article>
    )
}

const TYPE_CONFIG = {
    mention: {
        Icon:  MessageCircle,
        bg:    'rgba(59, 140, 240, 0.12)',
        color: '#3b8cf0',
        text:  't\'a mentionné dans un Breezy',
    },
    like: {
        Icon:  Heart,
        bg:    'rgba(236, 72, 110, 0.12)',
        color: '#ec486e',
        text:  'a aimé ton Breezy',
    },
    follower: {
        Icon:  UserPlus,
        bg:    'rgba(34, 197, 94, 0.12)',
        color: '#16a34a',
        text:  'a commencé à te suivre',
    },
}

function formatRelativeTime(isoDate) {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
    if (diff < 60)    return `${diff}s`
    if (diff < 3600)  return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}j`
}

export default NotifItem
