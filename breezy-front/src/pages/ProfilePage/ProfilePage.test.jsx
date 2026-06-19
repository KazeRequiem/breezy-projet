import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProfilePage from './ProfilePage'
import { vi } from 'vitest'
import { getMockUser as mockGetMockUser } from '../../services/mockData'

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: { username: 'baptistenoisette' } })),
    AuthProvider: ({ children }) => <>{children}</>
}))

vi.mock('../../services/userService', () => ({
    getUserByUsername: vi.fn((username) => {
        const user = mockGetMockUser(username)
        if (!user) {
            return Promise.reject(new Error('User not found'))
        }
        return Promise.resolve(user)
    })
}))

describe('ProfilePage', () => {
    it('affiche le profil de l\'utilisateur connecté par défaut', async () => {
        render(
            <MemoryRouter initialEntries={['/profile']}>
                <Routes>
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </MemoryRouter>
        )

        // Devrait afficher les infos de baptistenoisette (par défaut)
        expect(await screen.findByRole('heading', { name: /baptistenoisette/i })).toBeInTheDocument()
        expect(screen.getByText(/Dev web, café addict/i)).toBeInTheDocument()
        expect(screen.getByText(/Paris, France/i)).toBeInTheDocument()

        // Devrait afficher ses stats
        expect(screen.getByRole('button', { name: '6 Breezes' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '286 Abonnés' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '379 Suivis' })).toBeInTheDocument()

        // Bouton de Nouveau Breezy (car c'est son propre profil)
        expect(screen.getByRole('button', { name: /Nouveau Breezy/i })).toBeInTheDocument()
    })

    it('affiche le profil d\'un autre utilisateur et permet de le suivre', async () => {
        render(
            <MemoryRouter initialEntries={['/profile/camille_lrt']}>
                <Routes>
                    <Route path="/profile/:username" element={<ProfilePage />} />
                </Routes>
            </MemoryRouter>
        )

        // Devrait afficher les infos de camille_lrt
        expect(await screen.findByRole('heading', { name: /camille_lrt/i })).toBeInTheDocument()
        expect(screen.getByText(/Product Designer & passionnée/i)).toBeInTheDocument()

        // Bouton Suivre (car ce n'est pas son profil)
        const followBtn = screen.getByRole('button', { name: /Suivre/i })
        expect(followBtn).toBeInTheDocument()

        // Le nombre de followers de camille_lrt est 412
        expect(screen.getByRole('button', { name: '412 Abonnés' })).toBeInTheDocument()

        // Cliquer sur suivre
        fireEvent.click(followBtn)

        // Le bouton doit changer pour "Ne plus suivre" (aria-label) et les followers passer à 413
        expect(screen.getByRole('button', { name: /Ne plus suivre/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '413 Abonnés' })).toBeInTheDocument()
    })

    it('affiche un message d\'erreur si le profil n\'existe pas', async () => {
        render(
            <MemoryRouter initialEntries={['/profile/inconnu']}>
                <Routes>
                    <Route path="/profile/:username" element={<ProfilePage />} />
                </Routes>
            </MemoryRouter>
        )

        expect(await screen.findByRole('heading', { name: /Profil introuvable/i })).toBeInTheDocument()
        expect(screen.getByText(/L'utilisateur/i)).toBeInTheDocument()
        expect(screen.getByText('@inconnu')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Retourner à l'accueil/i })).toBeInTheDocument()
    })
})
