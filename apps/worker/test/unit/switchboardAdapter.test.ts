import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import app from '../../src/index.js'

async function callApp(path: string, init?: RequestInit) {
    const req = new Request(`http://localhost${path}`, init)
    return app.fetch(req)
}

describe('switchboard adapter', () => {
    const g = globalThis as any
    let prevPivots: any
    let prevLib: any
    let prevLore: any

    beforeEach(() => {
        prevPivots = g.PIVOTS
        prevLib = g.LIBRARY
        prevLore = g.LORE
        g.PIVOTS = {
            LIBRARY: { hunt: async () => ({ ok: true }) },
            LORE: {
                globalKey: 'LORE',
                menuTitle: 'GOBLIN LORE MENU',
                menuDesc: 'Goblin Lore ontological compiler',
                activeSeriesSlug: 'wiregrass-basin',
                hunt: async (type: string, bale: any) => {
                    if (g.LIBRARY?.hunt) {
                        await g.LIBRARY.hunt(
                            '[Console action] Update Console',
                            {
                                idx: 'cns00',
                                src: `:: [EDGE:LORE] Executed ${type}`,
                            },
                        )
                    }
                    return { ok: true, type, bale }
                },
            },
        }
        g.LORE = g.PIVOTS.LORE
        delete g.LIBRARY
    })

    afterEach(() => {
        g.PIVOTS = prevPivots
        g.LIBRARY = prevLib
        g.LORE = prevLore
    })

    it('GET /api/switchboard/routes returns manifest', async () => {
        const res = await callApp('/api/switchboard/routes')
        expect(res.status).toBe(200)
        const body: any = await res.json()
        expect(body.ok).toBe(true)
        expect(body.routes.some((r: any) => r.globalKey === 'LIBRARY')).toBe(
            true,
        )
        expect(
            body.routes.some(
                (r: any) =>
                    r.globalKey === 'LORE' &&
                    r.menuTitle === 'GOBLIN LORE MENU' &&
                    r.activeSeriesSlug === 'wiregrass-basin',
            ),
        ).toBe(true)
    })

    it('POST /api/switchboard/dispatch routes to pivot hunt with stubbed globalThis.LIBRARY', async () => {
        const res = await callApp('/api/switchboard/dispatch', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                pivotKey: 'LORE',
                actionType: '[Compile action] Compile Series',
                bale: { seriesSlug: 'wiregrass-basin' },
            }),
        })
        expect(res.status).toBe(200)
        const body: any = await res.json()
        expect(body.ok).toBe(true)
        expect(body.pivotKey).toBe('LORE')
        expect(body.telemetry).toContain(
            ':: [EDGE:LORE] Executed [Compile action] Compile Series',
        )
        expect(g.LIBRARY).toBeUndefined()
    })

    it('POST /api/switchboard/dispatch fails closed on bad payload or unknown pivot', async () => {
        const resBad = await callApp('/api/switchboard/dispatch', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({}),
        })
        expect(resBad.status).toBe(400)

        const resUnknown = await callApp('/api/switchboard/dispatch', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                pivotKey: 'UNKNOWN_PIVOT',
                actionType: '[Test] Fail',
            }),
        })
        expect(resUnknown.status).toBe(404)
    })
})
