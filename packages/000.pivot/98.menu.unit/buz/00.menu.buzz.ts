/* eslint-disable */
import * as ActMnu from '../menu.action.js'
//import * as ActAgt from '../../00.agent.unit/agent.action.js';
import * as ActOlm from '../../00.pivot.unit/pivot.action.js'

import type { MenuModel } from '../menu.model.js'
import type MenuBit from '../fce/menu.bit.js'
import type State from '../../99.core/state.js'

import * as Grid from '../../val/grid.js'
import * as Align from '../../val/align.js'
import * as Color from '../../val/console-color.js'

import * as SHAPE from '../../val/shape.js'
import * as FOCUS from '../../val/focus.js'

let bit, lst, dex, idx, dat, src, val
let rootSlv

let SOWER, AGENT, CLICKUP, PIVOT

const UPDATE_GRID = '[Grid action] Update Grid'
const WRITE_CONSOLE = '[Write action] Write Console'
const UPDATE_CONSOLE = '[Console action] Update Console'
const OPEN_CHOICE = '[Open action] Open Choice'
const CLOSE_TERMINAL = '[Close action] Close Terminal'
const PRINT_MENU = '[Render action] Print Menu'

export const initMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    if (bal.slv != null) rootSlv = bal.slv

    bit = await global.LIBRARY.hunt(UPDATE_GRID, {
        x: 4,
        y: 0,
        xSpan: 8,
        ySpan: 12,
    })
    bit = await global.LIBRARY.hunt(WRITE_CONSOLE, {
        idx: 'cns00',
        src: '',
        dat: { net: bit.grdBit.dat, src: 'alligaor0' },
    })

    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })
    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: 'PIVOT MENU',
    })

    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })
    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [READY] Pivot Control Plane Active',
    })
    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: ':: [KEYS] UP/DOWN or J/K: Navigate | ENTER: Select | ESC: Back',
    })

    await updateMenu(cpy, bal, ste)

    return cpy
}

export const updateMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    lst = [
        ActOlm.UPDATE_PIVOT.split(']')[1],
        ActOlm.TEST_PIVOT.split(']')[1],
        ActOlm.LIST_PIVOT.split(']')[1],
        'DISCOVER FLEET PIVOTS',
        'LIST SWITCHBOARD ROUTES',
        'VERIFY SESSION ROUTES',
        'JUMP TO MOUNTED PIVOT',
        'TOGGLE HUD TELEMETRY',
        'WORKER BRIDGE STATUS',
        'ROOT MENU',
    ]

    const gridBit = await global.LIBRARY.hunt(UPDATE_GRID, {
        x: 0,
        y: 4,
        xSpan: 4,
        ySpan: 8,
    })
    bit = await global.LIBRARY.hunt(OPEN_CHOICE, {
        dat: {
            clr0: Color.BLACK,
            clr1: Color.YELLOW,
            cb: (item: string) => {
                global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `>> Focus: [${item}] - Press ENTER to execute`,
                })
            },
        },
        src: Align.VERTICAL,
        lst,
        net: gridBit.grdBit.dat,
    })

    src = bit.chcBit.src
    const libMenuState = (global.LIBRARY as any)?.state?.value?.menu

    switch (src) {
        case ActOlm.UPDATE_PIVOT.split(']')[1]:
            bit = await ste.hunt(ActOlm.UPDATE_PIVOT, {
                content: 'Pivot Menu Selected',
            })
            bit = await global.LIBRARY.hunt(PRINT_MENU, bit)
            break

        case ActOlm.TEST_PIVOT.split(']')[1]:
            bit = await ste.hunt(ActOlm.TEST_PIVOT, {
                content: 'Pivot Menu Selected',
            })
            bit = await global.LIBRARY.hunt(PRINT_MENU, bit)
            break

        case ActOlm.LIST_PIVOT.split(']')[1]:
            bit = await ste.hunt(ActOlm.LIST_PIVOT, {})
            lst = bit.olmBit.lst

            if (lst.length === 0) {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: 'No Pivot Models Found',
                })
            } else {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: 'Listing Pivot Models...',
                })
                lst.forEach((a: string) =>
                    global.LIBRARY.hunt(UPDATE_CONSOLE, {
                        idx: 'cns00',
                        src: a,
                    }),
                )
            }

            await new Promise((resolve) => setTimeout(resolve, 3000))
            break

        case 'DISCOVER FLEET PIVOTS':
            await global.LIBRARY.hunt(
                '[Library action] Discover Fleet Pivots',
                {
                    registerMenus: true,
                },
            )
            break

        case 'LIST SWITCHBOARD ROUTES': {
            await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                idx: 'cns00',
                src: '>> [SWITCHBOARD] Registered Master Root Routes:',
            })
            const routes: string[] = [
                'LIBRARY MENU',
                ...(Array.from(
                    libMenuState?.menuRoutes?.keys?.() || [],
                ) as string[]),
            ]
            for (const title of routes) {
                const desc =
                    libMenuState?.menuRouteDescriptions?.get?.(title) ||
                    'No description'
                await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `:: [${title}] -> ${String(desc).replace(/\s+/g, ' ')}`,
                })
            }
            break
        }

        case 'VERIFY SESSION ROUTES': {
            await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                idx: 'cns00',
                src: '>> [AUDIT] Local Session Route Readiness Table:',
            })
            const routeKeys: string[] = [
                'LIBRARY MENU',
                ...(Array.from(
                    libMenuState?.menuRoutes?.keys?.() || [],
                ) as string[]),
            ]
            await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                idx: 'cns00',
                src: '>> +--------------------------+----------+',
            })
            for (const title of routeKeys) {
                const padded = title.slice(0, 24).padEnd(24, ' ')
                await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `>> | ${padded} | READY    |`,
                })
            }
            await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                idx: 'cns00',
                src: '>> +--------------------------+----------+',
            })
            break
        }

        case 'JUMP TO MOUNTED PIVOT': {
            const externalTargets: string[] = Array.from(
                libMenuState?.menuRoutes?.keys?.() || [],
            )
            if (externalTargets.length === 0) {
                await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: ':: [WARN] No external pivots mounted to jump into.',
                })
                break
            }
            await global.LIBRARY.hunt('[Layout action] Clear Terminal', {})
            const jumpChoice = await global.LIBRARY.hunt(OPEN_CHOICE, {
                dat: { clr0: Color.BLACK, clr1: Color.GREEN },
                src: Align.VERTICAL,
                lst: [...externalTargets, 'CANCEL'],
                net: gridBit.grdBit.dat,
            })
            const target = jumpChoice?.chcBit?.src || 'CANCEL'
            if (target !== 'CANCEL') {
                await global.LIBRARY.hunt('[Menu action] Jump Pivot', {
                    targetMenuTitle: target,
                })
                if (rootSlv != null) rootSlv({ mnuBit: { idx: 'root-menu' } })
                return cpy
            }
            break
        }

        case 'TOGGLE HUD TELEMETRY': {
            const nextVisible = !(libMenuState?.hudTelemetryVisible ?? true)
            if (libMenuState) libMenuState.hudTelemetryVisible = nextVisible
            await global.LIBRARY.hunt('[Terminal action] Set Session Context', {
                activePivotTitle: 'PIVOT MENU',
                hudVisible: nextVisible,
            })
            await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [HUD] Telemetry banner visibility set to: ${nextVisible ? 'VISIBLE' : 'HIDDEN'}`,
            })
            break
        }

        case 'WORKER BRIDGE STATUS':
            await global.LIBRARY.hunt(
                '[Library action] Check Worker Bridge',
                {},
            )
            break

        case 'ROOT MENU':
            await global.LIBRARY.hunt('[Layout action] Clear Terminal', {})
            if (rootSlv != null) rootSlv({ mnuBit: { idx: 'root-menu' } })
            return cpy

        default:
            bit = await ste.hunt(CLOSE_TERMINAL, {})
            break
    }

    setTimeout(async () => {
        bit = await ste.hunt(ActMnu.UPDATE_MENU, {})
    }, 333)

    return cpy
}

const patch = (ste, type, bale) => ste.dispatch({ type, bale })
