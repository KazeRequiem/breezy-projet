import { Link } from 'react-router-dom'
import logoSimpliste from '../assets/logo-simpliste-breezy.png'

function Navbar() {
    return (
        <header className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <img src={logoSimpliste} alt="Breezy" className="h-32" />
            <div className="flex gap-2">
                <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-blue-500 px-3 py-1.5 rounded-lg transition"
                >
                    Connexion
                </Link>
                <Link
                    to="/register"
                    className="text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg transition"
                >
                    S'inscrire
                </Link>
            </div>
        </header>
    )
}

export default Navbar
