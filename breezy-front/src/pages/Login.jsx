import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormCard from '../components/FormCard'
import InputField from '../components/InputField'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log({ email, password })
        // TODO: appel API login
    }

    return (
        <FormCard title="Connexion" subtitle="Bon retour sur Breezy">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

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

                {/* Submit button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors mt-1"
                >
                    Se connecter
                </button>

                {/* Lien vers Register */}
                <p className="text-center text-sm text-gray-500">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium underline underline-offset-2">
                        S'inscrire
                    </Link>
                </p>

            </form>
        </FormCard>
    )
}

export default Login