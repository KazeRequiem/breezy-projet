import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

describe('LoginPage', () => {
    it('affiche le formulaire de connexion avec email et mot de passe', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )

        expect(screen.getByLabelText(/Adresse e-mail/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /S'inscrire/i })).toBeInTheDocument()
    })

    it('permet de saisir les identifiants et de soumettre le formulaire', async () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )

        const emailInput = screen.getByLabelText(/Adresse e-mail/i)
        const passwordInput = screen.getByLabelText(/Mot de passe/i)
        const submitBtn = screen.getByRole('button', { name: /Se connecter/i })

        fireEvent.change(emailInput, { target: { value: 'jean@exemple.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(emailInput.value).toBe('jean@exemple.com')
        expect(passwordInput.value).toBe('password123')

        fireEvent.click(submitBtn)
        
        // La soumission navigue vers /feed
        expect(mockNavigate).toHaveBeenCalledWith('/feed')
    })
})
