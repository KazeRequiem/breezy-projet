import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ErrorPage from './pages/error/ErrorPage'

describe('App routing', () => {
    it('affiche ErrorPage 404 sur une route inconnue', () => {
        render(
            <MemoryRouter initialEntries={['/route-inexistante']}>
                <Routes>
                    <Route path="*" element={<ErrorPage code={404} />} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('affiche ErrorPage 401 sur /401', () => {
        render(
            <MemoryRouter initialEntries={['/401']}>
                <Routes>
                    <Route path="/401" element={<ErrorPage code={401} />} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText('401')).toBeInTheDocument()
    })
})