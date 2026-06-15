import { createContext, useContext, useState, useEffect } from 'react'

/**
 * AuthContext : Contexte React central pour la session utilisateur.
 *
 * ── Stockage du token ────────────────────────────────────────────────────────
 * On utilise sessionStorage (et non localStorage) pour une raison de sécurité :
 *   • sessionStorage est effacé à la fermeture de l'onglet/navigateur,
 *     ce qui réduit considérablement la fenêtre d'exposition en cas d'XSS.
 *   • localStorage persiste indéfiniment → risque plus élevé.
 *
 * ⚠️  La vraie protection contre le vol de token (XSS) est le cookie httpOnly
 *     positionné par le serveur via Set-Cookie. C'est la responsabilité du Back.
 *     Côté Front, on ne peut pas faire mieux que sessionStorage sans cooperation
 *     du serveur.
 *
 * Contenu stocké : { user: { id_user, username, email, role }, token }
 * Exposé via useAuth() : { user, token, role, isAuthenticated, login, logout }
 */
const AuthContext = createContext(null)

const SESSION_TOKEN_KEY = 'breezy_token'
const SESSION_USER_KEY  = 'breezy_user'

export function AuthProvider({ children }) {
    const [user,  setUser]  = useState(null)
    const [token, setToken] = useState(null)

    // Restauration de la session depuis sessionStorage au montage
    // (survit aux rechargements de page dans le même onglet, pas à la fermeture)
    useEffect(() => {
        try {
            const storedToken = sessionStorage.getItem(SESSION_TOKEN_KEY)
            const storedUser  = sessionStorage.getItem(SESSION_USER_KEY)
            if (storedToken && storedUser) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            }
        } catch {
            // Token corrompu ou expiré → nettoyer
            sessionStorage.removeItem(SESSION_TOKEN_KEY)
            sessionStorage.removeItem(SESSION_USER_KEY)
        }
    }, [])

    /**
     * login() : Appelé après un login ou register réussi depuis l'API.
     * @param {string} newToken - JWT retourné par le back
     * @param {{ id_user, username, email, role }} newUser
     */
    const login = (newToken, newUser) => {
        sessionStorage.setItem(SESSION_TOKEN_KEY, newToken)
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
    }

    /** logout() : Nettoie la session et vide le state */
    const logout = () => {
        sessionStorage.removeItem(SESSION_TOKEN_KEY)
        sessionStorage.removeItem(SESSION_USER_KEY)
        setToken(null)
        setUser(null)
    }

    const value = {
        user,
        token,
        role:            user?.role ?? null,
        isAuthenticated: !!token,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * useAuth() : Hook de consommation du contexte auth.
 * Doit être utilisé à l'intérieur d'un <AuthProvider>.
 */
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
    return ctx
}
