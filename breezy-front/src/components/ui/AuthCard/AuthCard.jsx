import logoBreezy from '../../../assets/logo-breezy.png'
import styles from './AuthCard.module.css'

/**
 * AuthCard — Card glassmorphism pour les pages d'authentification.
 *
 * @param {string}          title     Titre principal (ex : "Connexion")
 * @param {string}          subtitle  Sous-titre descriptif
 * @param {React.ReactNode} children  Contenu du formulaire
 */
function AuthCard({ title, subtitle, children }) {
    return (
        <div className={styles.pageWrapper}>
            <div className="breezy-bg" aria-hidden="true" />

            {/* Halos décoratifs */}
            <div className={styles.halo1} aria-hidden="true" />
            <div className={styles.halo2} aria-hidden="true" />

            <main className={[styles.card, 'anim-fade-up'].join(' ')} role="main">
                <div className={styles.logoWrapper}>
                    <img src={logoBreezy} alt="Logo Breezy" className={styles.logo} />
                </div>
                <header className={styles.cardHeader}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>
                </header>
                {children}
            </main>
        </div>
    )
}

export default AuthCard
