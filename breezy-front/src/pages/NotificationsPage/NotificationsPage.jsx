import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import TopBar          from '../../components/layout/TopBar/TopBar'
import BottomNav        from '../../components/layout/BottomNav/BottomNav'
import TrendingSection  from '../../components/trending/TrendingSection/TrendingSection'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import NotifItem        from '../../components/notifications/NotifItem/NotifItem'
import styles from './NotificationsPage.module.css'

// Données de démonstration Fx14 (mentions), Fx15 (likes), Fx16 (followers)
const DEMO_NOTIFS = [
    {
        id: 1, type: 'mention',
        from: 'alice_dev',
        excerpt: 'JWT courte durée + refresh token = le combo...',
        date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
    },
    {
        id: 2, type: 'like',
        from: 'marco_ui',
        excerpt: 'Breezy est rapide et léger...',
        date: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        read: false,
    },
    {
        id: 3, type: 'follower',
        from: 'elena_wild',
        excerpt: null,
        date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: false,
    },
    {
        id: 4, type: 'like',
        from: 'thomas_code',
        excerpt: 'Dark mode = moins de fatigue oculaire...',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
    },
    {
        id: 5, type: 'mention',
        from: 'sofia_data',
        excerpt: 'Le front React de Breezy est vraiment propre...',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: true,
    },
    {
        id: 6, type: 'follower',
        from: 'kevin_ux',
        excerpt: null,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
    },
]

/**
 * NotificationsPage : Centre de notifications (Fx14, Fx15, Fx16).
 *
 * Trois filtres en onglets : Tout / Mentions / Likes / Abonnés.
 * Un bouton "Tout marquer comme lu" vide les badges.
 */
function NotificationsPage() {
    const [notifs, setNotifs]   = useState(DEMO_NOTIFS)
    const [filter, setFilter]   = useState('all')

    const unreadCount = notifs.filter(n => !n.read).length

    const markAllRead = () =>
        setNotifs(prev => prev.map(n => ({ ...n, read: true })))

    const filtered = filter === 'all'
        ? notifs
        : notifs.filter(n => n.type === filter)

    const FILTERS = [
        { key: 'all',      label: 'Tout' },
        { key: 'mention',  label: 'Mentions' },
        { key: 'like',     label: 'Likes' },
        { key: 'follower', label: 'Abonnés' },
    ]

    return (
        <div className={styles.wrapper}>
            <div className="breezy-bg" aria-hidden="true" />
            <BreezyAtmosphere />
            <TopBar />
            <BottomNav />

            <div className={styles.layout}>
                <main className={styles.mainColumn} role="main">

                    {/* En-tête */}
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

                    {/* Onglets de filtre */}
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

                    {/* Liste des notifications */}
                    {filtered.length === 0 ? (
                        <div className={styles.emptyBox}>
                            <Bell size={32} strokeWidth={1.4} color="var(--text-muted)" />
                            <p>Aucune notification dans cette catégorie</p>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {filtered.map((notif, i) => (
                                <div key={notif.id} className={`anim-fade-up anim-delay-${Math.min(i + 1, 4)}`}>
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
