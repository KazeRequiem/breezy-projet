import PropTypes from 'prop-types'
import { Edit3, Plus, UserCheck, Settings } from 'lucide-react'
import styles from './ProfileHeader.module.css'

/**
 * ProfileHeader : En-tête de la page de profil.
 *
 * Affiche la bannière, l'avatar circulaire, le pseudo, la bio et les
 * boutons d'action (modifier ou suivre selon si c'est le profil connecté).
 *
 * @param {object}  user       - Données utilisateur (username, bio, location, etc.)
 * @param {boolean} isOwn      - Vrai si c'est le profil de l'utilisateur connecté
 * @param {boolean} isFollowing - Vrai si l'utilisateur connecté suit ce profil
 * @param {function} onFollow  - Handler du bouton Suivre/Ne plus suivre
 * @param {function} onEdit    - Handler du bouton Modifier le profil
 * @param {function} onNewPost - Handler du bouton Nouveau Breezy
 * @param {function} onSettings - Handler du bouton Paramètres
 */
function ProfileHeader({ user, isOwn = true, isFollowing = false, onFollow, onEdit, onNewPost, onSettings }) {
    const {
        username    = 'utilisateur',
        bio         = '',
        biography   = '',
        location    = '',
        banner_color = '#e88a8a',
        profile_picture = null,
    } = user

    // L'API renvoie « biography » ; on garde « bio » en repli
    const bioText = biography || bio

    // Initiale pour l'avatar par défaut
    const initial = username.charAt(0).toUpperCase()

    return (
        <div className={styles.wrapper}>
            {/* Bannière colorée */}
            <div
                className={styles.banner}
                style={{ 
                    background: banner_color.startsWith('#')
                        ? `linear-gradient(135deg, ${banner_color} 0%, ${shiftColor(banner_color)} 100%)`
                        : banner_color
                }}
                aria-hidden="true"
            />

            {/* Avatar circulaire chevauchant la bannière */}
            <div className={styles.avatarRing}>
                <div className={styles.avatar} aria-label={`Avatar de @${username}`}>
                    {profile_picture
                        ? <img src={profile_picture} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : initial
                    }
                </div>
            </div>

            {/* Infos utilisateur */}
            <div className={styles.userInfo}>
                <h1 className={styles.username}>@{username}</h1>
                {bioText  && <p className={styles.bio}>{bioText}</p>}
                {location && <p className={styles.location}>{location}</p>}
            </div>

            {/* Boutons d'action */}
            <div className={styles.actions}>
                {isOwn ? (
                    <>
                        <button
                            id="btn-settings"
                            className={styles.btnSecondary}
                            onClick={onSettings}
                            aria-label="Paramètres"
                            style={{ padding: '0 12px' }}
                        >
                            <Settings size={18} strokeWidth={2} />
                        </button>
                        <button
                            id="btn-edit-profile"
                            className={styles.btnSecondary}
                            onClick={onEdit}
                            aria-label="Modifier le profil"
                        >
                            <Edit3 size={15} strokeWidth={2} />
                            Modifier le profil
                        </button>
                        <button
                            id="btn-new-breezy"
                            className={styles.btnPrimary}
                            onClick={onNewPost}
                            aria-label="Nouveau Breezy"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            Nouveau Breezy
                        </button>
                    </>
                ) : (
                    <button
                        id="btn-follow"
                        className={isFollowing ? styles.btnFollowing : styles.btnPrimary}
                        onClick={onFollow}
                        aria-label={isFollowing ? 'Ne plus suivre' : 'Suivre'}
                    >
                        {isFollowing ? (
                            <><UserCheck size={15} strokeWidth={2} /> Abonné</>
                        ) : (
                            <><Plus size={15} strokeWidth={2.5} /> Suivre</>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

// Décale légèrement la teinte pour le dégradé de bannière
function shiftColor(hex) {
    try {
        const n = parseInt(hex.slice(1), 16)
        const r = Math.min(255, ((n >> 16) & 0xff) + 30)
        const g = Math.max(0,   ((n >>  8) & 0xff) - 20)
        const b = Math.max(0,   ( n        & 0xff) - 10)
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
    } catch {
        return '#d07070'
    }
}

ProfileHeader.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string,
        bio: PropTypes.string,
        location: PropTypes.string,
        banner_color: PropTypes.string,
        profile_picture: PropTypes.string
    }).isRequired,
    isOwn: PropTypes.bool,
    isFollowing: PropTypes.bool,
    onFollow: PropTypes.func,
    onEdit: PropTypes.func,
    onNewPost: PropTypes.func,
    onSettings: PropTypes.func
}

export default ProfileHeader
