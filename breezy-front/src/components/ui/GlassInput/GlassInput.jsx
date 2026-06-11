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
function GlassInput({ id, label, type = 'text', placeholder, value, onChange, required = false }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor={id} style={labelStyle}>{label}</label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                style={inputBase}
                onFocus={e  => Object.assign(e.target.style, inputFocused)}
                onBlur={e   => Object.assign(e.target.style, inputBase)}
            />
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

export default GlassInput
