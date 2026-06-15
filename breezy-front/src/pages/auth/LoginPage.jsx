import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard  from '../../components/ui/AuthCard/AuthCard'
import GlassInput from '../../components/ui/GlassInput/GlassInput'
import { useAuth } from '../../contexts/AuthContext'
import { login as apiLogin } from '../../services/authService'
import styles from './AuthPage.module.css'

// Page de connexion utilisateur
function LoginPage() {
    const navigate  = useNavigate()
    const { login } = useAuth()

    const [form,    setForm]    = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState('')

    const handleChange = field => e => {
        setError('')
        setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        // Validation côté front avant d'appeler l'API
        if (!form.email.trim()) {
            setError('Veuillez saisir votre adresse e-mail.')
            return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email.trim())) {
            setError('Veuillez saisir une adresse e-mail valide (ex : jean@exemple.com).')
            return
        }
        if (!form.password) {
            setError('Veuillez saisir votre mot de passe.')
            return
        }

        setLoading(true)
        try {
            const { token, user } = await apiLogin(form.email, form.password)
            login(token, user)
            // Redirection selon le rôle
            if (user.role === 'admin' || user.role === 'moderator') {
                navigate('/admin')
            } else {
                navigate('/feed')
            }
        } catch (err) {
            setError(err.message || 'Email ou mot de passe incorrect.')
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
