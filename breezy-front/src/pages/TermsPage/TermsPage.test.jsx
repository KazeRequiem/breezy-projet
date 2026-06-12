import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TermsPage from './TermsPage'

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

describe('TermsPage', () => {
    it('affiche le titre et les sections principales', () => {
        render(
            <MemoryRouter>
                <TermsPage />
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: /Conditions d'Utilisation/i })).toBeInTheDocument()
        expect(screen.getByText(/1. Acceptation des conditions/i)).toBeInTheDocument()
        expect(screen.getByText(/2. Contenu publié \(Breezys\)/i)).toBeInTheDocument()
        expect(screen.getByText(/3. Whisper et réactions privées/i)).toBeInTheDocument()
        expect(screen.getByText(/4. Signalement et modération/i)).toBeInTheDocument()
        expect(screen.getByText(/5. Protection des données/i)).toBeInTheDocument()
    })

    it('navigue vers l\'accueil lors du clic sur le bouton retour', () => {
        render(
            <MemoryRouter>
                <TermsPage />
            </MemoryRouter>
        )

        const backBtn = screen.getByRole('button', { name: /Retourner à l'accueil/i })
        expect(backBtn).toBeInTheDocument()
        
        fireEvent.click(backBtn)
        expect(mockNavigate).toHaveBeenCalledWith('/')
    })
})
