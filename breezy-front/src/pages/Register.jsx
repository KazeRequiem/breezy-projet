import { Link } from 'react-router-dom'
import logo from '../assets/logo-breezy.png'

function Register() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">

            <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-6 sm:p-8">

                {/* Header */}
                <div className="mb-6 text-center">
                    <img src={logo} alt="Breezy" className="h-28 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Créer un compte</h1>
                    <p className="text-sm text-gray-500 mt-1">Rejoins Breezy dès maintenant</p>
                </div>

                {/* Form */}
                <form className="flex flex-col gap-4">

                    {/* Input username */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-600">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            placeholder="jean_dupont"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    {/* Input email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-600">
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            placeholder="jean@exemple.com"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    {/* Input password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-600">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    {/* Input confirm password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-600">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors mt-1"
                    >
                        S'inscrire
                    </button>

                    {/* Terms of service */}
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

                    {/* Link to Login */}
                    <p className="text-center text-sm text-gray-500">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium underline underline-offset-2">
                            Se connecter
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    )
}

export default Register