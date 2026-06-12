import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

describe('RegisterPage', () => {
    let randomSpy

    beforeEach(() => {
        // Mock de Math.random pour rendre le captcha prévisible :
        // 1. op : 0 -> '+'
        // 2. a : 0 -> a = 1
        // 3. b : 0 -> b = 1
        // Donc 1 + 1 = 2
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    })

    afterEach(() => {
        randomSpy.mockRestore()
    })

    it('affiche l\'étape 1 et valide les champs requis', () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: /Créer un compte/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/Nom d'utilisateur/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Adresse e-mail/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Confirmer/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/En cochant cette case, j'accepte/i)).toBeInTheDocument()

        const submitBtn = screen.getByRole('button', { name: /Continuer/i })
        fireEvent.click(submitBtn)

        // Devrait afficher une erreur car les CGU ne sont pas acceptées
        expect(screen.getByRole('alert')).toHaveTextContent(/Vous devez accepter les Conditions d'Utilisation/i)
    })

    it('permet de passer à l\'étape 2 puis à l\'étape 3', () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        )

        // Étape 1 : Remplir les champs
        fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText(/Adresse e-mail/i), { target: { value: 'test@exemple.com' } })
        fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByLabelText(/Confirmer/i), { target: { value: 'password123' } })
        fireEvent.click(screen.getByLabelText(/En cochant cette case, j'accepte/i))

        fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))

        // Étape 2 : Captcha
        expect(screen.getByRole('heading', { name: /Vérification/i })).toBeInTheDocument()
        expect(screen.getByText('1 + 1 = ?')).toBeInTheDocument()

        // Entrer une mauvaise réponse
        fireEvent.change(screen.getByLabelText(/Ta réponse/i), { target: { value: '5' } })
        fireEvent.click(screen.getByRole('button', { name: /Valider/i }))
        expect(screen.getByRole('alert')).toHaveTextContent(/Mauvaise réponse/i)

        // Entrer la bonne réponse (2)
        fireEvent.change(screen.getByLabelText(/Ta réponse/i), { target: { value: '2' } })
        fireEvent.click(screen.getByRole('button', { name: /Valider/i }))

        // Étape 3 : Profil
        expect(screen.getByRole('heading', { name: /Ton profil/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/Biographie/i)).toBeInTheDocument()
        
        // Sélectionner un tag d'intérêt (par exemple "Breezy")
        const tagBtn = screen.getByRole('button', { name: 'Breezy' })
        expect(tagBtn).toBeInTheDocument()
        fireEvent.click(tagBtn)

        // Remplir la bio
        fireEvent.change(screen.getByLabelText(/Biographie/i), { target: { value: 'Hello Breezy!' } })

        // Terminer
        const finishBtn = screen.getByRole('button', { name: /Terminer et rejoindre/i })
        fireEvent.click(finishBtn)

        expect(localStorage.getItem('currentUser')).toContain('testuser')
        expect(localStorage.getItem('selectedTags')).toContain('Breezy')
        expect(mockNavigate).toHaveBeenCalledWith('/interests')
    })
})
