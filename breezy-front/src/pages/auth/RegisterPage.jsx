import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Hash, ChevronRight, User, ImagePlus, Eye, EyeOff } from 'lucide-react'
import AuthCard   from '../../components/ui/AuthCard/AuthCard'
import GlassInput from '../../components/ui/GlassInput/GlassInput'
import { useAuth } from '../../contexts/AuthContext'
import { register as apiRegister, login as apiLogin } from '../../services/authService'
import styles from './AuthPage.module.css'
import regStyles from './RegisterPage.module.css'

// Liste des tags d'intérêts disponibles (correspond à la table tag)
const AVAILABLE_TAGS = [
    'Breezy', 'UIDesign', 'WebDev', 'React', 'FrontEnd',
    'Design', 'Tech', 'Art', 'Musique', 'Sport',
    'Voyage', 'Cuisine', 'Gaming', 'Cinema', 'Dev',
    'Mobile', 'Feedback', 'Glass', 'Vite', 'Nature',
]

// Captcha mathématique simple anti-robot
function generateCaptcha() {
    const ops = ['+', '-']
    const op  = ops[Math.floor(Math.random() * ops.length)]
    const a   = Math.floor(Math.random() * 10) + 1
    const b   = Math.floor(Math.random() * 9)  + 1
    const ans = op === '+' ? a + b : a - b
    return { question: `${a} ${op} ${b}`, answer: ans }
}

// Inscription en 3 étapes : Infos → Captcha → Profil/Tags favoris
function RegisterPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    /* État global du formulaire */
    const [step,   setStep]   = useState(1)
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState('')

    /* Étape 1 */
    const [creds, setCreds] = useState({ username: '', email: '', password: '', confirm: '' })
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [acceptPrivacy, setAcceptPrivacy] = useState(false)
    const [acceptCookies, setAcceptCookies] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    /* Étape 2 captcha */
    const [captcha]        = useState(generateCaptcha)
    const [captchaAnswer,   setCaptchaAnswer]   = useState('')

    /* Étape 3 profil */
    const [bio,          setBio]          = useState('')
    const [selectedTags, setSelectedTags] = useState([])

    /* Helpers */
    const updateCred = field => e => { setError(''); setCreds(p => ({ ...p, [field]: e.target.value })) }
    const toggleTag  = tag   => setSelectedTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )

    /* Soumission étape 1 */
    const handleStep1 = e => {
        e.preventDefault()
        setError('')

        if (!creds.username.trim()) {
            setError("Veuillez saisir un nom d'utilisateur.")
            return
        }
        if (creds.username.trim().length < 3) {
            setError("Le nom d'utilisateur doit contenir au moins 3 caractères.")
            return
        }
        if (!creds.email.trim()) {
            setError('Veuillez saisir votre adresse e-mail.')
            return
        }
        // Regex standard, non vulnérable au ReDoS (catastrophic backtracking)
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
        if (!emailRegex.test(creds.email.trim())) {
            setError('Veuillez saisir une adresse e-mail valide (ex : jean@exemple.com).')
            return
        }
        if (!creds.password) {
            setError('Veuillez saisir un mot de passe.')
            return
        }
        if (creds.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.')
            return
        }
        if (creds.password !== creds.confirm) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        if (!acceptTerms) {
            setError("Vous devez accepter les Conditions d'Utilisation pour continuer.")
            return
        }
        if (!acceptPrivacy) {
            setError("Vous devez accepter la Politique de Confidentialité pour continuer.")
            return
        }
        setStep(2)
    }

    /* Soumission étape 2 (captcha) */
    const handleStep2 = e => {
        e.preventDefault()
        setError('')
        if (parseInt(captchaAnswer, 10) !== captcha.answer) {
            setError('Mauvaise réponse. Reessaie !')
            setCaptchaAnswer('')
            return
        }
        setStep(3)
    }

    /* Soumission étape 3 — appel API réel */
    const handleStep3 = async e => {
        e.preventDefault()
        if (selectedTags.length === 0) { setError('Choisis au moins un centre d\'intérêt.'); return }
        setLoading(true)
        setError('')
        try {
            // 1. Créer le compte
            await apiRegister(creds.username, creds.email, creds.password, bio || null)

            // 2. Login automatique pour récupérer le token et le stocker
            const { token, user } = await apiLogin(creds.email, creds.password)
            login(token, user)

            navigate('/feed')
        } catch (err) {
            setError(err.message || 'Une erreur est survenue. Réessaie.')
        } finally {
            setLoading(false)
        }
    }

    /* Titres par étape */
    const titles    = ['Créer un compte', 'Vérification', 'Ton profil']
    const subtitles = [
        'Rejoins Breezy dès maintenant \uD83C\uDF0A',
        'Confirme que tu es bien humain \uD83E\uDD16',
        'Personnalise ton expérience \uD83C\uDF1F',
    ]

    return (
        <AuthCard title={titles[step - 1]} subtitle={subtitles[step - 1]}>

            {/* Indicateur d'étapes */}
            <StepIndicator current={step} total={3} />

            {/* Étape 1 : Infos de base */}
            {step === 1 && (
                <form className={styles.form} onSubmit={handleStep1} noValidate aria-label="Étape 1 : informations">
                    <GlassInput id="reg-username" label="Nom d'utilisateur" type="text"     placeholder="jean_dupont"      value={creds.username} onChange={updateCred('username')} required />
                    <GlassInput id="reg-email"    label="Adresse e-mail"   type="email"    placeholder="jean@exemple.com" value={creds.email}    onChange={updateCred('email')}    required />
                    <GlassInput 
                        id="reg-password" 
                        label="Mot de passe"     
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="********"      
                        value={creds.password} 
                        onChange={updateCred('password')} 
                        required 
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />
                    <GlassInput id="reg-confirm"  label="Confirmer"        type="password" placeholder="********"      value={creds.confirm}  onChange={updateCred('confirm')}  required />
                    
                    <div className={regStyles.termsBox} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <input
                                type="checkbox"
                                id="accept-terms"
                                checked={acceptTerms}
                                onChange={(e) => { setError(''); setAcceptTerms(e.target.checked) }}
                                required
                            />
                            <label htmlFor="accept-terms" style={{ fontSize: '0.85rem' }}>
                                J'accepte les <Link to="/terms" target="_blank" className={regStyles.termsLink}>Conditions d'Utilisation</Link>.
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <input
                                type="checkbox"
                                id="accept-privacy"
                                checked={acceptPrivacy}
                                onChange={(e) => { setError(''); setAcceptPrivacy(e.target.checked) }}
                                required
                            />
                            <label htmlFor="accept-privacy" style={{ fontSize: '0.85rem' }}>
                                J'accepte la <Link to="/privacy" target="_blank" className={regStyles.termsLink}>Politique de confidentialité</Link>.
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <input
                                type="checkbox"
                                id="accept-cookies"
                                checked={acceptCookies}
                                onChange={(e) => setAcceptCookies(e.target.checked)}
                            />
                            <label htmlFor="accept-cookies" style={{ fontSize: '0.85rem' }}>
                                J'accepte l'utilisation des cookies pour améliorer mon expérience (optionnel).
                            </label>
                        </div>
                    </div>

                    {error && <p className={styles.errorMsg} role="alert">{error}</p>}
                    <button type="submit" className={styles.btnPrimary} id="reg-next-1">Continuer <ChevronRight size={16} /></button>
                    <p className={styles.switchLink}>Déjà un compte ? <Link to="/login" id="link-to-login">Se connecter</Link></p>
                </form>
            )}

            {/* Étape 2 : Anti-robot */}
            {step === 2 && (
                <form className={styles.form} onSubmit={handleStep2} noValidate aria-label="Étape 2 : vérification">
                    <div className={regStyles.captchaBox}>
                        <p className={regStyles.captchaLabel}>Combien font :</p>
                        <p className={regStyles.captchaQuestion}>{captcha.question} = ?</p>
                    </div>
                    <GlassInput
                        id="captcha-answer"
                        label="Ta réponse"
                        type="number"
                        placeholder="..."
                        value={captchaAnswer}
                        onChange={e => { setError(''); setCaptchaAnswer(e.target.value) }}
                        required
                    />
                    {error && <p className={styles.errorMsg} role="alert">{error}</p>}
                    <button type="submit" className={styles.btnPrimary} id="reg-next-2">Valider <ChevronRight size={16} /></button>
                    <button type="button" className={regStyles.backBtn} onClick={() => { setError(''); setStep(1) }}>
                        ← Retour
                    </button>
                </form>
            )}

            {/* Étape 3 : Configuration du profil */}
            {step === 3 && (
                <form className={styles.form} onSubmit={handleStep3} noValidate aria-label="Étape 3 : profil">

                    {/* Photo de profil (placeholder — upload à brancher) */}
                    <div className={regStyles.avatarSection}>
                        <div className={regStyles.avatarPreview}>
                            <User size={32} color="rgba(120,100,160,0.5)" />
                        </div>
                        <button type="button" className={regStyles.uploadBtn} aria-label="Choisir une photo de profil">
                            <ImagePlus size={14} />
                            Choisir une photo
                        </button>
                        <p className={regStyles.uploadNote}>Format JPG ou PNG, max 5 Mo</p>
                    </div>

                    {/* Biographie */}
                    <div className={regStyles.bioField}>
                        <label htmlFor="reg-bio" className={regStyles.bioLabel}>Biographie <span>(facultatif)</span></label>
                        <textarea
                            id="reg-bio"
                            className={regStyles.bioTextarea}
                            placeholder="Dis-nous qui tu es en quelques mots..."
                            maxLength={160}
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={3}
                        />
                        <span className={regStyles.bioCount}>{bio.length}/160</span>
                    </div>

                    {/* Tags favoris */}
                    <div className={regStyles.tagsSection}>
                        <p className={regStyles.tagsLabel}>
                            <Hash size={14} />
                            Choisis tes centres d'intérêt
                            <span className={regStyles.tagsRequired}>*</span>
                        </p>
                        <div className={regStyles.tagGrid}>
                            {AVAILABLE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={[
                                        regStyles.tagOption,
                                        selectedTags.includes(tag) ? regStyles.tagOptionSelected : '',
                                    ].join(' ')}
                                    onClick={() => toggleTag(tag)}
                                    aria-pressed={selectedTags.includes(tag)}
                                    id={`tag-${tag}`}
                                >
                                    {selectedTags.includes(tag) && (
                                        <Check size={11} strokeWidth={3} />
                                    )}
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <p className={regStyles.tagsHint}>{selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} sélectionné{selectedTags.length > 1 ? 's' : ''}</p>
                    </div>

                    {error && <p className={styles.errorMsg} role="alert">{error}</p>}

                    <button type="submit" className={styles.btnPrimary} disabled={loading} aria-busy={loading} id="reg-finish">
                        {loading ? 'Création...' : 'Terminer et rejoindre Breezy \uD83C\uDF0A'}
                    </button>
                    <button type="button" className={regStyles.backBtn} onClick={() => { setError(''); setStep(2) }}>
                        ← Retour
                    </button>
                </form>
            )}

        </AuthCard>
    )
}

/**
 * StepIndicator : Affiche la progression en étapes (dots).
 *
 * @param {number} current - Étape actuelle (1-indexed)
 * @param {number} total   - Nombre total d'étapes
 */
function StepIndicator({ current, total }) {
    return (
        <div className={regStyles.stepIndicator} role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} aria-label={`Étape ${current} sur ${total}`}>
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={[
                        regStyles.stepDot,
                        i + 1 === current ? regStyles.stepDotActive : '',
                        i + 1 < current  ? regStyles.stepDotDone  : '',
                    ].join(' ')}
                    aria-hidden="true"
                >
                    {i + 1 < current && <Check size={8} strokeWidth={3} color="#fff" />}
                </div>
            ))}
        </div>
    )
}

export default RegisterPage
