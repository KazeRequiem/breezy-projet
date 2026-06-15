import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeedPage from './FeedPage'
import { AuthProvider } from '../../contexts/AuthContext'

describe('FeedPage', () => {
    it('affiche la page de fil d\'actualité avec ses sections clés', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <FeedPage />
                </MemoryRouter>
            </AuthProvider>
        )

        // Devrait afficher le titre du fil
        expect(screen.getByRole('heading', { name: 'Accueil' })).toBeInTheDocument()

        // Devrait afficher la section tendances
        expect(screen.getByText('Tendances')).toBeInTheDocument()
    })

    it('permet d\'ouvrir la modal de composition de post', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <FeedPage />
                </MemoryRouter>
            </AuthProvider>
        )

        const newBreezyBtn = screen.getByRole('button', { name: /Nouveau Breeze/i })
        expect(newBreezyBtn).toBeInTheDocument()

        // La modal ne doit pas être ouverte au début
        expect(screen.queryByPlaceholderText(/Qu'avez-vous à partager avec le vent \?/i)).not.toBeInTheDocument()

        // Ouvrir la modal
        fireEvent.click(newBreezyBtn)

        // La modal doit s'ouvrir
        expect(screen.getByPlaceholderText(/Qu'avez-vous à partager avec le vent \?/i)).toBeInTheDocument()
    })
})
