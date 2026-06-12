import { useState } from 'react'
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

/* Données de démonstration */
const INTERESTS_POSTS = [
    {
        id_message: 101,
        content: "Petite balade ce matin en forêt de Brocéliande. La brume était magique ! 🌲🌫️ #Nature #Voyage",
        date_publication: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        author: { id_user: 11, username: 'elena_wild', profile_picture: null },
        likes_count: 32, replies_count: 3,
        tags: ['Nature', 'Voyage'],
        reply_to: null,
        media: {
            url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop",
            type: "image"
        }
    },
    // Réponses pour le post 101
    {
        id_message: 1011,
        content: "C'est tellement ressourçant Brocéliande ! Profite bien 🌲🍃",
        date_publication: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
        reply_to: { id_message: 101, author: { id_user: 11, username: 'elena_wild' } }
    },
    {
        id_message: 1012,
        content: "Magnifique ! La brume du matin a ce côté mystique unique.",
        date_publication: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 101, author: { id_user: 11, username: 'elena_wild' } }
    },
    {
        id_message: 1013,
        content: "Ça donne envie d'y aller ce week-end !",
        date_publication: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        author: { id_user: 5, username: 'noah_brd', profile_picture: null },
        reply_to: { id_message: 101, author: { id_user: 11, username: 'elena_wild' } }
    },
    {
        id_message: 102,
        content: "Je viens de finir le design system de Breezy en Glassmorphism ! Qu'en pensez-vous ? 💎🎨 #UIDesign #Design",
        date_publication: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        author: { id_user: 12, username: 'hugo_designer', profile_picture: null },
        likes_count: 54, replies_count: 4,
        tags: ['UIDesign', 'Design'],
        reply_to: null,
    },
    // Réponses pour le post 102 (pour valider le bouton "Afficher plus")
    {
        id_message: 1021,
        content: "C'est sublime ! Les ombres et la transparence sont parfaites 💎",
        date_publication: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        reply_to: { id_message: 102, author: { id_user: 12, username: 'hugo_designer' } }
    },
    {
        id_message: 1022,
        content: "Le flou est nickel, quel package CSS/JS tu utilises ?",
        date_publication: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        author: { id_user: 15, username: 'dev_alex', profile_picture: null },
        reply_to: { id_message: 102, author: { id_user: 12, username: 'hugo_designer' } }
    },
    {
        id_message: 1023,
        content: "C'est propre, j'aime beaucoup le mariage des couleurs.",
        date_publication: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 102, author: { id_user: 12, username: 'hugo_designer' } }
    },
    {
        id_message: 1024,
        content: "Est-ce qu'il y a un lien de démo Figma ou code ?",
        date_publication: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        author: { id_user: 4, username: 'leaft_', profile_picture: null },
        reply_to: { id_message: 102, author: { id_user: 12, username: 'hugo_designer' } }
    },
    {
        id_message: 103,
        content: "Le nouvel album de Daft Punk remasterisé est une pure merveille. À écouter au casque d'urgence ! 🎧🎶 #Musique #Art",
        date_publication: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        author: { id_user: 13, username: 'meloman_sam', profile_picture: null },
        likes_count: 19, replies_count: 2,
        tags: ['Musique', 'Art'],
        reply_to: null,
    },
    // Réponses pour le post 103
    {
        id_message: 1031,
        content: "Entièrement d'accord, c'est un chef-d'œuvre !",
        date_publication: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        author: { id_user: 15, username: 'dev_alex', profile_picture: null },
        reply_to: { id_message: 103, author: { id_user: 13, username: 'meloman_sam' } }
    },
    {
        id_message: 1032,
        content: "Je l'écoute en boucle depuis ce matin 🎶",
        date_publication: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        author: { id_user: 11, username: 'elena_wild', profile_picture: null },
        reply_to: { id_message: 103, author: { id_user: 13, username: 'meloman_sam' } }
    },
    {
        id_message: 104,
        content: "Aujourd'hui, c'est atelier ramen maison ! Bouillon mijoté pendant 8 heures. Un régal. 🍜😋 #Cuisine #Voyage",
        date_publication: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        author: { id_user: 14, username: 'chef_yuki', profile_picture: null },
        likes_count: 43, replies_count: 6,
        tags: ['Cuisine', 'Voyage'],
        reply_to: null,
        media: {
            url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop",
            type: "image"
        }
    },
    // Réponses pour le post 104
    {
        id_message: 1041,
        content: "Ça a l'air délicieux ! Tu partages la recette ?",
        date_publication: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
        author: { id_user: 22, username: 'sophie_r', profile_picture: null },
        reply_to: { id_message: 104, author: { id_user: 14, username: 'chef_yuki' } }
    },
    {
        id_message: 1042,
        content: "8 heures de mijotage, le secret d'un bon bouillon !",
        date_publication: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
        author: { id_user: 12, username: 'hugo_designer', profile_picture: null },
        reply_to: { id_message: 104, author: { id_user: 14, username: 'chef_yuki' } }
    },
    {
        id_message: 1043,
        content: "Je veux bien être ton goûteur officiel 😂",
        date_publication: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        reply_to: { id_message: 104, author: { id_user: 14, username: 'chef_yuki' } }
    },
    {
        id_message: 1044,
        content: "Le ramen maison c'est le top !",
        date_publication: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 104, author: { id_user: 14, username: 'chef_yuki' } }
    },
    {
        id_message: 1045,
        content: "Incroyable, j'adore les ramens.",
        date_publication: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
        author: { id_user: 16, username: 'pixel_boy', profile_picture: null },
        reply_to: { id_message: 104, author: { id_user: 14, username: 'chef_yuki' } }
    },
    {
        id_message: 1046,
        content: "Miam ! 🍜",
        date_publication: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
        reply_to: { id_message: 104, author: { id_user: 14, username: 'chef_yuki' } }
    },
    {
        id_message: 105,
        content: "Des conseils pour débuter sur React 19 et le compilateur ? Les gains de performance sont-ils au rendez-vous ? 💻⚡ #React #WebDev",
        date_publication: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        author: { id_user: 15, username: 'dev_alex', profile_picture: null },
        likes_count: 25, replies_count: 3,
        tags: ['React', 'WebDev', 'Dev'],
        reply_to: null,
    },
    // Réponses pour le post 105
    {
        id_message: 1051,
        content: "Le compilateur React évite pas mal de useMemo/useCallback, c'est génial.",
        date_publication: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        reply_to: { id_message: 105, author: { id_user: 15, username: 'dev_alex' } }
    },
    {
        id_message: 1052,
        content: "Pour l'instant très stable en prod de mon côté !",
        date_publication: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 105, author: { id_user: 15, username: 'dev_alex' } }
    },
    {
        id_message: 1053,
        content: "Grave hâte d'essayer ça sur mon prochain projet.",
        date_publication: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        author: { id_user: 4, username: 'leaft_', profile_picture: null },
        reply_to: { id_message: 105, author: { id_user: 15, username: 'dev_alex' } }
    },
    {
        id_message: 106,
        content: "Le nouveau Zelda est incroyable ! J'ai passé tout mon week-end dessus. Qui d'autre y joue ? 🎮⚔️ #Gaming #Tech",
        date_publication: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        author: { id_user: 16, username: 'pixel_boy', profile_picture: null },
        likes_count: 61, replies_count: 3,
        tags: ['Gaming', 'Tech'],
        reply_to: null,
    },
    // Réponses pour le post 106
    {
        id_message: 1061,
        content: "J'y passe toutes mes nuits... Ce jeu est immense !",
        date_publication: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
        author: { id_user: 15, username: 'dev_alex', profile_picture: null },
        reply_to: { id_message: 106, author: { id_user: 16, username: 'pixel_boy' } }
    },
    {
        id_message: 1062,
        content: "Les mécaniques de construction sont géniales.",
        date_publication: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 106, author: { id_user: 16, username: 'pixel_boy' } }
    },
    {
        id_message: 1063,
        content: "Un vrai chef-d'œuvre de Nintendo.",
        date_publication: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        author: { id_user: 22, username: 'sophie_r', profile_picture: null },
        reply_to: { id_message: 106, author: { id_user: 16, username: 'pixel_boy' } }
    },
    {
        id_message: 107,
        content: "Revoir Blade Runner 2049 ce soir sur grand écran... La photographie est tout simplement parfaite. 🎬🌌 #Cinema #Art",
        date_publication: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
        author: { id_user: 17, username: 'cinephile_max', profile_picture: null },
        likes_count: 37, replies_count: 3,
        tags: ['Cinema', 'Art'],
        reply_to: null,
    },
    // Réponses pour le post 107
    {
        id_message: 1071,
        content: "La musique de Hans Zimmer au cinéma, c'était légendaire.",
        date_publication: new Date(Date.now() - 230 * 60 * 1000).toISOString(),
        author: { id_user: 11, username: 'elena_wild', profile_picture: null },
        reply_to: { id_message: 107, author: { id_user: 17, username: 'cinephile_max' } }
    },
    {
        id_message: 1072,
        content: "Denis Villeneuve a vraiment fait un travail de titan.",
        date_publication: new Date(Date.now() - 220 * 60 * 1000).toISOString(),
        author: { id_user: 12, username: 'hugo_designer', profile_picture: null },
        reply_to: { id_message: 107, author: { id_user: 17, username: 'cinephile_max' } }
    },
    {
        id_message: 1073,
        content: "Mon film de SF préféré.",
        date_publication: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
        author: { id_user: 2, username: 'camille_lrt', profile_picture: null },
        reply_to: { id_message: 107, author: { id_user: 17, username: 'cinephile_max' } }
    },
    {
        id_message: 108,
        content: "Entraînement de trail de 15km sous la pluie. Dur mentalement mais sensation incroyable à l'arrivée ! 🏃‍♂️🌧️ #Sport #Nature",
        date_publication: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
        author: { id_user: 18, username: 'run_runner', profile_picture: null },
        likes_count: 29, replies_count: 3,
        tags: ['Sport', 'Nature'],
        reply_to: null,
    },
    // Réponses pour le post 108
    {
        id_message: 1081,
        content: "Bravo ! Courir sous la pluie, c'est un vrai test mental.",
        date_publication: new Date(Date.now() - 290 * 60 * 1000).toISOString(),
        author: { id_user: 11, username: 'elena_wild', profile_picture: null },
        reply_to: { id_message: 108, author: { id_user: 18, username: 'run_runner' } }
    },
    {
        id_message: 1082,
        content: "Respect ! Moi je suis resté au chaud.",
        date_publication: new Date(Date.now() - 280 * 60 * 1000).toISOString(),
        author: { id_user: 3, username: 'tommrc', profile_picture: null },
        reply_to: { id_message: 108, author: { id_user: 18, username: 'run_runner' } }
    },
    {
        id_message: 1083,
        content: "Quelle marque de chaussures tu utilises pour le gras ?",
        date_publication: new Date(Date.now() - 270 * 60 * 1000).toISOString(),
        author: { id_user: 15, username: 'dev_alex', profile_picture: null },
        reply_to: { id_message: 108, author: { id_user: 18, username: 'run_runner' } }
    },
    {
        id_message: 109,
        content: "Le Glassmorphism est-il toujours d'actualité en 2026 ? Personnellement j'adore quand c'est fait avec subtilité. 💎🌫️ #UIDesign #Glass",
        date_publication: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        author: { id_user: 19, username: 'ana_web', profile_picture: null },
        likes_count: 18, replies_count: 1,
        tags: ['UIDesign', 'Glass'],
        reply_to: null,
    },
    // Réponse pour le post 109
    {
        id_message: 1091,
        content: "C'est l'essence même de Breezy, donc oui !",
        date_publication: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        author: { id_user: 1, username: 'baptistenoisette', profile_picture: null },
        reply_to: { id_message: 109, author: { id_user: 19, username: 'ana_web' } }
    }
]

const getRepliesForPost = (postId) => {
    const direct = INTERESTS_POSTS.filter(post => post.reply_to !== null && post.reply_to.id_message === postId)
    const all = [...direct]
    let queue = [...direct]
    while (queue.length > 0) {
        const current = queue.shift()
        const children = INTERESTS_POSTS.filter(post => post.reply_to !== null && post.reply_to.id_message === current.id_message)
        all.push(...children)
        queue.push(...children)
    }
    return all
}

// Lecture initiale du localStorage (lazy initializer, exécuté une seule fois)
function loadInitialTags() {
    const storedTags = localStorage.getItem('selectedTags')
    if (storedTags) {
        try {
            return JSON.parse(storedTags)
        } catch {
            return ['Breezy', 'UIDesign', 'WebDev']
        }
    }
    const initialTags = ['Breezy', 'UIDesign', 'WebDev', 'Nature', 'Gaming']
    localStorage.setItem('selectedTags', JSON.stringify(initialTags))
    return initialTags
}

// Page principale pour afficher les posts par centre d'intérêt
function InterestsPage() {
    // Initialisation depuis localStorage via lazy initializer
    const [selectedTags, setSelectedTags] = useState(loadInitialTags)
    const [focusTag, setFocusTag] = useState(null)
    const [showManageDrawer, setShowManageDrawer] = useState(false)

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
        localStorage.setItem('selectedTags', JSON.stringify(updatedTags))
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
                                            replies={getRepliesForPost(post.id_message)}
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
                                replies={getRepliesForPost(post.id_message)}
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
        <div className={styles.drawerOverlay} onClick={handleClose} role="dialog" aria-modal="true">
            <div className={styles.drawerCard} onClick={(e) => e.stopPropagation()}>
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
