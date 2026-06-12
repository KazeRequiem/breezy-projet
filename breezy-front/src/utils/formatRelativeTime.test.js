import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

describe('formatRelativeTime', () => {
    beforeEach(() => {
        // On fixe "maintenant" à un timestamp précis pour des tests déterministes
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('affiche les secondes pour moins de 60s', () => {
        const date = new Date('2025-01-01T11:59:30Z').toISOString() // 30s avant
        expect(formatRelativeTime(date)).toBe('30s')
    })

    it('affiche les minutes pour moins de 60min', () => {
        const date = new Date('2025-01-01T11:45:00Z').toISOString() // 15min avant
        expect(formatRelativeTime(date)).toBe('15m')
    })

    it('affiche les heures pour moins de 24h', () => {
        const date = new Date('2025-01-01T09:00:00Z').toISOString() // 3h avant
        expect(formatRelativeTime(date)).toBe('3h')
    })

    it('affiche les jours pour 24h et plus', () => {
        const date = new Date('2024-12-30T12:00:00Z').toISOString() // 2j avant
        expect(formatRelativeTime(date)).toBe('2j')
    })

    it('affiche 0s pour une date identique à maintenant', () => {
        const date = new Date('2025-01-01T12:00:00Z').toISOString()
        expect(formatRelativeTime(date)).toBe('0s')
    })
})
