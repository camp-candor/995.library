import { Hono } from 'hono'

export interface SwitchboardRouteManifestItem {
    readonly globalKey: string
    readonly menuTitle: string
    readonly menuDesc: string
    readonly activeSeriesSlug: string
}

export interface SwitchboardDispatchPayload {
    readonly pivotKey: string
    readonly actionType: string
    readonly bale?: Record<string, unknown>
}

const DEFAULT_FALLBACK_ROUTES: readonly SwitchboardRouteManifestItem[] = [
    {
        globalKey: 'LIBRARY',
        menuTitle: 'LIBRARY MENU',
        menuDesc:
            'Core 995.library harness status and switchboard diagnostics.',
        activeSeriesSlug: 'UNBOUND',
    },
]

function collectRegisteredRoutes(): SwitchboardRouteManifestItem[] {
    const g = globalThis as Record<string, any>
    const pivots = g.PIVOTS && typeof g.PIVOTS === 'object' ? g.PIVOTS : {}
    const seenKeys = new Set<string>()
    const routes: SwitchboardRouteManifestItem[] = []

    for (const [entryKey, instance] of Object.entries(pivots)) {
        if (!instance || typeof instance !== 'object') continue
        const mod = instance as Record<string, any>
        const globalKey =
            typeof mod.globalKey === 'string' && mod.globalKey.trim().length > 0
                ? mod.globalKey.trim().toUpperCase()
                : entryKey.trim().toUpperCase()

        if (seenKeys.has(globalKey)) continue
        seenKeys.add(globalKey)

        routes.push({
            globalKey,
            menuTitle:
                typeof mod.menuTitle === 'string' &&
                mod.menuTitle.trim().length > 0
                    ? mod.menuTitle.trim()
                    : `${globalKey} MENU`,
            menuDesc:
                typeof mod.menuDesc === 'string' &&
                mod.menuDesc.trim().length > 0
                    ? mod.menuDesc.trim()
                    : `Remote switchboard pivot for ${globalKey}.`,
            activeSeriesSlug:
                typeof mod.activeSeriesSlug === 'string' &&
                mod.activeSeriesSlug.trim().length > 0
                    ? mod.activeSeriesSlug.trim()
                    : 'UNBOUND',
        })
    }

    for (const fallback of DEFAULT_FALLBACK_ROUTES) {
        if (!seenKeys.has(fallback.globalKey)) {
            seenKeys.add(fallback.globalKey)
            routes.unshift(fallback)
        }
    }

    return routes
}

function createHeadlessLibraryStub(telemetrySink: string[]) {
    return {
        isHeadlessStub: true,
        hunt: async (actionType: string, bale: Record<string, any> = {}) => {
            if (
                actionType.includes('Update Console') &&
                typeof bale?.src === 'string'
            ) {
                telemetrySink.push(bale.src)
            }
            if (typeof bale?.slv === 'function') {
                bale.slv({
                    trmBit: { idx: 'headless-stub' },
                    grdBit: {
                        dat: { left: 0, top: 0, width: 100, height: 100 },
                    },
                    cnsBit: { idx: bale?.idx || 'cns00', src: bale?.src || '' },
                    chcBit: { src: '' },
                })
            }
            return { ok: true, stubbed: true, actionType }
        },
    }
}

export const switchboardRoutes = new Hono()

switchboardRoutes.get('/routes', (c) => {
    const routes = collectRegisteredRoutes()
    return c.json(
        {
            ok: true,
            runtime: 'cloudflare-worker',
            count: routes.length,
            routes,
        },
        200,
    )
})

switchboardRoutes.post('/dispatch', async (c) => {
    let body: Partial<SwitchboardDispatchPayload>
    try {
        body = await c.req.json<Partial<SwitchboardDispatchPayload>>()
    } catch {
        return c.json(
            {
                ok: false,
                error: 'INVALID_JSON_PAYLOAD',
                message: 'Request body must be valid JSON.',
            },
            400,
        )
    }

    const pivotKey =
        typeof body?.pivotKey === 'string'
            ? body.pivotKey.trim().toUpperCase()
            : ''
    const actionType =
        typeof body?.actionType === 'string' ? body.actionType.trim() : ''
    const bale =
        body?.bale && typeof body.bale === 'object' && !Array.isArray(body.bale)
            ? { ...body.bale }
            : {}

    if (!pivotKey || !actionType) {
        return c.json(
            {
                ok: false,
                error: 'MISSING_DISPATCH_FIELDS',
                message: 'Both pivotKey and actionType are required.',
            },
            400,
        )
    }

    const g = globalThis as Record<string, any>
    const directPivot = Object.prototype.hasOwnProperty.call(g, pivotKey)
        ? g[pivotKey]
        : undefined
    const mapPivot =
        g.PIVOTS &&
        typeof g.PIVOTS === 'object' &&
        Object.prototype.hasOwnProperty.call(g.PIVOTS, pivotKey)
            ? g.PIVOTS[pivotKey]
            : undefined
    const targetPivot = directPivot || mapPivot

    if (!targetPivot || typeof targetPivot.hunt !== 'function') {
        return c.json(
            {
                ok: false,
                error: 'PIVOT_NOT_MOUNTED',
                message: `Target pivot '${pivotKey}' is not mounted in this worker isolate.`,
            },
            404,
        )
    }

    const telemetryLines: string[] = []
    const hadExistingLibrary = Boolean(
        g.LIBRARY && typeof g.LIBRARY.hunt === 'function',
    )
    if (!hadExistingLibrary) {
        g.LIBRARY = createHeadlessLibraryStub(telemetryLines)
    }

    try {
        const result = await targetPivot.hunt(actionType, bale)
        return c.json(
            {
                ok: true,
                pivotKey,
                actionType,
                telemetry: telemetryLines,
                result: result ?? { dispatched: true },
            },
            200,
        )
    } catch (err: any) {
        return c.json(
            {
                ok: false,
                error: 'PIVOT_EXECUTION_FAILED',
                pivotKey,
                actionType,
                message: err?.message || String(err),
            },
            500,
        )
    } finally {
        if (!hadExistingLibrary) {
            delete g.LIBRARY
        }
    }
})
