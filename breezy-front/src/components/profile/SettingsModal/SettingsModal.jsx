import { useState } from 'react'
import { X, LogOut, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import styles from './SettingsModal.module.css'

function SettingsModal({ isOpen, onClose }) {
    const { logout } = useAuth()
    const navigate = useNavigate()
    
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [showOldPwd, setShowOldPwd] = useState(false)
    const [showNewPwd, setShowNewPwd] = useState(false)

    if (!isOpen) return null

    const handlePasswordChange = (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas.")
            return
        }
        if (newPassword.length < 6) {
            alert("Le nouveau mot de passe doit faire au moins 6 caractères.")
            return
        }
        
        // Simuler un appel API de changement de mot de passe
        setTimeout(() => {
            setSuccessMsg("Mot de passe modifié avec succès !")
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setSuccessMsg(''), 3000)
        }, 500)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Paramètres">
            <div className={[styles.modal, 'anim-scale-in'].join(' ')} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2 className={styles.title}>Paramètres</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer les paramètres">
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Changer de mot de passe</h3>
                        <form onSubmit={handlePasswordChange} className={styles.section}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="oldPwd">Ancien mot de passe</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        id="oldPwd"
                                        type={showOldPwd ? "text" : "password"}
                                        className={styles.input}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        style={{ paddingRight: '40px' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPwd(!showOldPwd)}
                                        style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                                        aria-label={showOldPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="newPwd">Nouveau mot de passe</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        id="newPwd"
                                        type={showNewPwd ? "text" : "password"}
                                        className={styles.input}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{ paddingRight: '40px' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPwd(!showNewPwd)}
                                        style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                                        aria-label={showNewPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="confirmPwd">Confirmer le nouveau mot de passe</label>
                                <input
                                    id="confirmPwd"
                                    type="password"
                                    className={styles.input}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className={styles.submitBtn}
                                disabled={!oldPassword || !newPassword || !confirmPassword}
                            >
                                Mettre à jour le mot de passe
                            </button>
                            {successMsg && <p className={styles.successMsg} aria-live="polite">{successMsg}</p>}
                        </form>
                    </section>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '10px 0' }} />

                    <section className={styles.section}>
                        <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Se déconnecter de Breezy">
                            <LogOut size={18} />
                            Se déconnecter
                        </button>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default SettingsModal
