import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UserX } from 'lucide-react'
import TopBar          from '../../components/layout/TopBar/TopBar'
import BottomNav        from '../../components/layout/BottomNav/BottomNav'
import TrendingSection  from '../../components/trending/TrendingSection/TrendingSection'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import ProfileHeader    from '../../components/profile/ProfileHeader/ProfileHeader'
import ProfileStats     from '../../components/profile/ProfileStats/ProfileStats'
import PostCard         from '../../components/post/PostCard/PostCard'
import NewBreezeModal  from '../../components/post/NewBreezeModal/NewBreezeModal'
import SettingsModal   from '../../components/profile/SettingsModal/SettingsModal'
import { useAuth } from '../../contexts/AuthContext'
import { getUserByUsername } from '../../services/userService'
import { getMessagesByUsername } from '../../services/messageService'
import { getFollowers, getFollowing, followUser, unfollowUser } from '../../services/followService'
import styles from './ProfilePage.module.css'

// Helper pour extraire les hashtags d'un message
function parseHashtags(text) {
    const regex = /#(\w+)/g
    const matches = []
    let match
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1])
    }
    return matches
}

/**
 * ProfilePage : Page de profil utilisateur.
 * Charge le profil via GET /api/users/:username.
 */
function ProfilePage() {
    const { username } = useParams()
    const { user } = useAuth()
    const currentLoggedUser = user?.username ?? null

    // Le username cible : celui de l'URL ou celui connecté
    const targetUsername = username || currentLoggedUser

    const [profileUser,  setProfileUser]  = useState(null)
    const [loading,      setLoading]      = useState(() => !!targetUsername)
    const [notFound,     setNotFound]     = useState(() => !targetUsername)

    const [isComposerOpen, setIsComposerOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [localPosts,     setLocalPosts]     = useState([])
    const [breezesCount,   setBreezesCount]   = useState(0)
    const [isFollowing,    setIsFollowing]    = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)

    const [prevTargetUsername, setPrevTargetUsername] = useState(targetUsername)

    if (targetUsername !== prevTargetUsername) {
        setPrevTargetUsername(targetUsername)
        setProfileUser(null)
        if (!targetUsername) {
            setNotFound(true)
            setLoading(false)
        } else {
            setNotFound(false)
            setLoading(true)
        }
    }

    useEffect(() => {
        if (!targetUsername) return

        let cancelled = false

        async function fetchProfileData() {
            try {
                const data = await getUserByUsername(targetUsername)
                if (cancelled) return

                setProfileUser(data)
                setBreezesCount(data.breezes_count ?? 0)
                setFollowersCount(data.followers_count ?? 0)
                setFollowingCount(data.following_count ?? 0)
                setLocalPosts([])

                // Fetch messages and follow stats in parallel
                const [msgsRes, followersRes, followingRes] = await Promise.allSettled([
                    getMessagesByUsername(targetUsername),
                    getFollowers(data.id),
                    getFollowing(data.id)
                ])

                if (cancelled) return

                if (msgsRes.status === 'fulfilled' && Array.isArray(msgsRes.value)) {
                    const author = { _id: data.id, username: data.username, profile_picture: data.profile_picture }
                    const withAuthor = msgsRes.value.map(m => ({ ...m, author }))
                    setLocalPosts(withAuthor)
                    setBreezesCount(withAuthor.length)
                }

                if (followersRes.status === 'fulfilled' && Array.isArray(followersRes.value)) {
                    setFollowersCount(followersRes.value.length)
                    setIsFollowing(followersRes.value.some(f => f.follower?._id === user?.id))
                }

                if (followingRes.status === 'fulfilled' && Array.isArray(followingRes.value)) {
                    setFollowingCount(followingRes.value.length)
                }

            } catch {
                if (!cancelled) setNotFound(true)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchProfileData()

        return () => { cancelled = true }
    }, [targetUsername, user?.id])

    const handleToggleFollow = async () => {
        if (!profileUser) return
        const next = !isFollowing
        setIsFollowing(next)
        setFollowersCount(c => c + (next ? 1 : -1))
        try {
            if (next) await followUser(profileUser.id)
            else await unfollowUser(profileUser.id)
        } catch {
            setIsFollowing(!next)
            setFollowersCount(c => c + (next ? -1 : 1))
        }
    }

    const handlePublish = (content, media = null, mood = 'cloudy') => {
        if (!user) return
        const newPost = {
            id_message: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            content,
            date_publication: new Date().toISOString(),
            author: { id_user: user.id, username: user.username, profile_picture: null },
            likes_count: 0,
            replies_count: 0,
            tags: parseHashtags(content),
            reply_to: null,
            media,
            mood,
        }
        setLocalPosts(prev => [newPost, ...prev])
        setBreezesCount(prev => prev + 1)
    }

    // Chargement
    if (loading) {
        return (
            <div className={styles.wrapper}>
                <div className="breezy-bg" aria-hidden="true" />
                <BreezyAtmosphere />
                <TopBar />
                <BottomNav />
                <div className={styles.layout}>
                    <main className={styles.mainColumn} role="main">
                        <div className={[styles.notFoundCard, 'anim-fade-up'].join(' ')}>
                            <p style={{ color: 'var(--text-secondary)' }}>Chargement du profil…</p>
                        </div>
                    </main>
                    <aside className={styles.rightColumn} aria-label="Tendances">
                        <TrendingSection />
                    </aside>
                </div>
            </div>
        )
    }

    // Profil introuvable
    if (notFound || !profileUser) {
        return (
            <div className={styles.wrapper}>
                <div className="breezy-bg" aria-hidden="true" />
                <BreezyAtmosphere />
                <TopBar />
                <BottomNav />

                <div className={styles.layout}>
                    <main className={styles.mainColumn} role="main">
                        <div className={[styles.notFoundCard, 'anim-fade-up'].join(' ')}>
                            <UserX size={48} strokeWidth={1.5} color="var(--brand)" />
                            <h1 className={styles.notFoundTitle}>Profil introuvable</h1>
                            <p className={styles.notFoundText}>
                                L'utilisateur <strong>@{targetUsername}</strong> n'existe pas ou son compte a été supprimé.
                            </p>
                            <Link to="/feed" className={styles.backHomeBtn}>
                                Retourner à l'accueil
                            </Link>
                        </div>
                    </main>

                    <aside className={styles.rightColumn} aria-label="Tendances">
                        <TrendingSection />
                    </aside>
                </div>
            </div>
        )
    }

    const isOwn = currentLoggedUser
        ? targetUsername.toLowerCase() === currentLoggedUser.toLowerCase()
        : false

    return (
        <div className={styles.wrapper}>
            <div className="breezy-bg" aria-hidden="true" />
            <BreezyAtmosphere />
            <TopBar />
            <BottomNav />

            <div className={styles.layout}>
                <main className={styles.mainColumn} role="main">

                    {/* Carte de profil complète */}
                    <section className={[styles.profileCard, 'anim-fade-up'].join(' ')} aria-label="Profil utilisateur">

                        {/* Bannière + avatar + bio + boutons */}
                        <ProfileHeader
                            user={profileUser}
                            isOwn={isOwn}
                            isFollowing={isFollowing}
                            onFollow={handleToggleFollow}
                            onEdit={() => {}}
                            onSettings={() => setIsSettingsOpen(true)}
                            onNewPost={() => setIsComposerOpen(true)}
                        />

                        {/* Compteurs */}
                        <div className={styles.statsWrap}>
                            <ProfileStats
                                breezesCount={breezesCount}
                                followersCount={followersCount}
                                followingCount={followingCount}
                            />
                        </div>
                    </section>

                    {/* Liste des derniers posts */}
                    <section className={styles.postsSection} aria-label="Derniers Breezes">
                        <h2 className={styles.sectionTitle}>Derniers Breezes</h2>
                        <div className={styles.postList}>
                            {localPosts.length === 0 ? (
                                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Aucun message publié.
                                </p>
                            ) : (
                                localPosts.map((post, i) => (
                                    <PostCard
                                        key={post.id_message}
                                        post={post}
                                        replies={post.replies || []}
                                        animDelay={`anim-delay-${i + 1}`}
                                        editable={isOwn}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Modal de composition de post */}
                    <NewBreezeModal
                        isOpen={isComposerOpen}
                        onClose={() => setIsComposerOpen(false)}
                        onPublish={handlePublish}
                    />

                    {/* Modal des paramètres (déconnexion, mot de passe) */}
                    <SettingsModal
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                    />

                </main>

                {/* Tendances desktop */}
                <aside className={styles.rightColumn} aria-label="Tendances">
                    <TrendingSection />
                </aside>
            </div>
        </div>
    )
}

export default ProfilePage
