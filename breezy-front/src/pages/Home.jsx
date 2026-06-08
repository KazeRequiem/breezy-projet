import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-white">

            <Navbar />

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-5 py-16 gap-6">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
                    Bienvenue sur <span className="text-blue-500">Breezy</span>
                </h1>
                <p className="text-gray-500 text-base sm:text-lg max-w-sm">
                    Connecte-toi avec tes amis, partage des moments, profite de l'essentiel.
                </p>
                <Link
                    to="/register"
                    className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm sm:text-base"
                >
                    Commencer gratuitement
                </Link>
            </main>

            {/* Features */}
            <section className="px-5 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto w-full">
                {[
                    { title: 'Messagerie', desc: 'Échange avec tes amis en temps réel' },
                    { title: 'Sécurisé', desc: 'Tes données restent privées et protégées' },
                    { title: 'Rapide', desc: 'Une expérience fluide sur tous tes appareils' },
                ].map((f) => (
                    <div key={f.title} className="bg-gray-50 rounded-2xl p-5 text-left border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-800">{f.title}</h2>
                        <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                    </div>
                ))}
            </section>

            <Footer />

        </div>
    )
}

export default Home