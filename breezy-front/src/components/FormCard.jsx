import logo from '../assets/logo-breezy.png'

/**
 * @param {string} title       - Titre principal affiché sous le logo
 * @param {string} subtitle    - Sous-titre / description courte
 * @param {React.ReactNode} children - Contenu du formulaire
 */
function FormCard({ title, subtitle, children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-6 sm:p-8">

                <div className="mb-6 text-center">
                    <img src={logo} alt="Breezy" className="h-28 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>

                {children}
            </div>
        </div>
    )
}

export default FormCard
