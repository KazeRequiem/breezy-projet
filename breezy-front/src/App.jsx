import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import FeedPage from './pages/FeedPage/FeedPage'
import InterestsPage from './pages/InterestsPage/InterestsPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import NotificationsPage from './pages/NotificationsPage/NotificationsPage'
import TermsPage from './pages/TermsPage/TermsPage'

/**
 * App : Point d'entrée du routage React.
 *
 * Routes :
 *   /                   → Page d'accueil publique (LandingPage)
 *   /login              → Connexion              (LoginPage)
 *   /register           → Inscription            (RegisterPage)
 *   /feed               → Fil d'actualité        (FeedPage)
 *   /interests          → Centres d'intérêts    (InterestsPage)
 *   /profile/:username  → Page de profil          (ProfilePage)
 *   /notifs             → Notifications          (NotificationsPage)
 *   /terms              → Conditions d'Utilisation (TermsPage)
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/interests" element={<InterestsPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/notifs" element={<NotificationsPage />} />
                <Route path="/terms" element={<TermsPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
