import { useState } from 'react'
import { Plus } from 'lucide-react'
import PostCard        from '../PostCard/PostCard'
import NewBreezeModal  from '../NewBreezeModal/NewBreezeModal'
import styles from './Feed.module.css'

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

const DEMO_POSTS = [
    {
        id_message: 1,
        content: "Premiere sortie avec la nouvelle UI Breezy 🌊 C'est propre, fluide, colore. Exactement ce qu'on voulait.",
        date_publication: new Date(Date.now() - 4  * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        likes_count: 24, replies_count: 2,
        tags: ['Breezy', 'UIDesign'],
        reply_to: null,
        media: {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
            type: "image"
        },
        animDelay: '',
    },
    {
        id_message: 2,
        content: "Trop d'accord ! Le fond qui change doucement c'est mon detail prefere. Ca donne vraiment vie a l'appli ✨",
        date_publication: new Date(Date.now() - 6  * 60 * 1000).toISOString(),
        author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
        likes_count: 11, replies_count: 0,
        tags: [],
        reply_to: { id_message: 1, author: { id_user: 1, username: 'baptistenoisette' } },
        animDelay: 'anim-delay-1',
    },
    {
        id_message: 3,
        content: "Quelqu'un a remarque que le background change en permanence ? C'est subtil mais trop sympa 👀",
        date_publication: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        likes_count: 47, replies_count: 1,
        tags: ['WebDev', 'React'],
        reply_to: null,
        animDelay: 'anim-delay-2',
    },
    {
        id_message: 4,
        content: "Oui ! C'est une animation CSS sur le background, ca tourne en boucle. Le detail fait vraiment la difference.",
        date_publication: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
        author: { id_user: 4, username: 'leaft_', profile_picture: null },
        likes_count: 9, replies_count: 0,
        tags: [],
        reply_to: { id_message: 3, author: { id_user: 3, username: 'tommrc' } },
        animDelay: 'anim-delay-3',
    },
    {
        id_message: 5,
        content: "Est-ce qu'il y aura un mode sombre ? Le fond holographique est beau mais parfois un peu lumineux la nuit 🌙",
        date_publication: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        author: { id_user: 5, username: 'noah_brd', profile_picture: null },
        likes_count: 8, replies_count: 0,
        tags: ['Feedback'],
        reply_to: null,
        animDelay: 'anim-delay-4',
    },
    {
        id_message: 6,
        content: "Absolument d'accord pour la fluidité, le scroll ne saccade pas du tout !",
        date_publication: new Date(Date.now() - 2  * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        likes_count: 5, replies_count: 0,
        tags: [],
        reply_to: { id_message: 1, author: { id_user: 1, username: 'baptistenoisette' } },
        animDelay: 'anim-delay-1',
    }
]

/** Tags de tendance (table `tag`, agrégat via `categorize`) */
const TRENDING_TAGS = ['#Breezy', '#UIDesign', '#WebDev', '#React', '#FrontEnd', '#Glass', '#Vite']

/**
 * Feed : Fil d'actualité principal.
 *
 * Affiche uniquement les posts racines. Les réponses (commentaires)
 * sont révélées en cliquant sur l'icône de commentaires sous le post.
 */
function Feed() {
    const [posts, setPosts] = useState(DEMO_POSTS)
    const [isComposerOpen, setIsComposerOpen] = useState(false)

    const rootPosts = posts.filter(post => post.reply_to === null)

    const getRepliesForPost = (postId) => {
        const direct = posts.filter(post => post.reply_to !== null && post.reply_to.id_message === postId)
        const all = [...direct]
        let queue = [...direct]
        while (queue.length > 0) {
            const current = queue.shift()
            const children = posts.filter(post => post.reply_to !== null && post.reply_to.id_message === current.id_message)
            all.push(...children)
            queue.push(...children)
        }
        return all
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
            animDelay: ''
        }
        setPosts(prev => [newPost, ...prev])
    }

    return (
        <section className={styles.feed} aria-label="Fil d'actualite">
            <div className={styles.feedHeader}>
                <h1 className={styles.feedTitle}>Accueil</h1>
                <button 
                    className={styles.newBreezyBtn} 
                    onClick={() => setIsComposerOpen(true)}
                    id="feed-new-breezy-btn"
                >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Nouveau Breeze</span>
                </button>
            </div>

            {/* Tendances (scroll horizontal mobile, masqué sur desktop) */}
            <div className={styles.trendsMobile} aria-label="Tendances" role="list">
                {TRENDING_TAGS.map(tag => (
                    <button key={tag} className={styles.trendTag} role="listitem" aria-label={`Tendance ${tag}`}>
                        {tag}
                    </button>
                ))}
            </div>

            {/* Liste des posts racines */}
            <div className={styles.postList}>
                {rootPosts.map((post, i) => (
                    <PostCard
                        key={post.id_message}
                        post={post}
                        replies={getRepliesForPost(post.id_message)}
                        animDelay={i > 0 ? `anim-delay-${i}` : ''}
                    />
                ))}
            </div>

            {/* Modal de composition de post */}
            <NewBreezeModal 
                isOpen={isComposerOpen} 
                onClose={() => setIsComposerOpen(false)} 
                onPublish={handlePublish} 
            />
        </section>
    )
}

export default Feed
