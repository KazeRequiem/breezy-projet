import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Trash2, Users, MessageSquare, ChevronDown, Ban, RotateCcw, Search, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import RequireRole from '../../components/ui/RequireRole/RequireRole'
import TopBar from '../../components/layout/TopBar/TopBar'
import BottomNav from '../../components/layout/BottomNav/BottomNav'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import { deleteMessage } from '../../services/messageService'
import { getAdminMessages, getUsers, updateUserRole, setUserSuspended } from '../../services/adminService'
import styles from './AdminPage.module.css'

const ROLES = ['user', 'moderator', 'admin']
const ROLE_COLORS = {
    admin:     styles.badgeAdmin,
    moderator: styles.badgeModerator,
    user:      styles.badgeUser,
}

function formatDate(iso) {
    return iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

function AdminPage() {
    const { user } = useAuth()
    const currentRole = user?.role
    const currentId = user?.id
    const [activeTab, setActiveTab] = useState('messages')

    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState('')

    useEffect(() => {
        getAdminMessages().then(setMessages).catch(() => {})
        getUsers().then(setUsers).catch(() => {})
    }, [])

    const handleDeleteMessage = async (id) => {
        try {
            await deleteMessage(id)
            setMessages(prev => prev.filter(m => m.id_message !== id))
        } catch {
            alert("Erreur lors de la suppression du message.")
        }
    }

    const handleRoleChange = async (id, newRole) => {
        if (id === currentId) return
        try {
            await updateUserRole(id, newRole)
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
        } catch (err) {
            alert(err.message || "Erreur lors du changement de rôle.")
        }
    }

    const handleToggleSuspend = async (u) => {
        const next = !u.suspended
        try {
            await setUserSuspended(u.id, next)
            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, suspended: next } : x))
        } catch (err) {
            alert(err.message || "Erreur lors de la suspension.")
        }
    }

    // Un modérateur ne peut suspendre que des utilisateurs simples
    const canSuspend = (u) => u.id !== currentId && (currentRole === 'admin' || u.role === 'user')

    const filteredUsers = users.filter(u =>
        `${u.username} ${u.email}`.toLowerCase().includes(userSearch.trim().toLowerCase())
    )

    return (
        <RequireRole allowedRoles={['admin', 'moderator']} fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className="breezy-bg" aria-hidden="true" />
                <BreezyAtmosphere />
                <TopBar />
                <BottomNav />

                <main className={styles.main} role="main">
                    <div className={['anim-fade-up', styles.header].join(' ')}>
                        <div className={styles.headerTitle}>
                            <ShieldCheck size={28} strokeWidth={1.8} color="var(--brand)" />
                            <h1>Panneau Admin</h1>
                        </div>
                        <p className={styles.headerSub}>
                            Connecté en tant que <strong>@{user?.username}</strong>
                            <span className={ROLE_COLORS[currentRole]}>{currentRole}</span>
                        </p>
                    </div>

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
                    </div>

                    {activeTab === 'messages' && (
                        <section role="tabpanel" aria-labelledby="tab-messages" className={['anim-fade-up', styles.panel].join(' ')}>
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
                                                    {(msg.author?.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <Link to={`/profile/${msg.author?.username}`} className={styles.usernameLink}>
                                                        @{msg.author?.username || 'inconnu'}
                                                    </Link>
                                                    {msg.author?.role && <span className={ROLE_COLORS[msg.author.role]}>{msg.author.role}</span>}
                                                </div>
                                            </div>
                                            <div className={styles.contentCell}>
                                                {msg.reports_count > 0 && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        marginRight: 8, padding: '2px 8px', borderRadius: 999,
                                                        background: 'rgba(220,38,38,0.12)', color: '#dc2626',
                                                        fontSize: '0.72rem', fontWeight: 700, verticalAlign: 'middle',
                                                    }}>
                                                        <AlertTriangle size={12} /> {msg.reports_count}
                                                    </span>
                                                )}
                                                <span>{msg.content}</span>
                                            </div>
                                            <time className={styles.dateCell}>{formatDate(msg.date_publication)}</time>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteMessage(msg.id_message)}
                                                aria-label="Supprimer le message"
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

                    {activeTab === 'users' && (
                        <section role="tabpanel" aria-labelledby="tab-users" className={['anim-fade-up', styles.panel].join(' ')}>
                            <div style={{ position: 'relative', marginBottom: 14, maxWidth: 360 }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #9090b0)' }} />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Rechercher un utilisateur (pseudo ou e-mail)…"
                                    aria-label="Rechercher un utilisateur"
                                    id="admin-user-search"
                                    style={{
                                        width: '100%', padding: '9px 12px 9px 36px', borderRadius: 12,
                                        border: '1px solid rgba(120,100,160,0.2)', background: 'rgba(255,255,255,0.7)',
                                        fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-primary, #1a1a2e)', outline: 'none',
                                    }}
                                />
                            </div>
                            <div className={styles.table}>
                                <div className={[styles.tableRow, styles.tableHead].join(' ')}>
                                    <span>Utilisateur</span>
                                    <span>Email</span>
                                    <span>Rôle</span>
                                    <span>Action</span>
                                </div>
                                {filteredUsers.map(u => (
                                    <div key={u.id} className={styles.tableRow} style={u.suspended ? { opacity: 0.6 } : undefined}>
                                        <div className={styles.userCell}>
                                            <div className={styles.miniAvatar}>{u.username.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <Link to={`/profile/${u.username}`} className={styles.usernameLink}>@{u.username}</Link>
                                                {u.suspended && <span style={{ marginLeft: 6, color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}>(suspendu)</span>}
                                            </div>
                                        </div>
                                        <span className={styles.emailCell}>{u.email}</span>
                                        <div className={styles.roleCell}>
                                            {u.id === currentId ? (
                                                <span className={[styles.roleBadge, ROLE_COLORS[u.role]].join(' ')}>
                                                    {u.role} <span className={styles.selfBadge}>(vous)</span>
                                                </span>
                                            ) : currentRole === 'admin' ? (
                                                <div className={styles.roleSelect}>
                                                    <select
                                                        value={u.role}
                                                        onChange={e => handleRoleChange(u.id, e.target.value)}
                                                        className={[styles.select, ROLE_COLORS[u.role]].join(' ')}
                                                        aria-label={`Rôle de @${u.username}`}
                                                        id={`role-select-${u.id}`}
                                                    >
                                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    <ChevronDown size={12} className={styles.selectChevron} />
                                                </div>
                                            ) : (
                                                <span className={[styles.roleBadge, ROLE_COLORS[u.role]].join(' ')}>{u.role}</span>
                                            )}
                                        </div>
                                        <div>
                                            {canSuspend(u) ? (
                                                <button
                                                    onClick={() => handleToggleSuspend(u)}
                                                    aria-label={u.suspended ? 'Réactiver le compte' : 'Suspendre le compte'}
                                                    id={`suspend-btn-${u.id}`}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                                        padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
                                                        fontWeight: 600, fontSize: '0.8rem', border: '1px solid',
                                                        borderColor: u.suspended ? '#3a8a3a' : '#dc2626',
                                                        background: u.suspended ? 'rgba(58,138,58,0.1)' : 'rgba(220,38,38,0.1)',
                                                        color: u.suspended ? '#2f7a2f' : '#dc2626',
                                                    }}
                                                >
                                                    {u.suspended ? <RotateCcw size={14} /> : <Ban size={14} />}
                                                    {u.suspended ? 'Réactiver' : 'Suspendre'}
                                                </button>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </RequireRole>
    )
}

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
