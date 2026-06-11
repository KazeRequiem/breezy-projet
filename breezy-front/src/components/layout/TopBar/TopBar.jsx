import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import logoBreezy from '../../../assets/logo-breezy.png'
import styles from './TopBar.module.css'

function TopBar() {
    const username = 'baptistenoisette'

    return (
        <header className={styles.topbar} role="banner" aria-label="En-tête Breezy">
            {/* Photo de profil (avatar) en haut à gauche */}
            <Link 
                to={`/profile/${username}`} 
                className={styles.avatarLink}
                aria-label="Voir mon profil"
                id="topbar-avatar"
            >
                <div className={styles.avatar}>
                    {username.charAt(0).toUpperCase()}
                </div>
            </Link>

            {/* Logo centré */}
            <Link to="/feed" className={styles.logoLink} aria-label="Accueil Breezy">
                <img
                    src={logoBreezy}
                    alt="Logo Breezy"
                    className={styles.logo}
                />
            </Link>

            {/* Bouton notification en haut à droite */}
            <Link 
                to="/notifs" 
                className={styles.notifLink}
                aria-label="Notifications"
                id="topbar-notifs"
            >
                <Bell size={20} strokeWidth={2} />
                <span className={styles.badge} />
            </Link>
        </header>
    )
}

export default TopBar
