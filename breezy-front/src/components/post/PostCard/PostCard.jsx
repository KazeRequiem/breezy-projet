import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Wind, MoreHorizontal, Tag, Trash, AlertTriangle, X, Send, ChevronDown, ChevronUp, Pencil, Check } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import RequireRole from '../../ui/RequireRole/RequireRole'
import { deleteMessage, updateMessage, getReplies, createReply } from '../../../services/messageService'
import { getLikeStatus, likePost, unlikePost } from '../../../services/likeService'
import { reportMessage } from '../../../services/reportService'
import { getWhispers, sendWhisper, deleteWhisper } from '../../../services/whisperService'
import { MOODS, getMood } from '../../../utils/moods'
import MoodPanel from '../../mood/MoodPanel/MoodPanel'
import styles from './PostCard.module.css'

import { formatRelativeTime } from '../../../utils/formatRelativeTime'

// Carte d'affichage d'un post (Feed principal & Centres d'intérêts)
const getMarginLeft = (d) => {
    if (d === 0) return '20px'
    if (d === 1) return '10px'
    return '0px'
}

const getPaddingLeft = (d) => {
    if (d === 0) return '10px'
    if (d === 1) return '6px'
    return '0px'
}

function PostCard({ post, threadVariant, animDelay = '', compact = false, replies = [], editable = false }) {
    const {
        id_message,
        content,
        date_publication,
        author,
        likes_count    = 0,
        replies_count  = 0,
        tags           = [],
        reply_to       = null,
        media: localMedia = null,
        image_url      = null,
        video_url      = null,
        mood           = 'cloudy',
    } = post

    const moodInfo = mood && mood !== 'cloudy' ? getMood(mood) : null

    const media = localMedia
        || (image_url ? { type: 'image', url: image_url } : null)
        || (video_url ? { type: 'video', url: video_url } : null)

    const { user } = useAuth()
    const currentLoggedUser = user?.username ?? null
    const isOwn = currentLoggedUser
        ? author.username.toLowerCase() === currentLoggedUser.toLowerCase()
        : false

    // États locaux
    const [showMenu, setShowMenu]       = useState(false)
    const [isDeleted, setIsDeleted]     = useState(false)
    const [isReported, setIsReported]   = useState(false)
    const [showWhisper, setShowWhisper] = useState(false)
    const [whisperText, setWhisperText] = useState('')
    const [whisperStatus, setWhisperStatus] = useState('idle') // 'idle' | 'sending' | 'sent'
    const [whisperMood, setWhisperMood] = useState('cloudy')
    const [whispers, setWhispers] = useState([])
    const [showMoodPanel, setShowMoodPanel] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    // États Like et Commentaires
    const [isLiked, setIsLiked]         = useState(false)
    const [likesCount, setLikesCount]   = useState(likes_count)
    const [showReplies, setShowReplies] = useState(false)
    const [visibleRepliesCount, setVisibleRepliesCount] = useState(2)
    const [localReplies, setLocalReplies] = useState(replies)
    const [repliesCount, setRepliesCount] = useState(replies.length || replies_count)
    const [newCommentText, setNewCommentText] = useState('')
    const [replyingTo, setReplyingTo] = useState(null)
    const [expandedComments, setExpandedComments] = useState({})
    const [repliesLoaded, setRepliesLoaded] = useState(false)

    // États édition du message
    const [contentValue, setContentValue] = useState(content)
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(content)
    const [savingEdit, setSavingEdit] = useState(false)

    const toggleExpandComment = (commentId) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
    }

    // Synchronisation des replies via le pattern "derived state"
    const [prevPostId, setPrevPostId] = useState(post.id_message)
    if (prevPostId !== post.id_message) {
        setPrevPostId(post.id_message)
        setLocalReplies(replies)
        setRepliesCount(replies.length || replies_count)
        setVisibleRepliesCount(2)
        setExpandedComments({})
        setRepliesLoaded(false)
        setContentValue(post.content)
        setEditText(post.content)
        setIsEditing(false)
    }

    useEffect(() => {
        if (!showReplies || repliesLoaded) return
        let cancelled = false
        getReplies(id_message)
            .then(list => {
                if (cancelled) return
                setLocalReplies(list.map(r => ({ ...r, liked: false })))
                setRepliesCount(list.length)
                setRepliesLoaded(true)
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [showReplies, repliesLoaded, id_message])

    const handleLikeComment = (commentId) => {
        setLocalReplies(prev => prev.map(reply => {
            if (reply.id_message === commentId) {
                const isAlreadyLiked = reply.liked
                return {
                    ...reply,
                    liked: !isAlreadyLiked,
                    likes_count: (reply.likes_count || 0) + (isAlreadyLiked ? -1 : 1)
                }
            }
            return reply
        }))
    }

    const renderCommentForm = () => {
        return (
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                {replyingTo && (
                    <div className={styles.replyingToIndicator}>
                        <span>En réponse à <strong>@{replyingTo.username}</strong></span>
                        <button
                            type="button"
                            className={styles.cancelReplyBtn}
                            onClick={() => setReplyingTo(null)}
                            aria-label="Annuler la réponse"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}
                <div className={styles.commentInputWrapper}>
                    <input
                        type="text"
                        placeholder={replyingTo ? `Répondre à @${replyingTo.username}...` : "Écrire une réponse..."}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className={styles.commentInput}
                        disabled={isDeleted}
                        autoFocus={!!replyingTo}
                    />
                    <button
                        type="submit"
                        className={styles.commentSendBtn}
                        disabled={!newCommentText.trim()}
                        aria-label="Commenter"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        )
    }

    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        const text = newCommentText.trim()
        if (!text) return

        const target = replyingTo
        setNewCommentText('')
        setReplyingTo(null)

        try {
            const created = await createReply(id_message, text)
            const newComment = {
                ...created,
                author: { _id: user?.id, username: currentLoggedUser || 'anonyme', profile_picture: user?.profile_picture ?? null },
                likes_count: 0,
                liked: false,
                reply_to: target ? { id_message: target.id_message, author: { username: target.username } } : null,
            }

            setLocalReplies(prev => [...prev, newComment])
            setRepliesCount(prev => prev + 1)

            if (target) {
                setExpandedComments(prev => ({ ...prev, [target.id_message]: true }))
            } else {
                const currentRootCount = localReplies.filter(r => !r.reply_to || r.reply_to.id_message === post.id_message).length
                setVisibleRepliesCount(currentRootCount + 1)
            }

            showToast('Commentaire ajouté ! 🍃')
        } catch {
            showToast("Erreur lors de l'envoi du commentaire.")
        }
    }

    const menuRef = useRef(null)


    // Fermeture du menu 3 points lors d'un clic extérieur
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showMenu])

    const handleDelete = async (e) => {
        e.stopPropagation()
        setShowMenu(false)
        try {
            await deleteMessage(id_message)
            setIsDeleted(true)
            showToast('Breeze supprimé avec succès.')
        } catch {
            showToast('Erreur lors de la suppression.')
        }
    }

    const handleStartEdit = (e) => {
        e.stopPropagation()
        setEditText(contentValue)
        setIsEditing(true)
        setShowMenu(false)
    }

    const handleSaveEdit = async (e) => {
        e.preventDefault()
        const text = editText.trim()
        if (!text || text === contentValue) {
            setIsEditing(false)
            return
        }
        if (text.length > 280) return
        setSavingEdit(true)
        try {
            const tags = (text.match(/#(\w+)/g) || []).map(h => h.slice(1).toLowerCase())
            await updateMessage(id_message, text, tags)
            setContentValue(text)
            setIsEditing(false)
            showToast('Breeze modifié.')
        } catch {
            showToast('Erreur lors de la modification.')
        } finally {
            setSavingEdit(false)
        }
    }

    const handleReport = async (e) => {
        e.stopPropagation()
        setShowMenu(false)
        try {
            await reportMessage(id_message)
            setIsReported(true)
            showToast('Message signalé. Notre équipe va l\'examiner.')
        } catch (err) {
            if (err.message && err.message.toLowerCase().includes('déjà')) {
                setIsReported(true)
                showToast('Vous avez déjà signalé ce message.')
            } else {
                showToast('Erreur lors du signalement.')
            }
        }
    }

    const handleSendWhisper = async (e) => {
        e.preventDefault()
        const text = whisperText.trim()
        if (!text) return

        setWhisperStatus('sending')
        try {
            const created = await sendWhisper(id_message, text, whisperMood)
            const w = {
                ...created,
                author: { _id: user?.id, username: currentLoggedUser || 'moi', profile_picture: user?.profile_picture ?? null },
            }
            setWhispers(prev => [...prev, w])
            setWhisperText('')
            setWhisperMood('cloudy')
            setWhisperStatus('sent')
            setTimeout(() => setWhisperStatus('idle'), 1200)
            showToast('Votre murmure a été soufflé à l\'auteur ! 🍃')
        } catch {
            setWhisperStatus('idle')
            showToast('Erreur lors de l\'envoi du murmure.')
        }
    }

    const handleDeleteWhisper = async (wid) => {
        try {
            await deleteWhisper(wid)
            setWhispers(prev => prev.filter(w => w._id !== wid))
        } catch {
            showToast('Erreur lors de la suppression du murmure.')
        }
    }

    const showToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(''), 3000)
    }

    useEffect(() => {
        let cancelled = false
        getLikeStatus(id_message)
            .then(({ likesCount, likedByMe }) => {
                if (cancelled) return
                setLikesCount(likesCount)
                setIsLiked(likedByMe)
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [id_message])

    useEffect(() => {
        if (!showWhisper) return
        let cancelled = false
        getWhispers(id_message)
            .then(list => { if (!cancelled && Array.isArray(list)) setWhispers(list) })
            .catch(() => {})
        return () => { cancelled = true }
    }, [showWhisper, id_message])

    const handleLikeClick = async (e) => {
        e.stopPropagation()
        const next = !isLiked
        setIsLiked(next)
        setLikesCount(prev => prev + (next ? 1 : -1))
        try {
            if (next) await likePost(id_message)
            else await unlikePost(id_message)
        } catch {
            setIsLiked(!next)
            setLikesCount(prev => prev + (next ? -1 : 1))
        }
    }

    if (isDeleted) {
        return (
            <div className={[styles.deletedPost, 'anim-fade-up'].join(' ')}>
                <p>Ce Breeze a été supprimé.</p>
            </div>
        )
    }

    /* Classe de variante thread pour ajuster les border-radius */
    const variantClass = threadVariant ? styles[`thread-${threadVariant}`] : ''
    const compactClass = compact ? styles.compact : ''
    const actualRepliesCount = repliesCount

    return (
        <>
            <article
                className={[styles.card, variantClass, compactClass, 'anim-fade-up', animDelay].join(' ')}
                aria-label={`Post de ${author.username}`}
            >
                {/* En-tête */}
                <header className={styles.header}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatarCol}>
                            <Link to={`/profile/${author.username}`} className={styles.avatarLink} aria-label={`Profil de @${author.username}`}>
                                <div className={styles.avatar} aria-hidden="true">
                                    {author.profile_picture
                                        ? <img src={author.profile_picture} alt={author.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        : author.username.charAt(0).toUpperCase()
                                    }
                                </div>
                            </Link>
                            {/* Ligne verticale sous l'avatar (post racine d'un thread) */}
                            {threadVariant === 'root' && (
                                <div className={styles.avatarThreadLine} aria-hidden="true" />
                            )}
                        </div>

                        <div className={styles.userMeta}>
                            <Link to={`/profile/${author.username}`} className={styles.usernameLink}>
                                <span className={styles.username}>@{author.username}</span>
                            </Link>
                            <time
                                className={styles.time}
                                dateTime={date_publication}
                                title={new Date(date_publication).toLocaleString('fr-FR')}
                            >
                                {formatRelativeTime(date_publication)}
                            </time>
                        </div>
                    </div>

                    {/* Zone du bouton 3 points et de son menu contextuel */}
                    <div className={styles.menuContainer} ref={menuRef}>
                        <button 
                            className={styles.menuBtn} 
                            aria-label="Options du post" 
                            title="Options"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowMenu(!showMenu)
                            }}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {showMenu && (
                            <div className={[styles.dropdownMenu, 'anim-fade-up'].join(' ')}>
                                {/* Modifier : auteur du post, uniquement là où l'édition est autorisée (profil) */}
                                {editable && isOwn && (
                                    <button
                                        className={styles.dropdownItem}
                                        onClick={handleStartEdit}
                                        id={`edit-btn-${id_message}`}
                                    >
                                        <Pencil size={14} />
                                        <span>Modifier le post</span>
                                    </button>
                                )}

                                {/* Supprimer : auteur du post */}
                                {isOwn && (
                                    <button 
                                        className={[styles.dropdownItem, styles.dangerItem].join(' ')} 
                                        onClick={handleDelete}
                                        id={`delete-btn-${id_message}`}
                                    >
                                        <Trash size={14} />
                                        <span>Supprimer le post</span>
                                    </button>
                                )}

                                {/* Supprimer (modération) : admin ou moderator sur n'importe quel post */}
                                {!isOwn && (
                                    <RequireRole allowedRoles={['admin', 'moderator']}>
                                        <button 
                                            className={[styles.dropdownItem, styles.dangerItem].join(' ')} 
                                            onClick={handleDelete}
                                            id={`admin-delete-btn-${id_message}`}
                                        >
                                            <Trash size={14} />
                                            <span>Supprimer (modération)</span>
                                        </button>
                                    </RequireRole>
                                )}

                                {/* Signaler : uniquement si pas son propre post et pas admin/mod */}
                                {!isOwn && (
                                    <RequireRole
                                        allowedRoles={['user']}
                                        fallback={null}
                                    >
                                        <button 
                                            className={styles.dropdownItem} 
                                            onClick={handleReport}
                                            id={`report-btn-${id_message}`}
                                            disabled={isReported}
                                        >
                                            <AlertTriangle size={14} />
                                            <span>{isReported ? 'Signalé' : 'Signaler le post'}</span>
                                        </button>
                                    </RequireRole>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Badge "En réponse à" (table reply) */}
                {reply_to && (
                    <div
                        className={styles.replyBadge}
                        aria-label={`En réponse à @${reply_to.author.username}`}
                    >
                        <MessageCircle size={11} strokeWidth={2} />
                        <span>
                            En réponse à{' '}
                            <Link to={`/profile/${reply_to.author.username}`} className={styles.replyLink}>
                                <strong>@{reply_to.author.username}</strong>
                            </Link>
                        </span>
                    </div>
                )}

                {/* Vignette d'humeur (mood) — cliquable pour ouvrir l'explication */}
                {moodInfo && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowMoodPanel(true) }}
                        title="Voir les humeurs Breezy"
                        aria-label={`Humeur : ${moodInfo.label}. Voir les humeurs`}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10,
                            padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                            border: '1px solid rgba(120,100,160,0.2)', background: 'rgba(59,140,240,0.08)',
                            color: 'var(--text-secondary,#5a5a7a)', fontSize: '0.82rem', fontWeight: 600,
                        }}
                    >
                        <span aria-hidden="true" style={{ fontSize: '1rem' }}>{moodInfo.emoji}</span>
                        <span>@{author.username} {moodInfo.phrase}</span>
                    </button>
                )}

                {/* Contenu (max 280 chars selon BDD) */}
                {isEditing ? (
                    <form onSubmit={handleSaveEdit} style={{ marginBottom: 12 }}>
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value.slice(0, 280))}
                            maxLength={280}
                            rows={3}
                            autoFocus
                            style={{
                                width: '100%', resize: 'vertical', borderRadius: 12, padding: '10px 12px',
                                border: '1px solid rgba(120,100,160,0.3)', fontFamily: 'inherit', fontSize: '0.95rem',
                                color: 'var(--text-primary, #1a1a2e)', outline: 'none', background: 'rgba(255,255,255,0.8)',
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                            <span style={{ marginRight: 'auto', fontSize: '0.75rem', color: 'var(--text-muted,#9090b0)' }}>{editText.length}/280</span>
                            <button type="button" onClick={() => setIsEditing(false)} disabled={savingEdit}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', border: '1px solid rgba(120,100,160,0.25)', background: 'transparent', color: 'var(--text-secondary,#5a5a7a)' }}>
                                <X size={14} /> Annuler
                            </button>
                            <button type="submit" disabled={savingEdit || !editText.trim()}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', border: 'none', background: 'var(--brand,#3b8cf0)', color: '#fff', opacity: savingEdit ? 0.7 : 1 }}>
                                <Check size={14} /> {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className={styles.content}>{contentValue}</p>
                )}

                {/* Média attaché (Photo ou Vidéo) */}
                {media && (
                    <div className={styles.mediaContainer}>
                        {media.type === 'image' ? (
                            <img src={media.url} className={styles.postMedia} alt="Média attaché" />
                        ) : (
                            <video src={media.url} controls className={styles.postMedia} />
                        )}
                    </div>
                )}

                {/* Tags — cliquables vers la page Intérêts filtrée */}
                {tags.length > 0 && (
                    <div className={styles.tagList} aria-label="Tags du post">
                        {tags.map(tag => (
                            <Link
                                key={tag}
                                to={`/interests?tag=${encodeURIComponent(tag)}`}
                                className={styles.tagPill}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Voir les posts du tag ${tag}`}
                            >
                                <Tag size={10} strokeWidth={2} />
                                {tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <footer className={styles.actions}>
                    {/* Like avec animation heartbeat */}
                    <button 
                        className={[styles.actionBtn, isLiked ? styles.likedBtn : ''].join(' ')} 
                        aria-label={`${likesCount} likes`} 
                        id={`like-${id_message}`}
                        onClick={handleLikeClick}
                    >
                        <Heart 
                            size={15} 
                            strokeWidth={1.8} 
                            className={isLiked ? styles.heartActive : ''} 
                        />
                        {likesCount > 0 && <span className={styles.actionCount}>{likesCount}</span>}
                    </button>

                    {/* Répondre (Toggle des commentaires) */}
                    <button 
                        className={[styles.actionBtn, showReplies ? styles.activeCommentBtn : ''].join(' ')} 
                        aria-label={`${actualRepliesCount} réponses`} 
                        id={`reply-${id_message}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowReplies(prev => {
                                const next = !prev
                                if (!next) {
                                    setVisibleRepliesCount(2)
                                }
                                return next
                            })
                        }}
                    >
                        <MessageCircle size={15} strokeWidth={1.8} />
                        {actualRepliesCount > 0 && <span className={styles.actionCount}>{actualRepliesCount}</span>}
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Whisper : réaction privée avec l'auteur */}
                    <button
                        className={[styles.actionBtn, styles.whisperBtn].join(' ')}
                        aria-label="Envoyer un Whisper — réagir en privé à l'auteur"
                        title="Whisper — réaction privée"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowWhisper(true)
                        }}
                        id={`whisper-${id_message}`}
                    >
                        <Wind size={15} strokeWidth={1.8} />
                        <span className={styles.whisperLabel}>Whisper</span>
                    </button>
                </footer>
            </article>

            {/* Section des commentaires (visible au clic) */}
            {showReplies && (() => {
                // Un commentaire est considéré "racine" s'il ne répond à aucun commentaire présent localement
                const rootReplies = localReplies.filter(r => {
                    if (!r.reply_to) return true
                    if (r.reply_to.id_message === post.id_message) return true
                    const parentExists = localReplies.some(other => other.id_message === r.reply_to.id_message)
                    return !parentExists
                })

                return (
                    <div className={[styles.repliesSection, 'anim-fade-up'].join(' ')} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                        
                        {/* Formulaire de commentaire sous le post (affiché uniquement s'il n'y a pas de réponse à un commentaire en cours) */}
                        {!replyingTo && renderCommentForm()}

                        {rootReplies.length > 0 ? (
                            rootReplies.slice(0, visibleRepliesCount).map(reply => (
                                <ReplyNode
                                    key={reply.id_message}
                                    reply={reply}
                                    depth={0}
                                    localReplies={localReplies}
                                    replyingTo={replyingTo}
                                    expandedComments={expandedComments}
                                    toggleExpandComment={toggleExpandComment}
                                    handleLikeComment={handleLikeComment}
                                    setReplyingTo={setReplyingTo}
                                    renderCommentForm={renderCommentForm}
                                />
                            ))
                        ) : (
                            <p className={styles.noCommentsText}>Aucun commentaire. Soyez le premier à répondre ! 🍃</p>
                        )}

                        {rootReplies.length > visibleRepliesCount && (
                            <button
                                className={styles.showMoreCommentsBtn}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setVisibleRepliesCount(prev => prev + 3)
                                }}
                                id={`show-more-replies-${id_message}`}
                            >
                                Afficher plus (+{rootReplies.length - visibleRepliesCount})
                            </button>
                        )}
                    </div>
                )
            })()}

            {/* ── Overlay Modal : Whisper (Murmure secret) ──────────────── */}
            {showWhisper && (
                <div 
                    className={styles.whisperOverlay} 
                    role="dialog" 
                    aria-modal="true" 
                    aria-label={`Murmurer à @${author.username}`}
                    onClick={() => setShowWhisper(false)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setShowWhisper(false) }}
                >
                    <div 
                        className={[styles.whisperModal, 'anim-fade-up'].join(' ')}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        role="presentation"
                    >
                        <header className={styles.modalHeader}>
                            <div className={styles.modalTitleGroup}>
                                <Wind size={18} color="var(--brand)" />
                                <h3>Souffler un Whisper</h3>
                            </div>
                            <button 
                                className={styles.closeModalBtn} 
                                onClick={() => setShowWhisper(false)}
                                aria-label="Fermer"
                                id="btn-close-whisper"
                            >
                                <X size={16} />
                            </button>
                        </header>

                        <div className={styles.modalMeta}>
                            <p>En réponse à <strong>@{author.username}</strong> :</p>
                            <blockquote className={styles.excerptQuote}>"{content}"</blockquote>
                        </div>

                        {whispers.length > 0 && (
                            <div style={{ maxHeight: 180, overflowY: 'auto', margin: '4px 0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {whispers.map(w => (
                                    <div key={w._id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(0,0,0,0.04)', borderRadius: 10, padding: '8px 10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--brand,#3b8cf0)' }}>
                                                @{w.author?.username || 'moi'}
                                                {w.mood && w.mood !== 'cloudy' && <span title={getMood(w.mood).label} style={{ marginLeft: 5 }}>{getMood(w.mood).emoji}</span>}
                                            </span>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-primary,#1a1a2e)' }}>{w.content}</p>
                                        </div>
                                        {String(w.author?._id) === String(user?.id) && (
                                            <button type="button" onClick={() => handleDeleteWhisper(w._id)} aria-label="Supprimer mon murmure"
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}>
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSendWhisper} className={styles.whisperForm}>
                            <textarea
                                className={styles.whisperTextarea}
                                placeholder={`Murmurez quelque chose en secret à @${author.username}...`}
                                value={whisperText}
                                onChange={(e) => setWhisperText(e.target.value.slice(0, 140))}
                                maxLength={140}
                                disabled={whisperStatus !== 'idle'}
                                autoFocus
                            />

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}>
                                <label htmlFor={`whisper-mood-${id_message}`} style={{ fontSize: '0.78rem', color: 'var(--text-secondary,#5a5a7a)' }}>Humeur :</label>
                                <select
                                    id={`whisper-mood-${id_message}`}
                                    value={whisperMood}
                                    onChange={(e) => setWhisperMood(e.target.value)}
                                    disabled={whisperStatus !== 'idle'}
                                    style={{
                                        flex: 1, padding: '7px 9px', borderRadius: 8,
                                        border: '1px solid rgba(120,100,160,0.25)', background: 'rgba(255,255,255,0.8)',
                                        fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary,#1a1a2e)', cursor: 'pointer',
                                    }}
                                >
                                    {MOODS.map(m => (
                                        <option key={m.id} value={m.id}>{m.emoji}  {m.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formFooter}>
                                <span className={styles.charCounter}>{whisperText.length}/140</span>
                                <button
                                    type="submit"
                                    className={styles.sendWhisperBtn}
                                    disabled={!whisperText.trim() || whisperStatus !== 'idle'}
                                    id="btn-send-whisper"
                                >
                                    {whisperStatus === 'sending' ? (
                                        <span>Envoi...</span>
                                    ) : whisperStatus === 'sent' ? (
                                        <span>Envoyé ! 🍃</span>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>Souffler</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast de notification éphémère */}
            {toastMessage && (
                <div className={styles.toast} role="status" aria-live="polite">
                    {toastMessage}
                </div>
            )}

            {/* Panneau explicatif des humeurs */}
            <MoodPanel isOpen={showMoodPanel} onClose={() => setShowMoodPanel(false)} />
        </>
    )
}
 
function ReplyNode({
    reply,
    depth,
    localReplies,
    replyingTo,
    expandedComments,
    toggleExpandComment,
    handleLikeComment,
    setReplyingTo,
    renderCommentForm
}) {
    const children = localReplies.filter(r => r.reply_to && r.reply_to.id_message === reply.id_message)
    const isTargetOfReply = replyingTo && replyingTo.id_message === reply.id_message
    const isExpanded = !!expandedComments[reply.id_message]
    const hasChildren = children.length > 0

    const handleNodeClick = () => {
        if (hasChildren) {
            toggleExpandComment(reply.id_message)
        }
    }

    const handleNodeKeyDown = (e) => {
        if (hasChildren && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            toggleExpandComment(reply.id_message)
        }
    }

    const containerClasses = [
        depth > 0 ? styles.subReplyItem : styles.replyItem,
        hasChildren ? styles.clickableReplyItem : ''
    ].join(' ')

    const marginLeft = getMarginLeft(depth)
    const paddingLeft = getPaddingLeft(depth)
    const borderLeft = depth >= 2 ? 'none' : undefined

    return (
        <div className={styles.replyNode}>
            <div
                className={containerClasses}
                onClick={handleNodeClick}
                role={hasChildren ? "button" : undefined}
                tabIndex={hasChildren ? 0 : undefined}
                onKeyDown={handleNodeKeyDown}
            >
                <ReplyAvatar author={reply.author} depth={depth} styles={styles} />
                <div className={styles.replyBody}>
                    <header className={styles.replyHeader}>
                        <Link
                            to={`/profile/${reply.author.username}`}
                            className={styles.replyUsernameLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className={styles.replyUsername}>@{reply.author.username}</span>
                        </Link>
                        <span className={styles.replyTime}>{formatRelativeTime(reply.date_publication)}</span>
                    </header>

                    {reply.reply_to && (
                        <div className={styles.replyToCommentBadge} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                            En réponse à{' '}
                            <Link to={`/profile/${reply.reply_to.author.username}`} className={styles.replyLink}>
                                <strong>@{reply.reply_to.author.username}</strong>
                            </Link>
                        </div>
                    )}

                    <p className={styles.replyText}>{reply.content}</p>

                    <ReplyActions
                        reply={reply}
                        childrenCount={children.length}
                        isExpanded={isExpanded}
                        onLike={() => handleLikeComment(reply.id_message)}
                        onReply={() => setReplyingTo({ id_message: reply.id_message, username: reply.author.username })}
                        onToggleExpand={() => toggleExpandComment(reply.id_message)}
                        styles={styles}
                    />

                    {isTargetOfReply && (
                        <div className={styles.replyInlineFormWrapper} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                            {renderCommentForm()}
                        </div>
                    )}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div
                    className={styles.subRepliesList}
                    style={{ marginLeft, paddingLeft, borderLeft }}
                >
                    {children.map(child => (
                        <ReplyNode
                            key={child.id_message}
                            reply={child}
                            depth={depth + 1}
                            localReplies={localReplies}
                            replyingTo={replyingTo}
                            expandedComments={expandedComments}
                            toggleExpandComment={toggleExpandComment}
                            handleLikeComment={handleLikeComment}
                            setReplyingTo={setReplyingTo}
                            renderCommentForm={renderCommentForm}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

ReplyNode.propTypes = {
    reply: PropTypes.shape({
        id_message: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        content: PropTypes.string.isRequired,
        date_publication: PropTypes.string.isRequired,
        author: PropTypes.shape({
            username: PropTypes.string.isRequired,
            profile_picture: PropTypes.string,
        }).isRequired,
        reply_to: PropTypes.shape({
            id_message: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            author: PropTypes.shape({
                username: PropTypes.string.isRequired,
            }),
        }),
        liked: PropTypes.bool,
        likes_count: PropTypes.number,
    }).isRequired,
    depth: PropTypes.number.isRequired,
    localReplies: PropTypes.array.isRequired,
    replyingTo: PropTypes.shape({
        id_message: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        username: PropTypes.string,
    }),
    expandedComments: PropTypes.object.isRequired,
    toggleExpandComment: PropTypes.func.isRequired,
    handleLikeComment: PropTypes.func.isRequired,
    setReplyingTo: PropTypes.func.isRequired,
    renderCommentForm: PropTypes.func.isRequired,
}

function ReplyAvatar({ author, depth, styles }) {
    const initial = author.username.charAt(0).toUpperCase()
    return (
        <div className={depth > 0 ? styles.subReplyAvatarCol : styles.replyAvatarCol}>
            <Link
                to={`/profile/${author.username}`}
                className={depth > 0 ? styles.subReplyAvatarLink : styles.replyAvatarLink}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={depth > 0 ? styles.subReplyAvatar : styles.replyAvatar}>
                    {author.profile_picture ? (
                        <img
                            src={author.profile_picture}
                            alt={author.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                    ) : (
                        initial
                    )}
                </div>
            </Link>
        </div>
    )
}
 
ReplyAvatar.propTypes = {
    author: PropTypes.shape({
        username: PropTypes.string.isRequired,
        profile_picture: PropTypes.string,
    }).isRequired,
    depth: PropTypes.number.isRequired,
    styles: PropTypes.object.isRequired,
}
 
function ReplyActions({
    reply,
    childrenCount,
    isExpanded,
    onLike,
    onReply,
    onToggleExpand,
    styles,
}) {
    return (
        <div className={styles.replyActions} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
            <button
                type="button"
                className={[styles.replyActionBtn, reply.liked ? styles.likedBtn : ''].join(' ')}
                onClick={onLike}
                aria-label="Liker le commentaire"
            >
                <Heart size={11} className={reply.liked ? styles.heartActive : ''} />
                {(reply.likes_count || 0) > 0 && <span className={styles.replyActionCount}>{reply.likes_count}</span>}
            </button>
            <button
                type="button"
                className={styles.replyActionBtn}
                onClick={onReply}
                aria-label="Répondre au commentaire"
            >
                <MessageCircle size={11} />
                <span>Répondre</span>
            </button>
 
            {childrenCount > 0 && (
                <button
                    type="button"
                    className={styles.toggleSubRepliesBtn}
                    onClick={onToggleExpand}
                    aria-label={isExpanded ? "Masquer les réponses" : `Afficher les réponses (${childrenCount})`}
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp size={11} />
                            <span>Masquer</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown size={11} />
                            <span>Voir ({childrenCount})</span>
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
 
ReplyActions.propTypes = {
    reply: PropTypes.shape({
        id_message: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        liked: PropTypes.bool,
        likes_count: PropTypes.number,
    }).isRequired,
    childrenCount: PropTypes.number.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onLike: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    styles: PropTypes.object.isRequired,
}
 
PostCard.propTypes = {
    post: PropTypes.shape({
        id_message: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        content: PropTypes.string.isRequired,
        date_publication: PropTypes.string.isRequired,
        author: PropTypes.shape({
            id_user: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            username: PropTypes.string.isRequired,
            profile_picture: PropTypes.string,
        }).isRequired,
        likes_count: PropTypes.number,
        replies_count: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
        reply_to: PropTypes.object,
        media: PropTypes.shape({
            type: PropTypes.string,
            url: PropTypes.string,
        }),
    }).isRequired,
    threadVariant: PropTypes.string,
    animDelay: PropTypes.string,
    compact: PropTypes.bool,
    replies: PropTypes.array,
    editable: PropTypes.bool,
}
 
export default PostCard
