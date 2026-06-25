import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { MOODS } from '../../../utils/moods'
import mascotte from '../../../assets/mascotte-mood.png'

/**
 * MoodPanel : panneau explicatif des 10 humeurs (« moods ») de Breezy.
 * Affiche la mascotte + la liste des moods avec emoji, libellé et description.
 * Déposez l'image de la mascotte dans : breezy-front/public/mascotte-mood.png
 */
function MoodPanel({ isOpen, onClose }) {
    if (!isOpen) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Les humeurs de Breezy"
            onClick={onClose}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1100, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: 16,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            <div
                className="anim-scale-in"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
                style={{
                    background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '88vh', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                }}
            >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary,#1a1a2e)' }}>Les humeurs Breezy</h2>
                    <button onClick={onClose} aria-label="Fermer" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary,#5a5a7a)', display: 'flex', padding: 6 }}>
                        <X size={20} />
                    </button>
                </header>

                <div style={{ padding: 20, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                        <img
                            src={mascotte}
                            alt="Mascotte Breezy"
                            style={{ width: 96, height: 96, objectFit: 'contain', flexShrink: 0 }}
                        />
                        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary,#5a5a7a)', lineHeight: 1.4 }}>
                            Chaque Breeze peut porter une <strong>humeur</strong> : choisis la météo qui colle à ton message pour donner le bon ton.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {MOODS.map(m => (
                            <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(0,0,0,0.03)', borderRadius: 12, padding: '10px 12px' }}>
                                <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{m.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary,#1a1a2e)' }}>{m.label}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary,#5a5a7a)' }}>{m.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

MoodPanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default MoodPanel
