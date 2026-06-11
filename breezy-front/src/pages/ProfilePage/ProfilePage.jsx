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

// Base de données de démonstration d'utilisateurs et de leurs posts (avec commentaires de démo)
const MOCK_USERS = {
    baptistenoisette: {
        username:     'baptistenoisette',
        bio:          'Dev web, café addict et explorateur de code propre. Paris.',
        location:     'Paris, France',
        banner_color: '#e88a8a',
        breezes_count:   3,
        followers_count: 286,
        following_count: 379,
        posts: [
            {
                id_message: 201,
                content: "Breezy est rapide et léger — exactement ce qu'il faut pour coder depuis un café avec du mauvais wifi.",
                date_publication: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
                likes_count: 28, replies_count: 2,
                tags: ['Breezy', 'Dev'],
                reply_to: null,
                replies: [
                    {
                        id_message: 2011,
                        content: "Tellement vrai ! Un bon café et du code, le paradis ☕💻",
                        date_publication: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
                        author: { id_user: 2, username: 'camille_lrt', profile_picture: null }
                    },
                    {
                        id_message: 2012,
                        content: "Et le mode offline, vous y avez pensé ?",
                        date_publication: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                        author: { id_user: 3, username: 'tommrc', profile_picture: null }
                    }
                ]
            },
            {
                id_message: 202,
                content: 'JWT courte durée + refresh token = le combo parfait pour vos APIs. Ne faites pas confiance aux sessions longues.',
                date_publication: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
                likes_count: 2, replies_count: 4,
                tags: ['WebDev', 'Tech'],
                reply_to: null,
                replies: [
                    {
                        id_message: 2021,
                        content: "Tout à fait d'accord, la sécurité avant tout !",
                        date_publication: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
                        author: { id_user: 3, username: 'tommrc', profile_picture: null }
                    },
                    {
                        id_message: 2022,
                        content: "Tu utilises quoi pour gérer le refresh token côté client ?",
                        date_publication: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        author: { id_user: 4, username: 'leaft_', profile_picture: null }
                    },
                    {
                        id_message: 2023,
                        content: "Un article de blog sur le sujet bientôt ?",
                        date_publication: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                        author: { id_user: 5, username: 'noah_brd', profile_picture: null }
                    },
                    {
                        id_message: 2024,
                        content: "Perso je stocke le refresh token en httpOnly cookie. Le plus sûr.",
                        date_publication: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        author: { id_user: 12, username: 'hugo_designer', profile_picture: null }
                    }
                ]
            },
            {
                id_message: 203,
                content: "Dark mode = moins de fatigue oculaire. Light mode = les utilisateurs qui confondent leur écran avec une fenêtre. 😂",
                date_publication: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
                likes_count: 1037, replies_count: 0,
                tags: ['UIDesign', 'Design'],
                reply_to: null,
            },
        ]
    },
    camille_lrt: {
        username:     'camille_lrt',
        bio:          'Product Designer & passionnée d\'interfaces fluides. 🎨✨',
        location:     'Lyon, France',
        banner_color: 'linear-gradient(135deg, #b490ca 0%, #e88a8a 100%)',
        breezes_count:   2,
        followers_count: 412,
        following_count: 188,
        posts: [
            {
                id_message: 301,
                content: "Trop d'accord ! Le fond qui change doucement c'est mon detail prefere. Ca donne vraiment vie a l'appli ✨",
                date_publication: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
                author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
                likes_count: 11, replies_count: 0,
                tags: ['UI', 'Design'],
                reply_to: { id_message: 1, author: { id_user: 1, username: 'baptistenoisette' } },
            },
            {
                id_message: 302,
                content: "En train de bosser sur les maquettes du profil utilisateur... Le glassmorphism rend tellement bien sur grand écran.",
                date_publication: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
                likes_count: 45, replies_count: 0,
                tags: ['UIDesign', 'Breezy'],
                reply_to: null,
            }
        ]
    },
    tommrc: {
        username:     'tommrc',
        bio:          'Fullstack Dev | Fan de React & Node.js. Codeur nocturne.',
        location:     'Nantes, France',
        banner_color: 'linear-gradient(135deg, #7ec8e3 0%, #3b8cf0 100%)',
        breezes_count:   1,
        followers_count: 98,
        following_count: 145,
        posts: [
            {
                id_message: 401,
                content: "Quelqu'un a remarque que le background change en permanence ? C'est subtil mais trop sympa 👀",
                date_publication: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
                author: { id_user: 3, username: 'tommrc', profile_picture: null },
                likes_count: 47, replies_count: 0,
                tags: ['WebDev', 'React'],
                reply_to: null,
            }
        ]
    },
    leaft_: {
        username:     'leaft_',
        bio:          'Créateur de solutions CSS élégantes et d\'animations fluides.',
        location:     'Bordeaux, France',
        banner_color: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)',
        breezes_count:   1,
        followers_count: 154,
        following_count: 89,
        posts: [
            {
                id_message: 501,
                content: "Oui ! C'est une animation CSS sur le background, ca tourne en boucle. Le detail fait vraiment la difference.",
                date_publication: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
                author: { id_user: 4, username: 'leaft_', profile_picture: null },
                likes_count: 9, replies_count: 0,
                tags: ['CSS', 'Animation'],
                reply_to: { id_message: 3, author: { id_user: 3, username: 'tommrc' } },
            }
        ]
    },
    noah_brd: {
        username:     'noah_brd',
        bio:          'Étudiant en informatique & curieux de tout. Tech lover.',
        location:     'Lille, France',
        banner_color: 'linear-gradient(135deg, #FBD3E9 0%, #BB9FDF 100%)',
        breezes_count:   1,
        followers_count: 67,
        following_count: 132,
        posts: [
            {
                id_message: 601,
                content: "Est-ce qu'il y aura un mode sombre ? Le fond holographique est beau mais parfois un peu lumineux la nuit 🌙",
                date_publication: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                author: { id_user: 5, username: 'noah_brd', profile_picture: null },
                likes_count: 8, replies_count: 0,
                tags: ['Feedback'],
                reply_to: null,
            }
        ]
    }
}

// Fonction pour récupérer un utilisateur existant
const getMockUser = (username) => {
    const key = username.toLowerCase()
    return MOCK_USERS[key] || null
}

/**
 * ProfilePage — Page de profil utilisateur (Fx4, Fx10, Fx11).
 *
 * Affiche la bannière, l'avatar, la bio, les stats et les derniers posts.
 * Charge les données de l'utilisateur passé dans l'URL.
 */
function ProfilePage() {
    const { username } = useParams()
    const currentLoggedUser = 'baptistenoisette' // L'utilisateur connecté

    const profileUser = getMockUser(username || currentLoggedUser)

    const [userPosts, setUserPosts] = useState([])
    const [isComposerOpen, setIsComposerOpen] = useState(false)
    
    // Gérer l'état de follow par utilisateur
    const [follows, setFollows] = useState({})
    const isFollowing = profileUser ? !!follows[profileUser.username.toLowerCase()] : false

    useEffect(() => {
        if (profileUser) {
            setUserPosts(profileUser.posts)
        } else {
            setUserPosts([])
        }
    }, [username, profileUser])

    const toggleFollow = () => {
        if (!profileUser) return
        setFollows(prev => ({
            ...prev,
            [profileUser.username.toLowerCase()]: !prev[profileUser.username.toLowerCase()]
        }))
    }

    const handlePublish = (content, media = null) => {
        const newPost = {
            id_message: Date.now(),
            content,
            date_publication: new Date().toISOString(),
            author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
            likes_count: 0,
            replies_count: 0,
            tags: parseHashtags(content),
            reply_to: null,
            media,
        }
        setUserPosts(prev => [newPost, ...prev])
        if (profileUser) {
            profileUser.breezes_count = (profileUser.breezes_count || 0) + 1
        }
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

    const isOwn = (username || currentLoggedUser).toLowerCase() === currentLoggedUser.toLowerCase()

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
                                breezesCount={userPosts.length}
                                followersCount={profileUser.followers_count + (isFollowing ? 1 : 0)}
                                followingCount={profileUser.following_count}
                            />
                        </div>
                    </section>

                    {/* Liste des derniers posts */}
                    <section className={styles.postsSection} aria-label="Derniers Breezes">
                        <h2 className={styles.sectionTitle}>Derniers Breezes</h2>
                        <div className={styles.postList}>
                            {userPosts.length === 0 ? (
                                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Aucun message publié.
                                </p>
                            ) : (
                                userPosts.map((post, i) => (
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
