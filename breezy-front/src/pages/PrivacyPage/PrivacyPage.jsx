import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import logoBreezy from '../../assets/logo-breezy.png'
import styles from '../TermsPage/TermsPage.module.css'

/**
 * PrivacyPage : Page de la Politique de Confidentialité.
 *
 * Présente les règles de gestion des données et le respect du RGPD.
 */
function PrivacyPage() {
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
                        <Shield size={24} color="var(--brand)" />
                        <h1>Politique de Confidentialité</h1>
                    </div>
                    <p className={styles.lastUpdate}>Dernière mise à jour : 10 juin 2026</p>
                </header>

                {/* Contenu des conditions */}
                <main className={styles.contentBox} role="main">
                    <section className={styles.section}>
                        <h2>1. Collecte des données</h2>
                        <p>
                            Breezy collecte les informations nécessaires à la création de votre compte, incluant votre adresse e-mail, votre nom d'utilisateur, et vos préférences de contenu (tags d'intérêts).
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Utilisation de vos données</h2>
                        <p>
                            Vos données sont utilisées exclusivement pour vous fournir nos services, personnaliser votre flux d'actualités et garantir la sécurité de votre compte. Nous ne vendons en aucun cas vos informations personnelles à des tiers.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Cookies et traceurs</h2>
                        <p>
                            Notre site utilise des cookies essentiels pour maintenir votre session de connexion. Si vous y avez consenti lors de l'inscription, nous pouvons également utiliser des cookies optionnels pour améliorer l'expérience utilisateur.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Vos droits (RGPD)</h2>
                        <p>
                            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition concernant vos données. Vous pouvez exercer ces droits à tout moment en supprimant votre compte depuis les paramètres ou en nous contactant.
                        </p>
                    </section>
                </main>

                {/* Pied de page avec bouton retour */}
                <footer className={styles.footer}>
                    <button 
                        className={styles.backBtn} 
                        onClick={() => navigate('/')}
                        aria-label="Retourner à l'accueil"
                        id="btn-back-privacy"
                    >
                        <ArrowLeft size={16} />
                        <span>Retourner à l'accueil</span>
                    </button>
                </footer>
            </div>
        </div>
    )
}

export default PrivacyPage
