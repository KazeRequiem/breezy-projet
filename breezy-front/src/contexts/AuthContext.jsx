/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// TODO (Sécurité) : Quand le back passera aux cookies httpOnly, on ne gérera plus le token ici.
// Le navigateur le stockera et l'enverra tout seul. On gardera uniquement SESSION_USER_KEY.
const SESSION_TOKEN_KEY = 'breezy_token'
const SESSION_USER_KEY  = 'breezy_user'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = sessionStorage.getItem(SESSION_USER_KEY)
            return storedUser ? JSON.parse(storedUser) : null
        } catch {
            sessionStorage.removeItem(SESSION_USER_KEY)
            return null
        }
    })
    
    const [token, setToken] = useState(() => {
        try {
            const storedToken = sessionStorage.getItem(SESSION_TOKEN_KEY)
            return storedToken || null
        } catch {
            sessionStorage.removeItem(SESSION_TOKEN_KEY)
            return null
        }
    })

    /**
     * login() : Appelé après un login ou register réussi depuis l'API.
     * @param {string} newToken - JWT retourné par le back
     * @param {{ id_user, username, email, role }} newUser
     */
    const login = (newToken, newUser) => {
        // TODO (Sécurité) : Avec httpOnly, `newToken` ne sera plus fourni ou on l'ignorera.
        // On fera juste : sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser))
        sessionStorage.setItem(SESSION_TOKEN_KEY, newToken)
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
    }

    /** logout() : Nettoie la session et vide le state */
    const logout = () => {
        // TODO (Sécurité) : Avec httpOnly, il faudra d'abord faire un appel API (ex: fetch('/api/auth/logout')) 
        // pour dire au serveur de supprimer le cookie, avant de vider le state local.
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
