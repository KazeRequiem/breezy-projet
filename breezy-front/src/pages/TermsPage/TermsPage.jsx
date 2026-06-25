import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import logoBreezy from '../../assets/logo-breezy.png'
import styles from './TermsPage.module.css'

/**
 * TermsPage : Page des Conditions Générales d'Utilisation (CGU).
 *
 * Présente les règles de la plateforme sous forme de sections scrollables
*/
function TermsPage() {
    const navigate = useNavigate()

    return (
        <div className={styles.wrapper}>
            <div className="breezy-bg" aria-hidden="true" />
            <BreezyAtmosphere />

            <div className={[styles.container, 'anim-fade-up'].join(' ')}>
                {/* En-tête */}
                <header className={styles.header}>
                    <img src={logoBreezy} alt="Logo Breezy" className={styles.logo} />
                    <div className={styles.titleGroup}>
                        <FileText size={24} color="var(--brand)" />
                        <h1>Conditions d'Utilisation</h1>
                    </div>
                    <p className={styles.lastUpdate}>Dernière mise à jour : 10 juin 2026</p>
                </header>

                {/* Contenu des conditions */}
                <main className={styles.contentBox} role="main">
                    <section className={styles.section}>
                        <h2>1. Acceptation des conditions</h2>
                        <p>
                            En créant un compte ou en accédant à l'application Breezy, vous acceptez sans réserve d'être lié par les présentes Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces termes, veuillez ne pas utiliser nos services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Contenu publié (Breezys)</h2>
                        <p>
                            Vous êtes l'unique responsable du contenu (textes, images, tags) que vous publiez sur Breezy. Vous vous engagez à ne pas diffuser de messages à caractère haineux, diffamatoire, injurieux, obscène, discriminatoire ou enfreignant les lois en vigueur.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Whisper et réactions privées</h2>
                        <p>
                            La fonctionnalité de Whisper vous permet d'envoyer des réactions privées aux auteurs de posts. Ces messages secrets doivent respecter les règles de respect d'autrui. Tout abus de cette fonctionnalité (harcèlement, spam) entraînera une suspension immédiate de votre compte.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Signalement et modération</h2>
                        <p>
                            Breezy met à disposition un bouton de signalement (les 3 points sur chaque post) permettant à la communauté de notifier tout contenu inapproprié. Notre équipe examine les signalements dans les plus brefs délais et se réserve le droit de supprimer tout post non conforme ou de bannir les utilisateurs contrevenants.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Protection des données</h2>
                        <p>
                            Nous collectons les données nécessaires au bon fonctionnement de votre compte (adresse e-mail, pseudonyme, biographie). Breezy s'engage à ne jamais vendre vos données personnelles à des tiers.
                        </p>
                    </section>
                </main>

                {/* Pied de page avec bouton retour */}
                <footer className={styles.footer}>
                    <button 
                        className={styles.backBtn} 
                        onClick={() => navigate('/')}
                        aria-label="Retourner à l'accueil"
                        id="btn-back-terms"
                    >
                        <ArrowLeft size={16} />
                        <span>Retourner à l'accueil</span>
                    </button>
                </footer>
            </div>
        </div>
    )
}

export default TermsPage
