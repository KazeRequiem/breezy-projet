import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Compass, Tag, Plus, Check, Settings, X } from 'lucide-react'
import TopBar          from '../../components/layout/TopBar/TopBar'
import BottomNav        from '../../components/layout/BottomNav/BottomNav'
import TrendingSection  from '../../components/trending/TrendingSection/TrendingSection'
import PostCard         from '../../components/post/PostCard/PostCard'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import { searchMessagesByTags } from '../../services/messageService'
import styles from './InterestsPage.module.css'

/* Tags proposés dans le panneau de gestion */
const AVAILABLE_TAGS = [
    'breezy', 'uidesign', 'webdev', 'react', 'frontend',
    'design', 'tech', 'art', 'musique', 'sport',
    'voyage', 'cuisine', 'gaming', 'cinema', 'dev',
    'mobile', 'feedback', 'glass', 'vite', 'nature',
]

function loadInitialTags() {
    const storedTags = sessionStorage.getItem('breezy_tags')
    if (storedTags) {
        try { return JSON.parse(storedTags) } catch { return ['breezy', 'webdev', 'react'] }
    }
    const initialTags = ['breezy', 'webdev', 'react', 'nature', 'gaming']
    sessionStorage.setItem('breezy_tags', JSON.stringify(initialTags))
    return initialTags
}

function InterestsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedTags, setSelectedTags] = useState(loadInitialTags)
    const focusTag = searchParams.get('tag')
    const [postsByTag, setPostsByTag] = useState({}) // { tagLower: [posts] }
    const [showManageDrawer, setShowManageDrawer] = useState(false)

    // Charge les posts (via l'API) pour les tags suivis + le tag en focus
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

    const handleSaveTags = (updatedTags) => {
        setSelectedTags(updatedTags)
        sessionStorage.setItem('breezy_tags', JSON.stringify(updatedTags))
        setShowManageDrawer(false)
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
                                <button
                                    className={styles.manageBtn}
                                    onClick={() => setShowManageDrawer(true)}
                                    aria-label="Gérer mes tags favoris"
                                >
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
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

    // Mise à jour de l'état pendant le rendu (recommandé par React à la place d'un useEffect)
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen)
        if (isOpen) {
            setTempTags(selectedTags)
            setSearch('')
        }
    }

    if (!isOpen) return null

    const toggleTempTag = (tag) => {
        setTempTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    }
    const addCustom = () => {
        const clean = search.trim().replace(/^#/, '').toLowerCase()
        if (clean && !tempTags.includes(clean)) setTempTags(prev => [...prev, clean])
        setSearch('')
    }
    const filteredTags = availableTags.filter(tag => tag.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className={styles.drawerOverlay} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }} role="dialog" aria-modal="true">
            <div className={styles.drawerCard} onClick={(e) => e.stopPropagation()} role="presentation">
                <header className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Gérer mes centres d'intérêts</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer le panneau">
                        <X size={18} />
                    </button>
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
                    {filteredTags.length > 0 ? (
                        filteredTags.map(tag => {
                            const isSelected = tempTags.includes(tag)
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    className={[styles.drawerTagOption, isSelected ? styles.drawerTagOptionSelected : ''].join(' ')}
                                    onClick={() => toggleTempTag(tag)}
                                    aria-pressed={isSelected}
                                >
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
