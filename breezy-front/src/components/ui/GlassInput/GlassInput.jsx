import PropTypes from 'prop-types'

/**
 * GlassInput : Champ de formulaire au style glassmorphism.
 *
 * @param {string}   id          ID unique pour l'accessibilité
 * @param {string}   label       Libellé affiché au-dessus
 * @param {string}   type        Type HTML de l'input
 * @param {string}   placeholder Texte de substitution
 * @param {string}   value       Valeur contrôlée
 * @param {function} onChange    Handler de changement
 * @param {boolean}  [required]  Champ obligatoire
 */
function GlassInput({ id, label, type = 'text', placeholder, value, onChange, required = false, rightElement }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor={id} style={labelStyle}>{label}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    style={{ ...inputBase, paddingRight: rightElement ? '40px' : '16px' }}
                    onFocus={e  => Object.assign(e.target.style, { ...inputFocused, paddingRight: rightElement ? '40px' : '16px' })}
                    onBlur={e   => Object.assign(e.target.style, { ...inputBase, paddingRight: rightElement ? '40px' : '16px' })}
                />
                {rightElement && (
                    <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center' }}>
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    )
}

const labelStyle = {
    fontSize: '0.82rem', fontWeight: '600',
    color: 'var(--text-secondary)', letterSpacing: '0.01em',
}

const inputBase = {
    width: '100%', height: '46px', padding: '0 16px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.65)',
    background: 'rgba(255,255,255,0.50)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--text-primary)',
    outline: 'none',
    transition: 'background 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
    boxShadow: 'none', borderColor: 'rgba(255,255,255,0.65)',
}

const inputFocused = {
    ...inputBase,
    background: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(59,140,240,0.50)',
    boxShadow: '0 0 0 3px rgba(59,140,240,0.15)',
}

GlassInput.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    rightElement: PropTypes.node
}

export default GlassInput
