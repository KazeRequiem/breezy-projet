import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider }   from './contexts/AuthContext'
import LandingPage        from './pages/LandingPage/LandingPage'
import LoginPage          from './pages/auth/LoginPage'
import RegisterPage       from './pages/auth/RegisterPage'
import FeedPage           from './pages/FeedPage/FeedPage'
import InterestsPage      from './pages/InterestsPage/InterestsPage'
import ProfilePage        from './pages/ProfilePage/ProfilePage'
import NotificationsPage  from './pages/NotificationsPage/NotificationsPage'
import TermsPage          from './pages/TermsPage/TermsPage'
import PrivacyPage        from './pages/PrivacyPage/PrivacyPage'
import AdminPage          from './pages/AdminPage/AdminPage'
import ErrorPage          from './pages/error/ErrorPage'

/**
 * App : Point d'entrée du routage React.
 *
 * <AuthProvider> enveloppe tout l'arbre pour que useAuth() soit
 * disponible dans chaque composant enfant.
 *
 * Routes :
 *   /                   → Page d'accueil publique (LandingPage)
 *   /login              → Connexion              (LoginPage)
 *   /register           → Inscription            (RegisterPage)
 *   /feed               → Fil d'actualité        (FeedPage)
 *   /interests          → Centres d'intérêts     (InterestsPage)
 *   /profile/:username  → Page de profil         (ProfilePage)
 *   /notifs             → Notifications          (NotificationsPage)
 *   /terms              → Conditions d'Utilisation (TermsPage)
 *   /admin              → Panneau admin          (AdminPage — protégé par RequireRole interne)
 *   /401                → Accès refusé           (ErrorPage code=401)
 *   *                   → Page introuvable       (ErrorPage code=404)
 */
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/"                   element={<LandingPage />} />
                    <Route path="/login"               element={<LoginPage />} />
                    <Route path="/register"            element={<RegisterPage />} />
                    <Route path="/feed"                element={<FeedPage />} />
                    <Route path="/interests"           element={<InterestsPage />} />
                    <Route path="/profile/:username"   element={<ProfilePage />} />
                    <Route path="/notifs"              element={<NotificationsPage />} />
                    <Route path="/terms"               element={<TermsPage />} />
                    <Route path="/privacy"             element={<PrivacyPage />} />
                    <Route path="/admin"               element={<AdminPage />} />
                    <Route path="/401"                 element={<ErrorPage code={401} />} />
                    <Route path="*"                    element={<ErrorPage code={404} />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
