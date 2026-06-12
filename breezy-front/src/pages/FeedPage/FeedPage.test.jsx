import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeedPage from './FeedPage'

describe('FeedPage', () => {
    it('affiche la page de fil d\'actualité avec ses sections clés', () => {
        render(
            <MemoryRouter>
                <FeedPage />
            </MemoryRouter>
        )

        // Devrait afficher le titre du fil
        expect(screen.getByRole('heading', { name: 'Accueil' })).toBeInTheDocument()

        // Devrait afficher les posts de démo (comme le premier post par baptistenoisette)
        expect(screen.getByText(/Premiere sortie avec la nouvelle UI Breezy/i)).toBeInTheDocument()

        // Devrait afficher la section tendances
        expect(screen.getByText('Tendances')).toBeInTheDocument()
    })

    it('permet d\'ouvrir la modal de composition de post', () => {
        render(
            <MemoryRouter>
                <FeedPage />
            </MemoryRouter>
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
