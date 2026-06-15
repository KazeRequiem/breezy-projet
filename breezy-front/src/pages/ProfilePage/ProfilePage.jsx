import { useState } from 'react'
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
import { useAuth } from '../../contexts/AuthContext'
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

// TODO : remplacer par un appel API GET /api/users/:username
// (profils et posts chargés depuis la base de données)
const getMockUser = () => null

/**
 * ProfilePage : Page de profil utilisateur (Fx4, Fx10, Fx11).
 *
 * Affiche la bannière, l'avatar, la bio, les stats et les derniers posts.
 * Charge les données de l'utilisateur passé dans l'URL.
 */
function ProfilePage() {
    const { username } = useParams()
    const { user } = useAuth()
    const currentLoggedUser = user?.username ?? null

    const profileUser = getMockUser()

    // Posts dérivés directement depuis profileUser (pas de state redondant)
    const userPosts = profileUser ? profileUser.posts : []

    const [isComposerOpen, setIsComposerOpen] = useState(false)
    const [localPosts, setLocalPosts] = useState(userPosts)
    const [breezesCount, setBreezesCount] = useState(profileUser?.breezes_count ?? 0)
    
    // Gérer l'état de follow par utilisateur
    const [follows, setFollows] = useState({})
    const isFollowing = profileUser ? !!follows[profileUser.username.toLowerCase()] : false

    const toggleFollow = () => {
        if (!profileUser) return
        setFollows(prev => ({
            ...prev,
            [profileUser.username.toLowerCase()]: !prev[profileUser.username.toLowerCase()]
        }))
    }

    const handlePublish = (content, media = null) => {
        if (!user) return
        const newPost = {
            id_message: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            content,
            date_publication: new Date().toISOString(),
            author: { id_user: user.id_user, username: user.username, profile_picture: null },
            likes_count: 0,
            replies_count: 0,
            tags: parseHashtags(content),
            reply_to: null,
            media,
        }
        setLocalPosts(prev => [newPost, ...prev])
        setBreezesCount(prev => prev + 1)
    }

    // Si le profil n'existe pas, on affiche un état "profil introuvable"
    if (!profileUser) {
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
                                L'utilisateur <strong>@{username}</strong> n'existe pas ou son compte a été supprimé.
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
        ? (username || currentLoggedUser).toLowerCase() === currentLoggedUser.toLowerCase()
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
                            onFollow={toggleFollow}
                            onEdit={() => {}}
                            onNewPost={() => setIsComposerOpen(true)}
                        />

                        {/* Compteurs */}
                        <div className={styles.statsWrap}>
                            <ProfileStats
                                breezesCount={breezesCount}
                                followersCount={profileUser.followers_count + (isFollowing ? 1 : 0)}
                                followingCount={profileUser.following_count}
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
