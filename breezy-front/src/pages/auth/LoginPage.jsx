import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard  from '../../components/ui/AuthCard/AuthCard'
import GlassInput from '../../components/ui/GlassInput/GlassInput'
import styles from './AuthPage.module.css'

// Page de connexion utilisateur
function LoginPage() {
    const navigate = useNavigate()
    const [form,    setForm]    = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState('')

    const handleChange = field => e => {
        setError('')
        setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            // TODO: await authService.login(form.email, form.password)
            navigate('/feed')
        } catch {
            setError('Email ou mot de passe incorrect.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthCard title="Connexion" subtitle="Bon retour sur Breezy 👋">
            <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Formulaire de connexion">
                <GlassInput id="login-email"    label="Adresse e-mail" type="email"    placeholder="jean@exemple.com" value={form.email}    onChange={handleChange('email')}    required />
                <GlassInput id="login-password" label="Mot de passe"   type="password" placeholder="********"          value={form.password} onChange={handleChange('password')} required />

                {error && <p className={styles.errorMsg} role="alert">{error}</p>}

                <button id="login-submit" type="submit" className={styles.btnPrimary} disabled={loading} aria-busy={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>

                <p className={styles.switchLink}>
                    Pas encore de compte ?{' '}
                    <Link to="/register" id="link-to-register">S'inscrire</Link>
                </p>
            </form>
        </AuthCard>
    )
}

export default LoginPage
