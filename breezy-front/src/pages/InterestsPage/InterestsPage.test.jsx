import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InterestsPage from './InterestsPage'
import { AuthProvider } from '../../contexts/AuthContext'

describe('InterestsPage', () => {
    beforeEach(() => {
        sessionStorage.clear()
    })

    it('affiche le titre et les sections de tags par défaut', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <InterestsPage />
                </MemoryRouter>
            </AuthProvider>
        )

        expect(screen.getByRole('heading', { name: /Mes centres d'intérêts/i })).toBeInTheDocument()
        // Les tags par défaut du lazy initializer sont Breezy, UIDesign, WebDev, Nature, Gaming
        expect(screen.getByRole('heading', { name: /#breezy/i })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /#nature/i })).toBeInTheDocument()
    })

    it('permet d\'ouvrir le tiroir de gestion et d\'ajouter/supprimer des tags', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <InterestsPage />
                </MemoryRouter>
            </AuthProvider>
        )

        const manageBtn = screen.getByRole('button', { name: /Gérer mes tags/i })
        expect(manageBtn).toBeInTheDocument()
        
        // Ouvrir le tiroir
        fireEvent.click(manageBtn)

        expect(screen.getByRole('heading', { name: /Gérer mes centres d'intérêts/i })).toBeInTheDocument()

        // Le tiroir contient les boutons des tags
        const tagOption = screen.getByRole('button', { name: /Art/i })
        expect(tagOption).toBeInTheDocument()

        // Cliquer sur un tag (par exemple Art) pour l'ajouter/sélectionner
        fireEvent.click(tagOption)

        // Cliquer sur le bouton Terminer
        const saveBtn = screen.getByRole('button', { name: /Terminer/i })
        fireEvent.click(saveBtn)

        // Le tiroir doit être fermé
        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /Gérer mes centres d'intérêts/i })).not.toBeInTheDocument()
        })

        // Le tag Art doit être présent maintenant
        expect(screen.getByRole('heading', { name: /#art/i })).toBeInTheDocument()
        
        // Vérifier sessionStorage
        const stored = JSON.parse(sessionStorage.getItem('breezy_tags'))
        expect(stored).toContain('art')
    })

    it('permet de basculer en mode focus sur un tag puis de revenir', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <InterestsPage />
                </MemoryRouter>
            </AuthProvider>
        )

        // Cliquer sur "Voir plus" pour le tag #Nature
        const voirPlusBtn = screen.getByRole('button', { name: /Voir plus de posts pour #nature/i })
        expect(voirPlusBtn).toBeInTheDocument()

        fireEvent.click(voirPlusBtn)

        // Mode focus : le header principal change pour afficher #Nature
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /#nature/i })).toBeInTheDocument()
        })

        // Le bouton de retour doit être visible
        const backBtn = screen.getByRole('button', { name: /Retour aux centres d'intérêts/i })
        expect(backBtn).toBeInTheDocument()

        // Cliquer sur retour
        fireEvent.click(backBtn)

        // Retour au mode aperçu global
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Mes centres d'intérêts/i })).toBeInTheDocument()
        })
    })
})
