import { useState } from 'react'
import { Plus } from 'lucide-react'
import PostCard        from '../PostCard/PostCard'
import NewBreezeModal  from '../NewBreezeModal/NewBreezeModal'
import { useAuth } from '../../../contexts/AuthContext'
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

/** Tags de tendance (table `tag`, agrégat via `categorize`) */
const TRENDING_TAGS = ['#Breezy', '#UIDesign', '#WebDev', '#React', '#FrontEnd', '#Glass', '#Vite']

/**
 * Feed : Fil d'actualité principal.
 *
 * Les posts sont chargés depuis l'API (TODO: GET /api/messages).
 * En attendant, le fil démarre vide.
 */
function Feed() {
    const { user } = useAuth()
    // TODO: remplacer par un appel API GET /api/messages (fil chronologique)
    const [posts, setPosts] = useState([])
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
        if (!user) return
        const newPost = {
            id_message: Date.now(),
            content,
            date_publication: new Date().toISOString(),
            author: { id_user: user.id_user, username: user.username, profile_picture: null },
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
