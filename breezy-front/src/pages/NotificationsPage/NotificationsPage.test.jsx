import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotificationsPage from './NotificationsPage'

describe('NotificationsPage', () => {
    it('affiche les notifications et le badge non lu', () => {
        render(
            <MemoryRouter>
                <NotificationsPage />
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: /Notifications/i })).toBeInTheDocument()
        
        // 3 non lues par défaut dans DEMO_NOTIFS
        expect(screen.getByLabelText('3 non lues')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Tout marquer comme lu/i })).toBeInTheDocument()

        // Devrait afficher les notifications de démo
        expect(screen.getByText(/alice_dev/i)).toBeInTheDocument()
        expect(screen.getByText(/marco_ui/i)).toBeInTheDocument()
    })

    it('permet de filtrer les notifications par type', () => {
        render(
            <MemoryRouter>
                <NotificationsPage />
            </MemoryRouter>
        )

        // Cliquer sur le filtre "Mentions"
        const mentionsFilterBtn = screen.getByRole('button', { name: 'Mentions' })
        fireEvent.click(mentionsFilterBtn)

        // Devrait afficher alice_dev (mention) mais pas marco_ui (like)
        expect(screen.getByText(/alice_dev/i)).toBeInTheDocument()
        expect(screen.queryByText(/marco_ui/i)).not.toBeInTheDocument()

        // Cliquer sur le filtre "Likes"
        const likesFilterBtn = screen.getByRole('button', { name: 'Likes' })
        fireEvent.click(likesFilterBtn)

        expect(screen.queryByText(/alice_dev/i)).not.toBeInTheDocument()
        expect(screen.getByText(/marco_ui/i)).toBeInTheDocument()
    })

    it('permet de marquer toutes les notifications comme lues', () => {
        render(
            <MemoryRouter>
                <NotificationsPage />
            </MemoryRouter>
        )

        const readAllBtn = screen.getByRole('button', { name: /Tout marquer comme lu/i })
        fireEvent.click(readAllBtn)

        // Le badge 3 and le bouton Tout lire ne doivent plus être là
        expect(screen.queryByLabelText('3 non lues')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Tout marquer comme lu/i })).not.toBeInTheDocument()
    })
})
