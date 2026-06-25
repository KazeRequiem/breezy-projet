import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { X, Image as ImageIcon } from 'lucide-react'
import { updateProfile } from '../../../services/userService'
import styles from './EditProfileModal.module.css'

/**
 * EditProfileModal : édition du profil de l'utilisateur connecté
 * (pseudo, biographie, photo). Enregistre via PUT /api/users/me.
 */
function EditProfileModal({ isOpen, user, onClose, onSaved }) {
    const [username, setUsername] = useState(user?.username ?? '')
    const [biography, setBiography] = useState(user?.biography ?? user?.bio ?? '')
    const [picture, setPicture] = useState(user?.profile_picture ?? null)
    const [status, setStatus] = useState('idle')
    const [error, setError] = useState('')
    const fileRef = useRef(null)

    if (!isOpen) return null

    const handlePicture = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setPicture(ev.target.result)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username.trim()) { setError("Le nom d'utilisateur ne peut pas être vide."); return }
        setStatus('saving'); setError('')
        try {
            const updated = await updateProfile({
                username: username.trim(),
                biography,
                profile_picture: picture,
            })
            onSaved(updated)
            onClose()
        } catch (err) {
            setError(err.message || "Erreur lors de la mise à jour du profil.")
        } finally {
            setStatus('idle')
        }
    }

    const initial = (username || '?').charAt(0).toUpperCase()

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Modifier le profil"
            onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
            <div className={[styles.modal, 'anim-scale-in'].join(' ')} onClick={(e) => e.stopPropagation()} role="document">
                <header className={styles.header}>
                    <h2 className={styles.title}>Modifier le profil</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer"><X size={20} /></button>
                </header>

                <form onSubmit={handleSubmit} className={styles.content}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar} aria-hidden="true">
                            {picture ? <img src={picture} alt="" className={styles.avatarImg} /> : initial}
                        </div>
                        <button type="button" className={styles.changePicBtn} onClick={() => fileRef.current?.click()}>
                            <ImageIcon size={16} /> Changer la photo
                        </button>
                        <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handlePicture} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="edit-username">Nom d'utilisateur</label>
                        <input id="edit-username" type="text" className={styles.input} value={username}
                            onChange={(e) => setUsername(e.target.value)} maxLength={50} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="edit-bio">Biographie</label>
                        <textarea id="edit-bio" className={styles.textarea} value={biography}
                            onChange={(e) => setBiography(e.target.value.slice(0, 160))} maxLength={160} rows={3}
                            placeholder="Parlez un peu de vous…" />
                        <span className={styles.charCounter}>{biography.length}/160</span>
                    </div>

                    {error && <p className={styles.errorMsg} aria-live="polite">{error}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={status === 'saving' || !username.trim()}>
                        {status === 'saving' ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                </form>
            </div>
        </div>
    )
}

EditProfileModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
}

export default EditProfileModal
