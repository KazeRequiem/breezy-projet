import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Search, Bell, ShieldCheck, User } from 'lucide-react'
import logoBreezy from '../../../assets/logo-breezy.png'
import { useAuth } from '../../../contexts/AuthContext'
import { searchUsers } from '../../../services/userService'
import { searchMessagesByTags } from '../../../services/messageService'
import RequireRole from '../../ui/RequireRole/RequireRole'
import styles from './BottomNav.module.css'

// Liens de la navigation principale
const NAV_ITEMS = [
    { path: '/feed',      icon: Home,    label: 'Accueil' },
    { path: '/interests', icon: Compass, label: 'Intérêts' },
]

// Navigation principale (barre mobile en bas, sidebar desktop à gauche)
function BottomNav() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const username = user?.username ?? ''
    const profilePicture = user?.profile_picture ?? null

    let avatarContent
    if (profilePicture) {
        avatarContent = <img src={profilePicture} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
    } else if (username) {
        avatarContent = username.charAt(0).toUpperCase()
    } else {
        avatarContent = <User size={20} strokeWidth={1.8} />
    }

    let sidebarAvatarContent
    if (profilePicture) {
        sidebarAvatarContent = <img src={profilePicture} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
    } else if (username) {
        sidebarAvatarContent = username.charAt(0).toUpperCase()
    } else {
        sidebarAvatarContent = '?'
    }

    // États recherche
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [searchMode, setSearchMode] = useState('users') // 'users' | 'tags'
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    const searchContainerRef = useRef(null)
    const mobileSearchInputRef = useRef(null)
    const debounceRef = useRef(null)

    // Recherche API
    const debouncedSearch = useCallback((query) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        const q = query.trim()
        if (!q) {
            setSuggestions([])
            return
        }
        const isTag = q.startsWith('#')
        setSearchMode(isTag ? 'tags' : 'users')
        debounceRef.current = setTimeout(async () => {
            try {
                const results = isTag ? await searchMessagesByTags(q) : await searchUsers(q)
                setSuggestions(results)
            } catch {
                setSuggestions([])
            }
        }, 300)
    }, [])

    // Focus automatique quand la recherche mobile s'ouvre
    useEffect(() => {
        if (mobileSearchOpen && mobileSearchInputRef.current) {
            mobileSearchInputRef.current.focus()
        }
    }, [mobileSearchOpen])

    // Fermer la recherche et les suggestions lors d'un clic extérieur
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false)
                setMobileSearchOpen(false)
                setSearchQuery('')
                setSuggestions([])
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Nettoyage du timeout au démontage
    useEffect(() => {
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [])

    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchQuery(value)
        setShowSuggestions(true)
        debouncedSearch(value)
    }

    const handleSelectUser = (userUsername) => {
        setSearchQuery('')
        setSuggestions([])
        setShowSuggestions(false)
        setMobileSearchOpen(false)
        navigate(`/profile/${userUsername}`)
    }

    const handleCloseMobileSearch = () => {
        setMobileSearchOpen(false)
        setSearchQuery('')
        setSuggestions([])
        setShowSuggestions(false)
    }

    return (
        <div ref={searchContainerRef}>
            {/* Suggestions mobiles (au-dessus de la bottomNav) */}
            {mobileSearchOpen && showSuggestions && suggestions.length > 0 && (
                <div className={[styles.suggestionsMobile, 'anim-fade-up'].join(' ')}>
                    <SuggestionList suggestions={suggestions} onSelect={handleSelectUser} mode={searchMode} />
                </div>
            )}
            
            {/* Mobile : bottom bar */}
            <nav className={[styles.bottomNav, mobileSearchOpen ? styles.bottomNavExpanded : ''].join(' ')} aria-label="Navigation principale">
                <NavItem path="/feed"      icon={Home}    label="Accueil"   active={pathname === '/feed'} />
                <NavItem path="/interests" icon={Compass} label="Intérêts"  active={pathname === '/interests'} />
                
                {/* Bouton profil (3ème position) */}
                <Link
                    to={username ? `/profile/${username}` : '/login'}
                    className={styles.navItemBtn}
                    aria-label="Mon profil"
                    id="bottomnav-profile"
                >
                    <div className={styles.navAvatar} aria-hidden="true">
                        {avatarContent}
                    </div>
                </Link>

                {/* Recherche rétractable (4ème position) */}
                {mobileSearchOpen ? (
                    <div className={styles.searchInputWrapper} role="search">
                        <button 
                            className={styles.navItemBtn} 
                            onClick={handleCloseMobileSearch}
                            aria-label="Fermer la recherche"
                            type="button"
                            style={{ width: 'auto', padding: '0 4px', color: 'var(--text-primary)' }}
                        >
                            <Search size={22} strokeWidth={1.8} />
                        </button>
                        <input
                            ref={mobileSearchInputRef}
                            id="search-mobile"
                            type="text"
                            placeholder="Rechercher (@pseudo ou #tag)…"
                            aria-label="Champ de recherche"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSuggestions(true)}
                            autoComplete="off"
                        />
                    </div>
                ) : (
                    <button
                        className={styles.navItemBtn}
                        onClick={() => setMobileSearchOpen(true)}
                        aria-label="Rechercher"
                        type="button"
                    >
                        <Search size={22} strokeWidth={1.8} />
                    </button>
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
                            placeholder="Rechercher (@pseudo ou #tag)…"
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
                            <SuggestionList suggestions={suggestions} onSelect={handleSelectUser} mode={searchMode} />
                        </div>
                    )}
                </div>

                {/* Profil utilisateur en haut à gauche (sous la recherche dans la sidebar) */}
                <Link 
                    to={username ? `/profile/${username}` : '/login'}
                    className={styles.sidebarProfile}
                    aria-label="Mon profil"
                    id="sidebar-profile-link"
                >
                    <div className={styles.sidebarAvatar} aria-hidden="true">
                        {sidebarAvatarContent}
                    </div>
                    <div className={styles.sidebarProfileInfo}>
                        <span className={styles.sidebarProfileName}>{username || 'Invité'}</span>
                        <span className={styles.sidebarProfileHandle}>{username ? `@${username}` : ''}</span>
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

                    {/* Lien Admin dans la sidebar desktop — admin/moderator uniquement */}
                    <RequireRole allowedRoles={['admin', 'moderator']}>
                        <Link
                            to="/admin"
                            className={[
                                styles.sidebarItem,
                                pathname === '/admin' ? styles.sidebarItemActive : '',
                            ].join(' ')}
                            aria-current={pathname === '/admin' ? 'page' : undefined}
                            id="sidebar-admin-link"
                        >
                            <ShieldCheck size={20} strokeWidth={pathname === '/admin' ? 2.5 : 1.8} />
                            <span>Admin</span>
                        </Link>
                    </RequireRole>
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

/** Liste de suggestions de recherche (partagée mobile / desktop) */
function SuggestionList({ suggestions, onSelect, mode = 'users' }) {
    if (mode === 'tags') {
        return suggestions.map(post => {
            const author = post.author || {}
            return (
                <button
                    key={post.id_message || post._id}
                    className={styles.suggestionItem}
                    onClick={() => author.username && onSelect(author.username)}
                >
                    <div className={styles.suggestionAvatar}>
                        {author.profile_picture
                            ? <img src={author.profile_picture} alt={author.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : (author.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.suggestionInfo}>
                        <span className={styles.suggestionName}>{(post.content || '').slice(0, 40) || 'Post'}</span>
                        <span className={styles.suggestionHandle}>@{author.username || 'inconnu'}</span>
                    </div>
                </button>
            )
        })
    }
    return suggestions.map(u => (
        <button
            key={u.username}
            className={styles.suggestionItem}
            onClick={() => onSelect(u.username)}
        >
            <div className={styles.suggestionAvatar}>
                {u.profile_picture
                    ? <img src={u.profile_picture} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : u.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.suggestionInfo}>
                <span className={styles.suggestionName}>{u.username}</span>
                <span className={styles.suggestionHandle}>@{u.username}</span>
            </div>
        </button>
    ))
}

export default BottomNav
