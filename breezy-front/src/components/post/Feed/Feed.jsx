import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PostCard        from '../PostCard/PostCard'
import NewBreezeModal  from '../NewBreezeModal/NewBreezeModal'
import { useAuth } from '../../../contexts/AuthContext'
import { getExplore, getFeed, createMessage } from '../../../services/messageService'
import styles from './Feed.module.css'

function parseHashtags(text) {
    const regex = /#(\w+)/g
    const matches = []
    let match
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1])
    }
    return matches
}

const TRENDING_TAGS = ['#Breezy', '#UIDesign', '#WebDev', '#React', '#FrontEnd', '#Glass', '#Vite']
const PAGE_SIZE = 20

const tabStyle = (active) => ({
    flex: 1,
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid rgba(120,100,160,0.15)',
    background: active ? 'var(--brand, #3b8cf0)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary, #5a5a7a)',
    fontWeight: 600,
    cursor: 'pointer',
})

function Feed() {
    const { user } = useAuth()
    const [mode, setMode] = useState('explore') // 'explore' | 'feed'
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [error, setError] = useState('')
    const [isComposerOpen, setIsComposerOpen] = useState(false)

    const fetchPage = useCallback(
        (options) => (mode === 'feed' ? getFeed(options) : getExplore(options)),
        [mode]
    )

    useEffect(() => {
        let cancelled = false
        fetchPage({ limit: PAGE_SIZE })
            .then(list => {
                if (cancelled) return
                setPosts(list)
                setHasMore(list.length === PAGE_SIZE)
            })
            .catch(() => { if (!cancelled) setError("Impossible de charger le fil.") })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [fetchPage])

    const loadMore = useCallback(async () => {
        const last = posts[posts.length - 1]
        if (!last) return
        setLoadingMore(true)
        try {
            const list = await fetchPage({ limit: PAGE_SIZE, before: last.date_publication })
            setPosts(prev => [...prev, ...list])
            setHasMore(list.length === PAGE_SIZE)
        } catch {
            setError("Impossible de charger plus de messages.")
        } finally {
            setLoadingMore(false)
        }
    }, [posts, fetchPage])

    const handlePublish = async (content, media = null, mood = 'cloudy') => {
        if (!user) return
        const image_url = media?.type === 'image' ? media.base64 : null
        const video_url = media?.type === 'video' ? media.base64 : null
        try {
            const created = await createMessage({ content, image_url, video_url, tags: parseHashtags(content), mood })
            const post = {
                ...created,
                author: { _id: user.id, username: user.username, profile_picture: user.profile_picture ?? null },
            }
            setPosts(prev => [post, ...prev])
        } catch {
            alert("Erreur lors de la publication. Veuillez réessayer.")
        }
    }

    const handleModeChange = (newMode) => {
        if (mode === newMode) return
        setLoading(true)
        setError('')
        setPosts([])
        setMode(newMode)
    }

    const emptyText = mode === 'feed'
        ? "Aucun Breeze de vos abonnements. Suivez des gens pour voir leurs messages ici."
        : "Aucun message pour le moment. Soyez le premier ! 🍃"

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

            <div role="tablist" aria-label="Choisir le fil" style={{ display: 'flex', gap: 8, margin: '4px 0 14px' }}>
                <button role="tab" aria-selected={mode === 'explore'} onClick={() => handleModeChange('explore')} style={tabStyle(mode === 'explore')}>
                    Explorer
                </button>
                <button role="tab" aria-selected={mode === 'feed'} onClick={() => handleModeChange('feed')} style={tabStyle(mode === 'feed')}>
                    Abonnements
                </button>
            </div>

            <div className={styles.trendsMobile} aria-label="Tendances" role="list">
                {TRENDING_TAGS.map(tag => (
                    <Link
                        key={tag}
                        to={`/interests?tag=${encodeURIComponent(tag.replace(/^#/, '').toLowerCase())}`}
                        className={styles.trendTag}
                        role="listitem"
                        aria-label={`Tendance ${tag}`}
                    >
                        {tag}
                    </Link>
                ))}
            </div>

            <div className={styles.postList}>
                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>Chargement du fil...</p>
                ) : error ? (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>{error}</p>
                ) : posts.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>{emptyText}</p>
                ) : (
                    <>
                        {posts.map((post, i) => (
                            <PostCard
                                key={post.id_message}
                                post={post}
                                replies={[]}
                                animDelay={i > 0 && i <= 4 ? `anim-delay-${i}` : ''}
                            />
                        ))}
                        {hasMore && (
                            <button
                                className={styles.newBreezyBtn}
                                style={{ margin: '16px auto', display: 'block' }}
                                onClick={loadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'Chargement...' : 'Voir plus'}
                            </button>
                        )}
                    </>
                )}
            </div>

            <NewBreezeModal
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
                onPublish={handlePublish}
            />
        </section>
    )
}

export default Feed
