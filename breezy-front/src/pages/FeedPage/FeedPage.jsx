import TopBar          from '../../components/layout/TopBar/TopBar'
import BottomNav        from '../../components/layout/BottomNav/BottomNav'
import Feed             from '../../components/post/Feed/Feed'
import TrendingSection  from '../../components/trending/TrendingSection/TrendingSection'
import BreezyAtmosphere from '../../components/ui/BreezyAtmosphere/BreezyAtmosphere'
import styles from './FeedPage.module.css'

/**
 * FeedPage : Page principale du fil d'actualité.
 *
 * Structure adaptative :
 * - Mobile  : TopBar fixe (haut) + Feed (scroll) + BottomNav (bas)
 * - Desktop : Sidebar gauche (BottomNav) + Feed centré + TrendingSection (droite)
 *
 * Des éléments décoratifs Breezy (halos, stries de vent) sont
 * superposés au fond holographique pour renforcer l'atmosphère.
 */
function FeedPage() {
    return (
        <div className={styles.wrapper}>
            {/* Fond holographique animé */}
            <div className="breezy-bg" aria-hidden="true" />

            {/* Éléments décoratifs Breezy */}
            <BreezyAtmosphere />

            {/* Navigation */}
            <TopBar />
            <BottomNav />

            {/* Layout principal */}
            <div className={styles.layout}>

                {/* Colonne centrale : fil d'actualité */}
                <main className={styles.mainColumn} role="main">
                    <Feed />
                </main>

                {/* Colonne droite : tendances (desktop uniquement) */}
                <aside className={styles.rightColumn} aria-label="Tendances et suggestions">
                    <TrendingSection />
                </aside>

            </div>
        </div>
    )
}

export default FeedPage
