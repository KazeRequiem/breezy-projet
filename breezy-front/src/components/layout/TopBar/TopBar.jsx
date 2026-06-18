import { Link } from 'react-router-dom'
import { Bell, ShieldCheck } from 'lucide-react'
import logoBreezy from '../../../assets/logo-breezy.png'
import { useAuth } from '../../../contexts/AuthContext'
import RequireRole from '../../ui/RequireRole/RequireRole'
import styles from './TopBar.module.css'

function TopBar() {
    const { user } = useAuth()
    const username = user?.username ?? ''

    return (
        <header className={styles.topbar} role="banner" aria-label="En-tête Breezy">
            {/* Logo aligné à gauche maintenant que l'avatar n'est plus là */}
            <Link to="/feed" className={styles.logoLink} aria-label="Accueil Breezy">
                <img
                    src={logoBreezy}
                    alt="Logo Breezy"
                    className={styles.logo}
                />
            </Link>

            {/* Boutons droite */}
            <div className={styles.rightActions}>
                {/* Lien Admin visible uniquement pour admin et moderator (UX seulement) */}
                <RequireRole allowedRoles={['admin', 'moderator']}>
                    <Link
                        to="/admin"
                        className={styles.adminLink}
                        aria-label="Panneau d'administration"
                        id="topbar-admin"
                        title="Administration"
                    >
                        <ShieldCheck size={20} strokeWidth={2} />
                    </Link>
                </RequireRole>

                {/* Bouton notification */}
                <Link 
                    to="/notifs" 
                    className={styles.notifLink}
                    aria-label="Notifications"
                    id="topbar-notifs"
                >
                    <Bell size={20} strokeWidth={2} />
                    <span className={styles.badge} />
                </Link>
            </div>
        </header>
    )
}

export default TopBar
