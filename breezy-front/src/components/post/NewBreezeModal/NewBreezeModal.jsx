import { useState, useRef, useCallback } from 'react'
import { X, Send, PenTool, Image as ImageIcon } from 'lucide-react'
import styles from './NewBreezeModal.module.css'

function NewBreezeModal({ isOpen, onClose, onPublish }) {
    const [content, setContent] = useState('')
    const [media, setMedia] = useState(null)
    const [status, setStatus] = useState('idle') // 'idle' | 'publishing' | 'published'
    
    const fileInputRef = useRef(null)
    const publishingTimeoutRef = useRef(null)
    const closeTimeoutRef = useRef(null)

    // Nettoyage des timeouts au démontage via ref de fermeture
    const clearTimeouts = useCallback(() => {
        if (publishingTimeoutRef.current) clearTimeout(publishingTimeoutRef.current)
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }, [])

    // Reset de l'état du modal à l'ouverture (géré dans handleOpen appelé par le parent)
    const handleReset = useCallback(() => {
        clearTimeouts()
        setContent('')
        setMedia(null)
        setStatus('idle')
    }, [clearTimeouts])

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        const type = file.type.startsWith('image/') ? 'image' : 'video'
        setMedia({ url, type, file })
    }

    const handleRemoveMedia = () => {
        if (media?.url) {
            URL.revokeObjectURL(media.url)
        }
        setMedia(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!content.trim() && !media) return

        setStatus('publishing')
        
        // Simuler le délai réseau de publication et nettoyer proprement
        publishingTimeoutRef.current = setTimeout(() => {
            setStatus('published')
            closeTimeoutRef.current = setTimeout(() => {
                onPublish(content, media)
                onClose()
            }, 800)
        }, 1000)
    }

    // Libérer l'URL d'objet à la fermeture du modal pour éviter les fuites de mémoire, puis reset
    const handleClose = () => {
        if (media?.url) {
            URL.revokeObjectURL(media.url)
        }
        handleReset()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div 
            className={styles.overlay} 
            role="dialog" 
            aria-modal="true" 
            aria-label="Écrire un nouveau Breeze"
            onClick={handleClose}
        >
            <div 
                className={[styles.modal, 'anim-fade-up'].join(' ')}
                onClick={(e) => e.stopPropagation()}
            >
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <PenTool size={18} color="var(--brand)" />
                        <h3>Nouveau Breeze</h3>
                    </div>
                    <button 
                        type="button"
                        className={styles.closeBtn} 
                        onClick={handleClose}
                        aria-label="Fermer"
                        id="btn-close-new-breeze"
                    >
                        <X size={16} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        className={styles.textarea}
                        placeholder="Qu'avez-vous à partager avec le vent ? 🍃"
                        value={content}
                        onChange={(e) => setContent(e.target.value.slice(0, 280))}
                        maxLength={280}
                        disabled={status !== 'idle'}
                        autoFocus
                    />

                    {media && (
                        <div className={styles.mediaPreviewContainer}>
                            {media.type === 'image' ? (
                                <img src={media.url} alt="Aperçu" className={styles.previewMedia} />
                            ) : (
                                <video src={media.url} controls className={styles.previewMedia} />
                            )}
                            <button
                                type="button"
                                className={styles.removeMediaBtn}
                                onClick={handleRemoveMedia}
                                aria-label="Supprimer le média"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    
                    <div className={styles.footer}>
                        <div className={styles.attachmentButtons}>
                            <button
                                type="button"
                                className={styles.attachBtn}
                                onClick={() => fileInputRef.current?.click()}
                                title="Ajouter une photo ou vidéo"
                                aria-label="Ajouter une photo ou vidéo"
                                disabled={status !== 'idle'}
                            >
                                <ImageIcon size={18} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <span className={styles.charCounter}>{content.length}/280</span>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={(!content.trim() && !media) || status !== 'idle'}
                            id="btn-submit-breezy"
                        >
                            {status === 'publishing' ? (
                                <span>Publication...</span>
                            ) : status === 'published' ? (
                                <span>Publié ! 🍃</span>
                            ) : (
                                <>
                                    <Send size={14} />
                                    <span>Publier</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewBreezeModal
