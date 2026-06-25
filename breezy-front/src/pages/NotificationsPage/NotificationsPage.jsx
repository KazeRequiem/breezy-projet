import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import TopBar          from '../../components/layout/TopBar/TopBar'
import BottomNav        from '../../components/layout/BottomNav/BottomNav'
import TrendingSection  from '../../components/trending/TrendingSection/TrendingSection'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import NotifItem        from '../../components/notifications/NotifItem/NotifItem'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationService'
import styles from './NotificationsPage.module.css'

// Mappe le type backend vers le type d'affichage de NotifItem
const TYPE_MAP = { follow: 'follower', like: 'like', mention: 'mention', reply: 'reply', whisper: 'whisper' }

function mapNotif(n) {
    return {
        id: n._id,
        type: TYPE_MAP[n.type] || n.type,
        from: n.sender?.username || 'inconnu',
        excerpt: null,
        date: n.createdAt,
        read: !!n.read,
    }
}

const FILTERS = [
    { key: 'all',      label: 'Tout' },
    { key: 'follower', label: 'Abonnés' },
    { key: 'like',     label: "J'aime" },
    { key: 'reply',    label: 'Réponses' },
    { key: 'mention',  label: 'Mentions' },
    { key: 'whisper',  label: 'Whispers' },
]

function NotificationsPage() {
    const [notifs, setNotifs] = useState([])
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        getNotifications()
            .then(list => {
                if (cancelled || !Array.isArray(list)) return
                setNotifs(list.map(mapNotif))
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const unreadCount = notifs.filter(n => !n.read).length

    const markAllRead = async () => {
        setNotifs(prev => prev.map(n => ({ ...n, read: true })))
        try { await markAllNotificationsRead() } catch { /* silencieux */ }
    }

    const handleRead = async (id) => {
        const target = notifs.find(n => n.id === id)
        if (!target || target.read) return
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        try { await markNotificationRead(id) } catch { /* silencieux */ }
    }

    const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter)

    return (
        <div className={styles.wrapper}>
            <div className="breezy-bg" aria-hidden="true" />
            <BreezyAtmosphere />
            <TopBar />
            <BottomNav />

            <div className={styles.layout}>
                <main className={styles.mainColumn} role="main">

                    <header className={styles.pageHeader}>
                        <div className={styles.titleGroup}>
                            <Bell size={20} color="var(--brand)" strokeWidth={2} aria-hidden="true" />
                            <h1 className={styles.pageTitle}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span className={styles.badge} aria-label={`${unreadCount} non lues`}>
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                id="btn-mark-all-read"
                                className={styles.markReadBtn}
                                onClick={markAllRead}
                                aria-label="Tout marquer comme lu"
                            >
                                <Check size={14} strokeWidth={2.5} />
                                Tout lire
                            </button>
                        )}
                    </header>

                    <nav className={styles.filters} aria-label="Filtres des notifications">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                id={`filter-${f.key}`}
                                className={[styles.filterBtn, filter === f.key ? styles.filterActive : ''].join(' ')}
                                onClick={() => setFilter(f.key)}
                                aria-pressed={filter === f.key}
                            >
                                {f.label}
                            </button>
                        ))}
                    </nav>

                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>Chargement des notifications…</p>
                    ) : filtered.length === 0 ? (
                        <div className={styles.emptyBox}>
                            <Bell size={32} strokeWidth={1.4} color="var(--text-muted)" />
                            <p>Aucune notification dans cette catégorie</p>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {filtered.map((notif, i) => (
                                <div
                                    key={notif.id}
                                    className={`anim-fade-up anim-delay-${Math.min(i + 1, 4)}`}
                                    onClick={() => handleRead(notif.id)}
                                    role="presentation"
                                >
                                    <NotifItem notif={notif} />
                                </div>
                            ))}
                        </div>
                    )}

                </main>

                <aside className={styles.rightColumn} aria-label="Tendances">
                    <TrendingSection />
                </aside>
            </div>
        </div>
    )
}

export default NotificationsPage
