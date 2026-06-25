import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Compass, Tag, Plus, Check, Settings, X } from 'lucide-react'
import TopBar          from '../../components/layout/TopBar/TopBar'
import BottomNav        from '../../components/layout/BottomNav/BottomNav'
import TrendingSection  from '../../components/trending/TrendingSection/TrendingSection'
import PostCard         from '../../components/post/PostCard/PostCard'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import { useAuth } from '../../contexts/AuthContext'
import { searchMessagesByTags } from '../../services/messageService'
import { updateProfile } from '../../services/userService'
import styles from './InterestsPage.module.css'

/* Tags proposés dans le panneau (en plus de ceux déjà suivis) */
const AVAILABLE_TAGS = [
    'breezy', 'uidesign', 'webdev', 'react', 'frontend',
    'design', 'tech', 'art', 'musique', 'sport',
    'voyage', 'cuisine', 'gaming', 'cinema', 'dev',
    'mobile', 'feedback', 'glass', 'vite', 'nature',
]

function InterestsPage() {
    const { user, updateUser } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    // Les tags suivis viennent du compte (choisis à l'inscription / édités ici)
    const [selectedTags, setSelectedTags] = useState(() => Array.isArray(user?.tags) ? user.tags : [])
    const [focusTag, setFocusTag] = useState(searchParams.get('tag'))
    const [postsByTag, setPostsByTag] = useState({})
    const [showManageDrawer, setShowManageDrawer] = useState(false)

    // Synchronise avec les tags du compte si l'utilisateur change
    useEffect(() => {
        if (Array.isArray(user?.tags)) setSelectedTags(user.tags)
    }, [user?.tags])

    // L'URL (?tag=) pilote le focus
    useEffect(() => { setFocusTag(searchParams.get('tag')) }, [searchParams])

    // Charge les posts (API) pour les tags suivis + le tag en focus
    useEffect(() => {
        let cancelled = false
        const toLoad = [...new Set([...selectedTags, ...(focusTag ? [focusTag] : [])].map(t => t.toLowerCase()))]
        toLoad.forEach(tag => {
            searchMessagesByTags([tag])
                .then(list => { if (!cancelled) setPostsByTag(prev => ({ ...prev, [tag]: list })) })
                .catch(() => {})
        })
        return () => { cancelled = true }
    }, [selectedTags, focusTag])

    const getPostsForTag = (tag) => postsByTag[tag.toLowerCase()] || []
    const openFocus = (tag) => setSearchParams({ tag })
    const closeFocus = () => setSearchParams({})

    // Sauvegarde les tags suivis sur le compte
    const handleSaveTags = async (updatedTags) => {
        setSelectedTags(updatedTags)
        setShowManageDrawer(false)
        try {
            const updated = await updateProfile({ tags: updatedTags })
            updateUser({ tags: updated.tags ?? updatedTags })
        } catch {
            // on garde l'affichage local même si la persistance échoue
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className="breezy-bg" aria-hidden="true" />
            <BreezyAtmosphere />
            <TopBar />
            <BottomNav />

            <div className={styles.layout}>
                <main className={styles.mainColumn} role="main">
                    {focusTag ? (
                        <div className={styles.focusContainer}>
                            <button className={styles.backBtn} onClick={closeFocus}>
                                <ArrowLeft size={16} />
                                Retour aux centres d'intérêts
                            </button>
                            <header className={styles.focusHeader}>
                                <div className={styles.tagTitleGroup}>
                                    <Tag size={20} className={styles.tagIcon} />
                                    <h1 className={styles.focusTitle}>#{focusTag}</h1>
                                </div>
                                <span className={styles.focusCount}>
                                    {getPostsForTag(focusTag).length} publication{getPostsForTag(focusTag).length > 1 ? 's' : ''}
                                </span>
                            </header>
                            <div className={styles.verticalFeed}>
                                {getPostsForTag(focusTag).length > 0 ? (
                                    getPostsForTag(focusTag).map(post => (
                                        <PostCard key={post.id_message} post={post} replies={[]} />
                                    ))
                                ) : (
                                    <div className={styles.emptyBox}>
                                        <p>Aucun post n'a encore été publié avec ce tag.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.overviewContainer}>
                            <header className={styles.pageHeader}>
                                <div className={styles.titleGroup}>
                                    <Compass size={24} className={styles.compassIcon} />
                                    <h1 className={styles.pageTitle}>Mes centres d'intérêts</h1>
                                </div>
                                <button className={styles.manageBtn} onClick={() => setShowManageDrawer(true)} aria-label="Gérer mes tags favoris">
                                    <Settings size={15} />
                                    Gérer mes tags
                                </button>
                            </header>

                            {selectedTags.length > 0 ? (
                                <div className={styles.rowsContainer}>
                                    {selectedTags.map(tag => (
                                        <TagRow key={tag} tag={tag} posts={getPostsForTag(tag)} onVoirPlus={openFocus} />
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noTagsBox}>
                                    <Compass size={40} className={styles.noTagsIcon} />
                                    <p>Vous ne suivez aucun centre d'intérêt pour le moment.</p>
                                    <button className={styles.addTagsBtn} onClick={() => setShowManageDrawer(true)}>
                                        <Plus size={16} />
                                        Choisir des tags
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <aside className={styles.rightColumn} aria-label="Tendances et suggestions">
                    <TrendingSection />
                </aside>
            </div>

            <TagDrawer
                isOpen={showManageDrawer}
                onClose={() => setShowManageDrawer(false)}
                availableTags={AVAILABLE_TAGS}
                selectedTags={selectedTags}
                onSave={handleSaveTags}
            />
        </div>
    )
}

function TagRow({ tag, posts, onVoirPlus }) {
    return (
        <section className={styles.tagSection} aria-label={`Tag ${tag}`}>
            <header className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>#{tag}</h2>
                <button className={styles.voirPlusBtn} onClick={() => onVoirPlus(tag)} aria-label={`Voir plus de posts pour #${tag}`}>
                    <span>Voir plus</span>
                    <ChevronRight size={14} />
                </button>
            </header>
            <div className={styles.horizontalScroll} role="list">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id_message} className={styles.scrollItem} role="listitem">
                            <PostCard post={post} compact={true} replies={[]} />
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyPill}>Pas encore de post récent pour #{tag}</div>
                )}
            </div>
        </section>
    )
}

function TagDrawer({ isOpen, onClose, availableTags, selectedTags, onSave }) {
    const [tempTags, setTempTags] = useState(selectedTags)
    const [search, setSearch] = useState('')

    useEffect(() => { if (isOpen) { setTempTags(selectedTags); setSearch('') } }, [isOpen, selectedTags])

    if (!isOpen) return null

    const toggleTempTag = (tag) => setTempTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    const addCustom = () => {
        const clean = search.trim().replace(/^#/, '').toLowerCase()
        if (clean && !tempTags.includes(clean)) setTempTags(prev => [...prev, clean])
        setSearch('')
    }
    const options = [...new Set([...selectedTags, ...availableTags])]
    const filtered = options.filter(tag => tag.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className={styles.drawerOverlay} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }} role="dialog" aria-modal="true">
            <div className={styles.drawerCard} onClick={(e) => e.stopPropagation()} role="presentation">
                <header className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Gérer mes centres d'intérêts</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer le panneau"><X size={18} /></button>
                </header>

                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Rechercher ou ajouter un tag…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                        aria-label="Rechercher ou ajouter un tag"
                    />
                </div>

                <div className={styles.drawerTagsGrid}>
                    {filtered.length > 0 ? (
                        filtered.map(tag => {
                            const isSelected = tempTags.includes(tag)
                            return (
                                <button key={tag} type="button"
                                    className={[styles.drawerTagOption, isSelected ? styles.drawerTagOptionSelected : ''].join(' ')}
                                    onClick={() => toggleTempTag(tag)} aria-pressed={isSelected}>
                                    {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                                    {tag}
                                </button>
                            )
                        })
                    ) : (
                        <button type="button" className={styles.drawerTagOption} onClick={addCustom}>
                            <Plus size={12} /> Ajouter « {search.trim().replace(/^#/, '').toLowerCase()} »
                        </button>
                    )}
                </div>

                <footer className={styles.drawerFooter}>
                    <button className={styles.saveBtn} onClick={() => onSave(tempTags)}>
                        Terminer ({tempTags.length} sélectionné{tempTags.length > 1 ? 's' : ''})
                    </button>
                </footer>
            </div>
        </div>
    )
}

export default InterestsPage
