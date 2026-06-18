import { useState, useMemo } from 'react'
import { ChevronRight, ArrowLeft, Compass, Tag, Plus, Check, Settings, X } from 'lucide-react'
import TopBar          from '../../components/layout/TopBar/TopBar'
import BottomNav        from '../../components/layout/BottomNav/BottomNav'
import TrendingSection  from '../../components/trending/TrendingSection/TrendingSection'
import PostCard         from '../../components/post/PostCard/PostCard'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import styles from './InterestsPage.module.css'

/* Tags disponibles (aligné sur RegisterPage) */
const AVAILABLE_TAGS = [
    'Breezy', 'UIDesign', 'WebDev', 'React', 'FrontEnd',
    'Design', 'Tech', 'Art', 'Musique', 'Sport',
    'Voyage', 'Cuisine', 'Gaming', 'Cinema', 'Dev',
    'Mobile', 'Feedback', 'Glass', 'Vite', 'Nature',
]

import { USE_MOCK, DEMO_POSTS } from '../../services/mockData'

// Posts pour la page Intérêts — alimenté par les mock data ou vide en attendant l'API
const INTERESTS_POSTS = USE_MOCK ? DEMO_POSTS : []

// Lecture initiale du sessionStorage (lazy initializer, exécuté une seule fois)
// sessionStorage préféré à localStorage : effacé à la fermeture de l'onglet
function loadInitialTags() {
    const storedTags = sessionStorage.getItem('breezy_tags')
    if (storedTags) {
        try {
            return JSON.parse(storedTags)
        } catch {
            return ['Breezy', 'UIDesign', 'WebDev']
        }
    }
    const initialTags = ['Breezy', 'UIDesign', 'WebDev', 'Nature', 'Gaming']
    sessionStorage.setItem('breezy_tags', JSON.stringify(initialTags))
    return initialTags
}

// Page principale pour afficher les posts par centre d'intérêt
function InterestsPage() {
    // Initialisation depuis sessionStorage via lazy initializer
    const [selectedTags, setSelectedTags] = useState(loadInitialTags)
    const [focusTag, setFocusTag] = useState(null)
    const [showManageDrawer, setShowManageDrawer] = useState(false)

    // Pré-calcul de la map de replies (même pattern optimisé que Feed.jsx)
    const repliesMap = useMemo(() => {
        const map = new Map()
        for (const post of INTERESTS_POSTS) {
            if (post.reply_to !== null) {
                const parentId = post.reply_to.id_message
                if (!map.has(parentId)) map.set(parentId, [])
                map.get(parentId).push(post)
            }
        }
        const fullMap = new Map()
        for (const root of INTERESTS_POSTS.filter(p => p.reply_to === null)) {
            const all = []
            const queue = [root.id_message]
            while (queue.length > 0) {
                const parentId = queue.shift()
                const children = map.get(parentId) || []
                for (const child of children) {
                    all.push(child)
                    queue.push(child.id_message)
                }
            }
            fullMap.set(root.id_message, all)
        }
        return fullMap
    }, [])

    // Filtre les posts associés à un tag (sans sensible à la casse) et exclut les réponses
    const getPostsForTag = (tag) => {
        return INTERESTS_POSTS.filter(post =>
            post.reply_to === null &&
            post.tags &&
            post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        )
    }

    // Sauvegarde les tags et ferme la boîte de dialogue
    const handleSaveTags = (updatedTags) => {
        setSelectedTags(updatedTags)
        sessionStorage.setItem('breezy_tags', JSON.stringify(updatedTags))
        setShowManageDrawer(false)
    }

    return (
        <div className={styles.wrapper}>
            {/* Arrière-plan holographique */}
            <div className="breezy-bg" aria-hidden="true" />

            {/* Atmosphère décorative (halos, vent) */}
            <BreezyAtmosphere />

            {/* Navigations principales */}
            <TopBar />
            <BottomNav />

            {/* Contenu principal */}
            <div className={styles.layout}>
                <main className={styles.mainColumn} role="main">

                    {/* MODE FOCUS (Flux vertical à un tag) */}
                    {focusTag ? (
                        <div className={styles.focusContainer}>
                            <button className={styles.backBtn} onClick={() => setFocusTag(null)}>
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
                                        <PostCard
                                            key={post.id_message}
                                            post={post}
                                            replies={repliesMap.get(post.id_message) || []}
                                        />
                                    ))
                                ) : (
                                    <div className={styles.emptyBox}>
                                        <p>Aucun post n'a encore été publié avec ce tag.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* MODE APERÇU (Défilement horizontal de tags) */
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
                                        <TagRow
                                            key={tag}
                                            tag={tag}
                                            posts={getPostsForTag(tag)}
                                            onVoirPlus={setFocusTag}
                                        />
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

                {/* Sidebar droite (tendances) */}
                <aside className={styles.rightColumn} aria-label="Tendances et suggestions">
                    <TrendingSection />
                </aside>
            </div>

            {/* Tiroir modal de gestion des tags */}
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

// Une ligne de tag (défilement horizontal + bouton d'accès direct)
function TagRow({ tag, posts, onVoirPlus }) {
    return (
        <section className={styles.tagSection} aria-label={`Tag ${tag}`}>
            <header className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>#{tag}</h2>
                <button
                    className={styles.voirPlusBtn}
                    onClick={() => onVoirPlus(tag)}
                    aria-label={`Voir plus de posts pour #${tag}`}
                >
                    <span>Voir plus</span>
                    <ChevronRight size={14} />
                </button>
            </header>

            <div className={styles.horizontalScroll} role="list">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id_message} className={styles.scrollItem} role="listitem">
                            <PostCard
                                post={post}
                                compact={true}
                                replies={repliesMap.get(post.id_message) || []}
                            />
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyPill}>
                        Pas encore de post récent pour #{tag}
                    </div>
                )}
            </div>
        </section>
    )
}

// Modal pour s'abonner aux tags (utilise un état temporaire tempTags pour ne pas ralentir le reste de la page)
function TagDrawer({ isOpen, onClose, availableTags, selectedTags, onSave }) {
    const [tempTags, setTempTags] = useState([])
    const [search, setSearch] = useState('')

    // Reset du buffer local à la fermeture
    const handleClose = () => {
        setTempTags(selectedTags)
        setSearch('')
        onClose()
    }

    if (!isOpen) return null

    // Sélection / désélection temporaire
    const toggleTempTag = (tag) => {
        setTempTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    // Filtrage simple pour la barre de recherche
    const filteredTags = availableTags.filter(tag =>
        tag.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={styles.drawerOverlay} onClick={handleClose} onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }} role="dialog" aria-modal="true">
            <div className={styles.drawerCard} onClick={(e) => e.stopPropagation()} role="presentation">
                <header className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Gérer mes centres d'intérêts</h2>
                    <button className={styles.closeBtn} onClick={handleClose} aria-label="Fermer le panneau">
                        <X size={18} />
                    </button>
                </header>

                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Rechercher un tag..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Rechercher un tag"
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
                                    className={[
                                        styles.drawerTagOption,
                                        isSelected ? styles.drawerTagOptionSelected : ''
                                    ].join(' ')}
                                    onClick={() => toggleTempTag(tag)}
                                    aria-pressed={isSelected}
                                >
                                    {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                                    {tag}
                                </button>
                            )
                        })
                    ) : (
                        <p className={styles.noResultsText}>Aucun tag ne correspond à votre recherche.</p>
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
