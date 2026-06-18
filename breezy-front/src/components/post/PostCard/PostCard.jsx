import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Wind, MoreHorizontal, Tag, Trash, AlertTriangle, X, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import RequireRole from '../../ui/RequireRole/RequireRole'
import styles from './PostCard.module.css'

import { formatRelativeTime } from '../../../utils/formatRelativeTime'

// Carte d'affichage d'un post (Feed principal & Centres d'intérêts)
function PostCard({ post, threadVariant, animDelay = '', compact = false, replies = [] }) {
    const {
        id_message,
        content,
        date_publication,
        author,
        likes_count    = 0,
        replies_count  = 0,
        tags           = [],
        reply_to       = null,
        media          = null,
    } = post

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
    }

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

    const handleCommentSubmit = (e) => {
        e.preventDefault()
        if (!newCommentText.trim()) return

        // ID unique pour éviter tout conflit de clés
        const commentId = crypto.randomUUID()
        const newComment = {
            id_message: commentId,
            content: newCommentText,
            date_publication: new Date().toISOString(),
            author: { id_user: user?.id_user ?? 1, username: currentLoggedUser || 'anonyme', profile_picture: null },
            likes_count: 0,
            liked: false,
            reply_to: replyingTo ? { id_message: replyingTo.id_message, author: { username: replyingTo.username } } : null
        }

        setLocalReplies(prev => [...prev, newComment])
        setRepliesCount(prev => prev + 1)
        
        if (replyingTo) {
            // Déplier automatiquement le commentaire parent pour voir la réponse
            setExpandedComments(prev => ({
                ...prev,
                [replyingTo.id_message]: true
            }))
        } else {
            // Afficher tous les commentaires pour que le nouveau commentaire tout en bas soit visible
            const currentRootCount = localReplies.filter(r => !r.reply_to || r.reply_to.id_message === post.id_message).length
            setVisibleRepliesCount(currentRootCount + 1)
        }

        setNewCommentText('')
        setReplyingTo(null)
        showToast('Commentaire ajouté ! 🍃')
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

    const handleDelete = (e) => {
        e.stopPropagation()
        setIsDeleted(true)
        showToast('Breeze supprimé avec succès.')
    }

    const handleReport = (e) => {
        e.stopPropagation()
        setIsReported(true)
        setShowMenu(false)
        showToast('Message signalé. Notre équipe va l\'examiner.')
    }

    const handleSendWhisper = (e) => {
        e.preventDefault()
        if (!whisperText.trim()) return

        setWhisperStatus('sending')
        setTimeout(() => {
            setWhisperStatus('sent')
            setTimeout(() => {
                setShowWhisper(false)
                setWhisperText('')
                setWhisperStatus('idle')
                showToast('Votre murmure a été soufflé à l\'auteur ! 🍃')
            }, 1000)
        }, 1200)
    }

    const showToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(''), 3000)
    }

    const handleLikeClick = (e) => {
        e.stopPropagation()
        setIsLiked(!isLiked)
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
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
                                    {author.username.charAt(0).toUpperCase()}
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

                {/* Contenu (max 280 chars selon BDD) */}
                <p className={styles.content}>{content}</p>

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

                {/* Tags (table tag via categorize) */}
                {tags.length > 0 && (
                    <div className={styles.tagList} aria-label="Tags du post">
                        {tags.map(tag => (
                            <span key={tag} className={styles.tagPill}>
                                <Tag size={10} strokeWidth={2} />
                                {tag}
                            </span>
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

                // Récupère les enfants directs d'un commentaire donné
                const getChildrenReplies = (commentId) => {
                    return localReplies.filter(r => r.reply_to && r.reply_to.id_message === commentId)
                }

                const renderReplyNode = (reply, depth = 0) => {
                    const children = getChildrenReplies(reply.id_message)
                    const isTargetOfReply = replyingTo && replyingTo.id_message === reply.id_message
                    const isExpanded = !!expandedComments[reply.id_message]
                    
                    return (
                        <div key={reply.id_message} className={styles.replyNode}>
                            <div
                                className={[
                                    depth > 0 ? styles.subReplyItem : styles.replyItem,
                                    children.length > 0 ? styles.clickableReplyItem : ''
                                ].join(' ')}
                                onClick={() => {
                                    if (children.length > 0) {
                                        toggleExpandComment(reply.id_message)
                                    }
                                }}
                            >
                                <div className={depth > 0 ? styles.subReplyAvatarCol : styles.replyAvatarCol}>
                                    <Link
                                        to={`/profile/${reply.author.username}`}
                                        className={depth > 0 ? styles.subReplyAvatarLink : styles.replyAvatarLink}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className={depth > 0 ? styles.subReplyAvatar : styles.replyAvatar}>
                                            {reply.author.username.charAt(0).toUpperCase()}
                                        </div>
                                    </Link>
                                </div>
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
                                        <div className={styles.replyToCommentBadge} onClick={(e) => e.stopPropagation()} role="presentation">
                                            En réponse à{' '}
                                            <Link to={`/profile/${reply.reply_to.author.username}`} className={styles.replyLink}>
                                                <strong>@{reply.reply_to.author.username}</strong>
                                            </Link>
                                        </div>
                                    )}

                                    <p className={styles.replyText}>{reply.content}</p>

                                    <div className={styles.replyActions} onClick={(e) => e.stopPropagation()} role="presentation">
                                        <button
                                            type="button"
                                            className={[styles.replyActionBtn, reply.liked ? styles.likedBtn : ''].join(' ')}
                                            onClick={() => handleLikeComment(reply.id_message)}
                                            aria-label="Liker le commentaire"
                                        >
                                            <Heart size={11} className={reply.liked ? styles.heartActive : ''} />
                                            {(reply.likes_count || 0) > 0 && <span className={styles.replyActionCount}>{reply.likes_count}</span>}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.replyActionBtn}
                                            onClick={() => setReplyingTo({ id_message: reply.id_message, username: reply.author.username })}
                                            aria-label="Répondre au commentaire"
                                        >
                                            <MessageCircle size={11} />
                                            <span>Répondre</span>
                                        </button>

                                        {/* Bouton pour afficher/masquer les réponses enfants */}
                                        {children.length > 0 && (
                                            <button
                                                type="button"
                                                className={styles.toggleSubRepliesBtn}
                                                onClick={() => toggleExpandComment(reply.id_message)}
                                                aria-label={isExpanded ? "Masquer les réponses" : `Afficher les réponses (${children.length})`}
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp size={11} />
                                                        <span>Masquer</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown size={11} />
                                                        <span>Voir ({children.length})</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Formulaire de réponse imbriqué (s'affiche directement sous le commentaire auquel on répond) */}
                                    {isTargetOfReply && (
                                        <div className={styles.replyInlineFormWrapper} onClick={(e) => e.stopPropagation()} role="presentation">
                                            {renderCommentForm()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rendu récursif des enfants si déplié (indents successives via CSS) */}
                            {children.length > 0 && isExpanded && (
                                <div
                                    className={styles.subRepliesList}
                                    style={{
                                        marginLeft: depth === 0 ? '20px' : depth === 1 ? '10px' : '0px',
                                        paddingLeft: depth === 0 ? '10px' : depth === 1 ? '6px' : '0px',
                                        borderLeft: depth >= 2 ? 'none' : undefined
                                    }}
                                >
                                    {children.map(child => renderReplyNode(child, depth + 1))}
                                </div>
                            )}
                        </div>
                    )
                }

                return (
                    <div className={[styles.repliesSection, 'anim-fade-up'].join(' ')} onClick={(e) => e.stopPropagation()} role="presentation">
                        
                        {/* Formulaire de commentaire sous le post (affiché uniquement s'il n'y a pas de réponse à un commentaire en cours) */}
                        {!replyingTo && renderCommentForm()}

                        {rootReplies.length > 0 ? (
                            rootReplies.slice(0, visibleRepliesCount).map(reply => renderReplyNode(reply, 0))
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
        </>
    )
}

export default PostCard
