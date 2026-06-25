import { useAuth } from '../../../contexts/AuthContext'

/**
 * RequireRole : Composant utilitaire de contrôle d'accès visuel (RBAC Front-End).
 * Usage :
 *   <RequireRole allowedRoles={['admin', 'moderator']}>
 *       <button>Bannir</button>
 *   </RequireRole>
 *
 * @param {string[]} allowedRoles  - Rôles autorisés à voir le contenu
 * @param {ReactNode} children     - Contenu à afficher si le rôle correspond
 * @param {ReactNode} [fallback]   - Contenu alternatif (défaut : null)
 */
function RequireRole({ allowedRoles, children, fallback = null }) {
    const { role } = useAuth()

    if (!role || !allowedRoles.includes(role)) {
        return fallback
    }

    return children
}

export default RequireRole
