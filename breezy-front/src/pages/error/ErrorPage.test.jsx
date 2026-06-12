import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ErrorPage from './ErrorPage'

// Helper : rendu d'ErrorPage dans un routeur mémoire (requis pour useNavigate)
const renderErrorPage = (code) =>
    render(
        <MemoryRouter>
            <ErrorPage code={code} />
        </MemoryRouter>
    )

describe('ErrorPage', () => {
    it('affiche le code 404 par défaut', () => {
        renderErrorPage(404)
        expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('affiche le code 401', () => {
        renderErrorPage(401)
        expect(screen.getByText('401')).toBeInTheDocument()
    })

    it('affiche un bouton de retour', () => {
        renderErrorPage(404)
        expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument()
    })

    it('le bouton retour est cliquable', () => {
        renderErrorPage(404)
        const btn = screen.getByRole('button', { name: /retour/i })
        expect(btn).toBeEnabled()
    })
})
