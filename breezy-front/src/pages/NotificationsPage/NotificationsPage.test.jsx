import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotificationsPage from './NotificationsPage'
import { AuthProvider } from '../../contexts/AuthContext'
import * as notificationService from '../../services/notificationService'

vi.mock('../../services/notificationService', () => ({
    getNotifications: vi.fn(),
    markNotificationRead: vi.fn(),
    markAllNotificationsRead: vi.fn()
}))

const DEMO_NOTIFS = [
    { _id: '1', type: 'mention', sender: { username: 'alice_dev' }, read: false, createdAt: new Date().toISOString() },
    { _id: '2', type: 'like', sender: { username: 'marco_ui' }, read: false, createdAt: new Date().toISOString() },
    { _id: '3', type: 'follow', sender: { username: 'bob' }, read: false, createdAt: new Date().toISOString() }
]

describe('NotificationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        notificationService.getNotifications.mockResolvedValue(DEMO_NOTIFS)
        notificationService.markAllNotificationsRead.mockResolvedValue({})
        notificationService.markNotificationRead.mockResolvedValue({})
    })

    it('affiche les notifications et le badge non lu', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <NotificationsPage />
                </MemoryRouter>
            </AuthProvider>
        )

        expect(screen.getByRole('heading', { name: /Notifications/i })).toBeInTheDocument()
        
        // 3 non lues par défaut dans DEMO_NOTIFS (après chargement)
        expect(await screen.findByLabelText('3 non lues')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Tout marquer comme lu/i })).toBeInTheDocument()

        // Devrait afficher les notifications de démo
        expect(screen.getByText(/alice_dev/i)).toBeInTheDocument()
        expect(screen.getByText(/marco_ui/i)).toBeInTheDocument()
    })

    it('permet de filtrer les notifications par type', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <NotificationsPage />
                </MemoryRouter>
            </AuthProvider>
        )

        // Attendre le chargement
        await screen.findByText(/alice_dev/i)

        // Cliquer sur le filtre "Mentions"
        const mentionsFilterBtn = screen.getByRole('button', { name: 'Mentions' })
        fireEvent.click(mentionsFilterBtn)

        // Devrait afficher alice_dev (mention) mais pas marco_ui (like)
        expect(screen.getByText(/alice_dev/i)).toBeInTheDocument()
        expect(screen.queryByText(/marco_ui/i)).not.toBeInTheDocument()

        // Cliquer sur le filtre "J'aime"
        const likesFilterBtn = screen.getByRole('button', { name: "J'aime" })
        fireEvent.click(likesFilterBtn)

        expect(screen.queryByText(/alice_dev/i)).not.toBeInTheDocument()
        expect(screen.getByText(/marco_ui/i)).toBeInTheDocument()
    })

    it('permet de marquer toutes les notifications comme lues', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <NotificationsPage />
                </MemoryRouter>
            </AuthProvider>
        )

        const readAllBtn = await screen.findByRole('button', { name: /Tout marquer comme lu/i })
        fireEvent.click(readAllBtn)

        // Le badge 3 et le bouton Tout lire ne doivent plus être là
        expect(screen.queryByLabelText('3 non lues')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Tout marquer comme lu/i })).not.toBeInTheDocument()
    })
})
