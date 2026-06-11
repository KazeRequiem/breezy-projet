import styles from './BreezyAtmosphere.module.css'

// Arrière-plan avec les halos de brume et les stries de vent
function BreezyAtmosphere() {
    return (
        <div className={styles.atmosphere} aria-hidden="true">
            {/* Halos */}
            <div className={`${styles.halo} ${styles.halo1}`} />
            <div className={`${styles.halo} ${styles.halo2}`} />

            {/* Stries de vent */}
            <div className={`${styles.windStreak} ${styles.ws1}`} />
            <div className={`${styles.windStreak} ${styles.ws2}`} />
        </div>
    )
}

export default BreezyAtmosphere
