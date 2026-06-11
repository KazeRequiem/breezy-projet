import styles from './ProfileStats.module.css'

/**
 * ProfileStats : Barre de statistiques du profil.
 *
 * Affiche le nombre de posts publiés, d'abonnés et de comptes suivis.
 * Chaque stat est cliquable (pour voir la liste à terme).
 *
 * @param {number} breezesCount  - Nombre de posts publiés
 * @param {number} followersCount - Nombre d'abonnés
 * @param {number} followingCount - Nombre de comptes suivis
 */
function ProfileStats({ breezesCount = 0, followersCount = 0, followingCount = 0 }) {
    return (
        <div className={styles.stats} role="group" aria-label="Statistiques du profil">
            <StatItem value={breezesCount}  label="Breezes"  id="stat-breezes"   />
            <div className={styles.divider} aria-hidden="true" />
            <StatItem value={followersCount} label="Abonnés" id="stat-abonnes"  />
            <div className={styles.divider} aria-hidden="true" />
            <StatItem value={followingCount} label="Suivis"  id="stat-suivis"   />
        </div>
    )
}

function StatItem({ value, label, id }) {
    return (
        <button className={styles.statItem} id={id} aria-label={`${value} ${label}`}>
            <span className={styles.statValue}>{formatCount(value)}</span>
            <span className={styles.statLabel}>{label}</span>
        </button>
    )
}

// Abrège les grands nombres (ex: 1240 → 1.2k)
function formatCount(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000)    return `${(n / 1000).toFixed(1)}k`
    return String(n)
}

export default ProfileStats
