import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import { AuthProvider } from '../../contexts/AuthContext'
import * as authService from '../../services/authService'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

vi.mock('../../services/authService', () => ({
    register: vi.fn(),
    login: vi.fn()
}))

describe('RegisterPage', () => {
    let randomSpy

    beforeEach(() => {
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    })

    afterEach(() => {
        randomSpy.mockRestore()
    })

    it('affiche l\'étape 1 et valide les champs requis', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </AuthProvider>
        )

        expect(screen.getByRole('heading', { name: /Créer un compte/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/Nom d'utilisateur/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Adresse e-mail/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Confirmer/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/En cochant cette case, j'accepte/i)).toBeInTheDocument()

        const submitBtn = screen.getByRole('button', { name: /Continuer/i })
        fireEvent.click(submitBtn)

        expect(screen.getByRole('alert')).toHaveTextContent(/Vous devez accepter les Conditions d'Utilisation/i)
    })

    it('permet de passer à l\'étape 2 puis à l\'étape 3', async () => {
        authService.register.mockResolvedValueOnce({})
        authService.login.mockResolvedValueOnce({
            token: 'fake-jwt',
            user: { id_user: 1, role: 'user', username: 'testuser' }
        })

        render(
            <AuthProvider>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </AuthProvider>
        )

        // Étape 1
        fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText(/Adresse e-mail/i), { target: { value: 'test@exemple.com' } })
        fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByLabelText(/Confirmer/i), { target: { value: 'password123' } })
        fireEvent.click(screen.getByLabelText(/En cochant cette case, j'accepte/i))

        fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))

        // Étape 2
        expect(screen.getByRole('heading', { name: /Vérification/i })).toBeInTheDocument()
        fireEvent.change(screen.getByLabelText(/Ta réponse/i), { target: { value: '2' } })
        fireEvent.click(screen.getByRole('button', { name: /Valider/i }))

        // Étape 3
        expect(screen.getByRole('heading', { name: /Ton profil/i })).toBeInTheDocument()
        const tagBtn = screen.getByRole('button', { name: 'Breezy' })
        fireEvent.click(tagBtn)
        fireEvent.change(screen.getByLabelText(/Biographie/i), { target: { value: 'Hello Breezy!' } })

        const finishBtn = screen.getByRole('button', { name: /Terminer et rejoindre/i })
        fireEvent.click(finishBtn)

        // Asserts
        await waitFor(() => {
            expect(authService.register).toHaveBeenCalled()
            expect(authService.login).toHaveBeenCalled()
            expect(mockNavigate).toHaveBeenCalledWith('/feed')
        })
    })
})
