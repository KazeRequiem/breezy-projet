import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Trash2, Users, MessageSquare, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import RequireRole from '../../components/ui/RequireRole/RequireRole'
import TopBar from '../../components/layout/TopBar/TopBar'
import BottomNav from '../../components/layout/BottomNav/BottomNav'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import styles from './AdminPage.module.css'

// ─── Données de démo (à remplacer par des appels API quand le back sera prêt) ─
const DEMO_MESSAGES = [
    { id_message: 1, content: "Premiere sortie avec la nouvelle UI Breezy 🌊", date_publication: new Date(Date.now() - 4 * 60 * 1000).toISOString(), User: { id_user: 1, username: 'baptistenoisette', role: 'user' } },
    { id_message: 2, content: "Trop d'accord ! Le fond qui change doucement c'est mon detail prefere ✨", date_publication: new Date(Date.now() - 6 * 60 * 1000).toISOString(), User: { id_user: 2, username: 'camille_lrt', role: 'user' } },
    { id_message: 3, content: "Quelqu'un a remarque que le background change en permanence ? 👀", date_publication: new Date(Date.now() - 35 * 60 * 1000).toISOString(), User: { id_user: 3, username: 'tommrc', role: 'user' } },
    { id_message: 4, content: "Dark mode = moins de fatigue oculaire. Light mode = confusion totale 😂", date_publication: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), User: { id_user: 1, username: 'baptistenoisette', role: 'user' } },
    { id_message: 5, content: "Est-ce qu'il y aura un mode sombre ? 🌙", date_publication: new Date(Date.now() - 60 * 60 * 1000).toISOString(), User: { id_user: 5, username: 'noah_brd', role: 'user' } },
]

const DEMO_USERS = [
    { id_user: 1, username: 'baptistenoisette', email: 'baptiste@breezy.app', role: 'admin',     date_creation: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id_user: 2, username: 'camille_lrt',      email: 'camille@breezy.app',  role: 'moderator', date_creation: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    { id_user: 3, username: 'tommrc',            email: 'tom@breezy.app',      role: 'user',      date_creation: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id_user: 4, username: 'leaft_',            email: 'leaft@breezy.app',    role: 'user',      date_creation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id_user: 5, username: 'noah_brd',          email: 'noah@breezy.app',     role: 'user',      date_creation: new Date(Date.now() -  5 * 24 * 60 * 60 * 1000).toISOString() },
]
// ─────────────────────────────────────────────────────────────────────────────

const ROLES = ['user', 'moderator', 'admin']

const ROLE_COLORS = {
    admin:     styles.badgeAdmin,
    moderator: styles.badgeModerator,
    user:      styles.badgeUser,
}

function formatDate(iso) {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

/**
 * AdminPage : Panneau d'administration Breezy.
 *
 * ⚠️  Cette page est protégée côté UX par <RequireRole>.
 *     La vraie protection est assurée par les middlewares Back-end (checkRole).
 *
 * Onglets :
 *   - Messages  → accessible admin + moderator (Fx21)
 *   - Utilisateurs → accessible admin uniquement  (Fx21)
 */
function AdminPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('messages')

    // ── État messages ──
    const [messages, setMessages] = useState(DEMO_MESSAGES)

    const handleDeleteMessage = (id) => {
        // TODO: appel DELETE /api/messages/:id quand le back sera prêt
        setMessages(prev => prev.filter(m => m.id_message !== id))
    }

    // ── État utilisateurs ──
    const [users, setUsers] = useState(DEMO_USERS)

    const handleRoleChange = (id, newRole) => {
        if (id === user?.id_user) return // ne peut pas se rétrograder soi-même
        // TODO: appel PUT /api/admin/users/:id/role quand le back sera prêt
        setUsers(prev => prev.map(u => u.id_user === id ? { ...u, role: newRole } : u))
    }

    return (
        // RequireRole ici en plus de la route : affiche un message d'erreur propre
        // si quelqu'un arrive directement sur /admin sans le bon rôle
        <RequireRole
            allowedRoles={['admin', 'moderator']}
            fallback={<AccessDenied />}
        >
            <div className={styles.wrapper}>
                <div className="breezy-bg" aria-hidden="true" />
                <BreezyAtmosphere />
                <TopBar />
                <BottomNav />

                <main className={styles.main} role="main">
                    {/* En-tête */}
                    <div className={['anim-fade-up', styles.header].join(' ')}>
                        <div className={styles.headerTitle}>
                            <ShieldCheck size={28} strokeWidth={1.8} color="var(--brand)" />
                            <h1>Panneau Admin</h1>
                        </div>
                        <p className={styles.headerSub}>
                            Connecté en tant que <strong>@{user?.username}</strong>
                            <span className={ROLE_COLORS[user?.role]}>{user?.role}</span>
                        </p>
                    </div>

                    {/* Onglets */}
                    <div className={styles.tabs} role="tablist">
                        <button
                            role="tab"
                            id="tab-messages"
                            aria-selected={activeTab === 'messages'}
                            className={[styles.tab, activeTab === 'messages' ? styles.tabActive : ''].join(' ')}
                            onClick={() => setActiveTab('messages')}
                        >
                            <MessageSquare size={16} />
                            Messages
                            <span className={styles.tabCount}>{messages.length}</span>
                        </button>

                        {/* Onglet Utilisateurs : admin uniquement Fx21 */}
                        <RequireRole allowedRoles={['admin']}>
                            <button
                                role="tab"
                                id="tab-users"
                                aria-selected={activeTab === 'users'}
                                className={[styles.tab, activeTab === 'users' ? styles.tabActive : ''].join(' ')}
                                onClick={() => setActiveTab('users')}
                            >
                                <Users size={16} />
                                Utilisateurs
                                <span className={styles.tabCount}>{users.length}</span>
                            </button>
                        </RequireRole>
                    </div>

                    {/* Panneau Messages */}
                    {activeTab === 'messages' && (
                        <section
                            role="tabpanel"
                            aria-labelledby="tab-messages"
                            className={['anim-fade-up', styles.panel].join(' ')}
                        >
                            <p className={styles.panelNote}>
                                ℹ️ Les suppressions sont locales (démo). Connecter à <code>DELETE /api/messages/:id</code> quand le back est prêt.
                            </p>
                            {messages.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MessageSquare size={40} strokeWidth={1.2} />
                                    <p>Aucun message.</p>
                                </div>
                            ) : (
                                <div className={styles.table}>
                                    <div className={[styles.tableRow, styles.tableHead].join(' ')}>
                                        <span>Auteur</span>
                                        <span>Contenu</span>
                                        <span>Date</span>
                                        <span>Action</span>
                                    </div>
                                    {messages.map(msg => (
                                        <div key={msg.id_message} className={styles.tableRow}>
                                            <div className={styles.userCell}>
                                                <div className={styles.miniAvatar}>
                                                    {msg.User.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <Link to={`/profile/${msg.User.username}`} className={styles.usernameLink}>
                                                        @{msg.User.username}
                                                    </Link>
                                                    <span className={ROLE_COLORS[msg.User.role]}>{msg.User.role}</span>
                                                </div>
                                            </div>
                                            <p className={styles.contentCell}>{msg.content}</p>
                                            <time className={styles.dateCell}>{formatDate(msg.date_publication)}</time>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteMessage(msg.id_message)}
                                                aria-label={`Supprimer le message ${msg.id_message}`}
                                                id={`admin-delete-msg-${msg.id_message}`}
                                            >
                                                <Trash2 size={14} />
                                                Supprimer
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Panneau Utilisateurs — admin uniquement */}
                    {activeTab === 'users' && (
                        <RequireRole allowedRoles={['admin']} fallback={<AccessDenied />}>
                            <section
                                role="tabpanel"
                                aria-labelledby="tab-users"
                                className={['anim-fade-up', styles.panel].join(' ')}
                            >
                                <p className={styles.panelNote}>
                                    ℹ️ Les modifications de rôle sont locales (démo). Connecter à <code>PUT /api/admin/users/:id/role</code> quand le back est prêt.
                                </p>
                                <div className={styles.table}>
                                    <div className={[styles.tableRow, styles.tableHead].join(' ')}>
                                        <span>Utilisateur</span>
                                        <span>Email</span>
                                        <span>Inscrit le</span>
                                        <span>Rôle</span>
                                    </div>
                                    {users.map(u => (
                                        <div key={u.id_user} className={styles.tableRow}>
                                            <div className={styles.userCell}>
                                                <div className={styles.miniAvatar}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <Link to={`/profile/${u.username}`} className={styles.usernameLink}>
                                                    @{u.username}
                                                </Link>
                                            </div>
                                            <span className={styles.emailCell}>{u.email}</span>
                                            <time className={styles.dateCell}>{formatDate(u.date_creation)}</time>
                                            <div className={styles.roleCell}>
                                                {u.id_user === user?.id_user ? (
                                                    // Ne peut pas se rétrograder soi-même
                                                    <span className={[styles.roleBadge, ROLE_COLORS[u.role]].join(' ')}>
                                                        {u.role} <span className={styles.selfBadge}>(vous)</span>
                                                    </span>
                                                ) : (
                                                    <div className={styles.roleSelect}>
                                                        <select
                                                            value={u.role}
                                                            onChange={e => handleRoleChange(u.id_user, e.target.value)}
                                                            className={[styles.select, ROLE_COLORS[u.role]].join(' ')}
                                                            aria-label={`Rôle de @${u.username}`}
                                                            id={`role-select-${u.id_user}`}
                                                        >
                                                            {ROLES.map(r => (
                                                                <option key={r} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={12} className={styles.selectChevron} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </RequireRole>
                    )}
                </main>
            </div>
        </RequireRole>
    )
}

/** Composant affiché si l'utilisateur tente d'accéder sans le bon rôle */
function AccessDenied() {
    return (
        <div className={styles.accessDenied}>
            <div className="breezy-bg" aria-hidden="true" />
            <div className={styles.accessDeniedCard}>
                <ShieldCheck size={48} strokeWidth={1.4} color="#ff6b6b" />
                <h1>Accès refusé</h1>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                <Link to="/feed" className={styles.backBtn}>Retourner au fil</Link>
            </div>
        </div>
    )
}

export default AdminPage
