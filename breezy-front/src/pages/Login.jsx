import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-breezy.png'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log({ email, password })
        // TODO: appel API login
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-6 sm:p-8">

                {/* Header */}
                <div className="mb-6 text-center">
                    <img src={logo} alt="Breezy" className="h-28 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
                    <p className="text-sm text-gray-500 mt-1">Bon retour sur Breezy</p>
                </div>

                {/* Form */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                    {/* Input email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-600">
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            placeholder="jean@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    {/* Input Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-600">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors mt-1"
                    >
                        Se connecter
                    </button>

                    {/* Link to Register */}
                    <p className="text-center text-sm text-gray-500">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium underline underline-offset-2">
                            S'inscrire
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    )
}

export default Login