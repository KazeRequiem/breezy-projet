import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormCard from '../components/FormCard'
import InputField from '../components/InputField'

function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log({ username, email, password, confirmPassword })
        // TODO: appel API register
    }

    return (
        <FormCard title="Créer un compte" subtitle="Rejoins Breezy dès maintenant">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                <InputField
                    label="Nom d'utilisateur"
                    type="text"
                    placeholder="jean_dupont"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <InputField
                    label="Adresse Email"
                    type="email"
                    placeholder="jean@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <InputField
                    label="Confirmer le mot de passe"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {/* Submit button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors mt-1"
                >
                    S'inscrire
                </button>

                {/* Conditions */}
                <p className="text-center text-xs text-gray-400">
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link to="/conditions" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
                        conditions d'utilisation
                    </Link>
                    {' '}et notre{' '}
                    <Link to="/confidentialite" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
                        politique de confidentialité
                    </Link>.
                </p>

                {/* Lien vers Login */}
                <p className="text-center text-sm text-gray-500">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium underline underline-offset-2">
                        Se connecter
                    </Link>
                </p>

            </form>
        </FormCard>
    )
}

export default Register