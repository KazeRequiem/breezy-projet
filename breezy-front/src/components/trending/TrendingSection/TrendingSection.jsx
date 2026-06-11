import { TrendingUp, Hash } from 'lucide-react'
import styles from './TrendingSection.module.css'

/**
 * Tags de tendance et leurs statistiques.
 * À remplacer par les données de l'API. TODO !!!
 *
 * @type {Array<{tag: string, posts: number, category: string}>}
 */
const TRENDING = [
    { tag: 'Breezy',   posts: 1240, category: 'Technologie' },
    { tag: 'UIDesign', posts:  870, category: 'Design' },
    { tag: 'Glass',    posts:  634, category: 'Design' },
    { tag: 'React',    posts:  512, category: 'Dev' },
    { tag: 'WebDev',   posts:  388, category: 'Dev' },
    { tag: 'Vite',     posts:  210, category: 'Dev' },
    { tag: 'FrontEnd', posts:  185, category: 'Dev' },
]

/**
 * TrendingSection : Section des tendances (desktop, colonne droite).
 * Affiche les hashtags populaires avec leur nombre de posts.
 * Visible uniquement sur desktop (≥ 768px).
 */
function TrendingSection() {
    return (
        <aside className={styles.section} aria-label="Tendances">
            {/* En-tête */}
            <header className={styles.header}>
                <TrendingUp size={16} strokeWidth={2} color="var(--brand, #3b8cf0)" />
                <span className={styles.title}>Tendances</span>
            </header>

            {/* Liste des tags */}
            <ul className={styles.list} role="list">
                {TRENDING.map((item, i) => (
                    <TrendItem key={item.tag} item={item} rank={i + 1} />
                ))}
            </ul>

            {/* Lien "voir plus" */}
            <button className={styles.showMore} aria-label="Voir toutes les tendances">
                Voir plus de tendances
            </button>
        </aside>
    )
}

/** Item individuel de tendance */
function TrendItem({ item, rank }) {
    return (
        <li className={styles.trendItem} role="listitem">
            <div className={styles.trendLeft}>
                <span className={styles.trendRank}>{rank}</span>
                <div className={styles.trendInfo}>
                    <span className={styles.trendCategory}>{item.category}</span>
                    <button className={styles.trendTag} aria-label={`Tendance #${item.tag}`}>
                        <Hash size={12} strokeWidth={2.5} />
                        {item.tag}
                    </button>
                </div>
            </div>
            <span className={styles.trendCount}>
                {item.posts >= 1000
                    ? `${(item.posts / 1000).toFixed(1)}k`
                    : item.posts}{' '}posts
            </span>
        </li>
    )
}

export default TrendingSection
