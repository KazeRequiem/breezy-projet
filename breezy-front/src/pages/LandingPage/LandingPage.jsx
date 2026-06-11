import { Link } from 'react-router-dom'
import logoBreezy from '../../assets/logo-breezy.png'
import styles from './LandingPage.module.css'

/**
 * LandingPage : Page d'accueil publique de Breezy.
 *
 * Structure :
 * - Fond holographique animé + halos décoratifs
 * - Hero : logo, slogan, CTAs (S'inscrire / Se connecter)
 * - Section fonctionnalités : 3 cartes glassmorphism
 */
function LandingPage() {
    return (
        <div className={styles.wrapper}>
            <div className="breezy-bg" aria-hidden="true" />

            {/* Halos décoratifs */}
            <div className={styles.halo1} aria-hidden="true" />
            <div className={styles.halo2} aria-hidden="true" />

            {/* Strie de vent décorative */}
            <div className={styles.windLine} aria-hidden="true" />

            <main className={styles.content} role="main">

                {/* Hero */}
                <section className={[styles.hero, 'anim-fade-up'].join(' ')} aria-label="Presentation">
                    <img src={logoBreezy} alt="Logo Breezy" className={styles.heroLogo} />

                    <h1 className={styles.heroTitle}>
                        Bienvenue sur{' '}
                        <span className={styles.heroTitleBrand}>Breezy</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Connecte-toi avec tes amis, partage des moments,
                        profite d'une expérience fluide et colorée.
                    </p>

                    <div className={styles.ctaGroup}>
                        <Link to="/register" className={styles.ctaPrimary} id="cta-register">
                            Commencer gratuitement
                        </Link>
                        <Link to="/login" className={styles.ctaSecondary} id="cta-login">
                            Se connecter
                        </Link>
                    </div>
                </section>

                {/* Fonctionnalites */}
                <section className={styles.features} aria-label="Fonctionnalites">
                    {FEATURES.map((feat, i) => (
                        <article
                            key={feat.title}
                            className={[styles.featureCard, 'anim-fade-up', i > 0 ? `anim-delay-${i}` : ''].join(' ')}
                            aria-label={feat.title}
                        >
                            <span className={styles.featureEmoji} aria-hidden="true">{feat.emoji}</span>
                            <h2 className={styles.featureTitle}>{feat.title}</h2>
                            <p className={styles.featureDesc}>{feat.desc}</p>
                        </article>
                    ))}
                </section>

            </main>
        </div>
    )
}

const FEATURES = [
    { emoji: '\uD83D\uDCAC', title: 'Messagerie',   desc: "Échange avec tes amis en temps réel, partout." },
    { emoji: '\uD83D\uDD12', title: 'Sécurisé',      desc: "Tes données restent privées et protégées." },
    { emoji: '\u26A1',       title: 'Ultra rapide',  desc: "Une expérience fluide sur tous tes appareils." },
]

export default LandingPage
