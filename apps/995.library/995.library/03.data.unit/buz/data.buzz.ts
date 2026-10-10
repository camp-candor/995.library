import * as ActCns from '../../83.console.unit/console.action'
import type { DataModel } from '../data.model'
import type DataBit from '../fce/data.bit'
import type State from '../../99.core/state'

export const initData = async (
    cpy: DataModel,
    bal: DataBit,
    ste: State,
): Promise<DataModel> => {
    if (ste && typeof ste.hunt === 'function') {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [DATA:INIT] [OK] Initializing media data plane boundaries...',
        }).catch(() => {})
    }

    if (bal && bal.slv != null) {
        bal.slv({ datBit: { idx: 'init-data' } })
    }

    return cpy
}

export const updateData = async (
    cpy: DataModel,
    bal: DataBit,
    ste: State,
): Promise<DataModel> => {
    if (ste && typeof ste.hunt === 'function') {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [DATA:UPDATE] [OK] Updating media data plane configuration...',
        }).catch(() => {})
    }

    if (bal && bal.slv != null) {
        bal.slv({ datBit: { idx: 'update-data' } })
    }

    return cpy
}

export const frameData = async (
    cpy: DataModel,
    bal: DataBit,
    ste: State,
): Promise<DataModel> => {
    const videoFile = bal?.src ? `../films/${bal.src}` : '../films/default.mp4'
    const outputDir = bal?.dat?.outputDir || '../frames'
    const targetFrames = bal?.val || 48

    if (ste && typeof ste.hunt === 'function') {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [DATA:FRAME] [PREP] Source: ${videoFile} | Target frames: ${targetFrames}`,
        }).catch(() => {})
    }

    if (bal && bal.slv != null) {
        bal.slv({
            datBit: {
                idx: 'frame-data',
                src: outputDir,
                val: targetFrames,
            },
        })
    }

    return cpy
}
