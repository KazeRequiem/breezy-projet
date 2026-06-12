import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Search, Bell } from 'lucide-react'
import logoBreezy from '../../../assets/logo-breezy.png'
import styles from './BottomNav.module.css'

// Liens de la navigation principale
const NAV_ITEMS = [
    { path: '/feed',      icon: Home,    label: 'Accueil' },
    { path: '/interests', icon: Compass, label: 'Intérêts' },
]

// Base de données pour les suggestions de recherche
const SEARCHABLE_USERS = [
    { username: 'baptistenoisette', name: 'Baptiste Noisette' },
    { username: 'camille_lrt', name: 'Camille Lrt' },
    { username: 'tommrc', name: 'Tom Mrc' },
    { username: 'leaft_', name: 'Leaft' },
    { username: 'noah_brd', name: 'Noah Brd' },
]

// Navigation principale (barre mobile en bas, sidebar desktop à gauche)
function BottomNav() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const username = 'baptistenoisette'

    // États recherche
    const [searchQuery, setSearchQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)

    const searchContainerRef = useRef(null)

    // Fermer les suggestions lors d'un clic extérieur
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
        setShowSuggestions(true)
    }

    const handleSelectUser = (userUsername) => {
        setSearchQuery('')
        setShowSuggestions(false)
        navigate(`/profile/${userUsername}`)
    }

    const suggestions = searchQuery.trim()
        ? SEARCHABLE_USERS.filter(u =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : []

    return (
        <div ref={searchContainerRef}>
            {/* Mobile : bottom bar */}
            <nav className={styles.bottomNav} aria-label="Navigation principale">
                <NavItem path="/feed"      icon={Home}    label="Accueil"   active={pathname === '/feed'} />
                <NavItem path="/interests" icon={Compass} label="Intérêts"  active={pathname === '/interests'} />
                <div className={styles.searchPill} role="search">
                    <Search size={14} color="var(--text-muted)" strokeWidth={2} />
                    <input
                        id="search-mobile"
                        type="text"
                        placeholder="Rechercher..."
                        aria-label="Champ de recherche"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                    />
                </div>

                {/* Suggestions mobiles (au-dessus du bottomNav) */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className={[styles.suggestionsMobile, 'anim-fade-up'].join(' ')}>
                        {suggestions.map(u => (
                            <button
                                key={u.username}
                                className={styles.suggestionItem}
                                onClick={() => handleSelectUser(u.username)}
                            >
                                <div className={styles.suggestionAvatar}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.suggestionInfo}>
                                    <span className={styles.suggestionName}>{u.name}</span>
                                    <span className={styles.suggestionHandle}>@{u.username}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Desktop : sidebar gauche */}
            <aside className={styles.sidebar} aria-label="Navigation latérale">
                <Link to="/feed" className={styles.sidebarLogo} aria-label="Accueil Breezy">
                    <img src={logoBreezy} alt="Logo Breezy" />
                </Link>

                <div className={styles.sidebarSearchWrapper}>
                    <div className={styles.sidebarSearch} role="search">
                        <Search size={16} color="var(--text-muted)" strokeWidth={2} />
                        <input
                            id="search-desktop"
                            type="text"
                            placeholder="Rechercher..."
                            aria-label="Champ de recherche"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSuggestions(true)}
                            autoComplete="off"
                        />
                    </div>

                    {/* Suggestions desktop (sous la barre de recherche de la sidebar) */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className={[styles.suggestionsDesktop, 'anim-fade-up'].join(' ')}>
                            {suggestions.map(u => (
                                <button
                                    key={u.username}
                                    className={styles.suggestionItem}
                                    onClick={() => handleSelectUser(u.username)}
                                >
                                    <div className={styles.suggestionAvatar}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.suggestionInfo}>
                                        <span className={styles.suggestionName}>{u.name}</span>
                                        <span className={styles.suggestionHandle}>@{u.username}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profil utilisateur en haut à gauche (sous la recherche dans la sidebar) */}
                <Link 
                    to={`/profile/${username}`} 
                    className={styles.sidebarProfile}
                    aria-label="Mon profil"
                    id="sidebar-profile-link"
                >
                    <div className={styles.sidebarAvatar} aria-hidden="true">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.sidebarProfileInfo}>
                        <span className={styles.sidebarProfileName}>Baptiste Noisette</span>
                        <span className={styles.sidebarProfileHandle}>@{username}</span>
                    </div>
                </Link>

                <nav className={styles.sidebarNav} aria-label="Navigation principale">
                    {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                        const isActive = pathname === path
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={[
                                    styles.sidebarItem,
                                    isActive ? styles.sidebarItemActive : '',
                                ].join(' ')}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span>{label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Desktop : bouton notif flottant en haut à droite */}
            <Link 
                to="/notifs" 
                className={styles.desktopNotifBtn}
                aria-label="Notifications"
                id="desktop-notif-btn"
            >
                <Bell size={22} strokeWidth={2} />
                <span className={styles.badge} />
            </Link>
        </div>
    )
}

/** Item de navigation mobile */
function NavItem({ path, icon: Icon, label, active }) {
    return (
        <Link
            to={path}
            className={[styles.navItem, active ? styles.navItemActive : ''].join(' ')}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
        >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
        </Link>
    )
}

export default BottomNav
