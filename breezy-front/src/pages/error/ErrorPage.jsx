import { useNavigate } from 'react-router-dom'
import styles from './ErrorPage.module.css'

function ErrorPage({ code = 404 }) {
    const navigate = useNavigate()

    return (
        <div className={styles.wrapper}>
            <div className="breezy-bg" aria-hidden="true" />
            <div className={styles.halo1} aria-hidden="true" />
            <div className={styles.halo2} aria-hidden="true" />

            <main className={[styles.card, 'anim-fade-up'].join(' ')} role="main">
                <span className={styles.code} aria-hidden="true">{code}</span>
                <div className={styles.windLine} aria-hidden="true" />
                <button
                    className={styles.btnSecondary}
                    onClick={() => navigate('/')}
                    id={`btn-go-back-${code}`}
                >
                    ← Retour à l'accueil
                </button>
            </main>
        </div>
    )
}

export default ErrorPage
