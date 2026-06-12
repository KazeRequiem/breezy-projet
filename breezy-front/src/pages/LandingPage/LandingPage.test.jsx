import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from './LandingPage'

describe('LandingPage', () => {
    it('affiche le message de bienvenue et les boutons d\'action', () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: /Bienvenue sur/i })).toBeInTheDocument()
        expect(screen.getByText('Breezy')).toBeInTheDocument()
        expect(screen.getByText(/Connecte-toi avec tes amis/i)).toBeInTheDocument()

        const registerLink = screen.getByRole('link', { name: /Commencer gratuitement/i })
        expect(registerLink).toBeInTheDocument()
        expect(registerLink.getAttribute('href')).toBe('/register')

        const loginLink = screen.getByRole('link', { name: /Se connecter/i })
        expect(loginLink).toBeInTheDocument()
        expect(loginLink.getAttribute('href')).toBe('/login')
    })

    it('affiche les fonctionnalités clés', () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: /Messagerie/i })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Sécurisé/i })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Ultra rapide/i })).toBeInTheDocument()
    })
})
