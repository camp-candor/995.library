import type { InputModel } from '../input.model'
import type InputBit from '../fce/input.bit'
import type State from '../../99.core/state'
import type NetBit from '../../81.grid.unit/fce/net.bit'
import * as Color from '../../val/console-color'

export const initInput = (cpy: InputModel, bal: InputBit, _ste: State) => {
    if (bal?.slv != null) bal.slv({ putBit: { idx: 'init-input' } })
    return cpy
}

export const updateInput = (cpy: InputModel, bal: InputBit, _ste: State) => {
    if (bal?.slv != null) bal.slv({ putBit: { idx: 'update-input' } })
    return cpy
}

export const openInput = (cpy: InputModel, bal: InputBit, ste: State) => {
    const terminal = ste?.value?.terminal
    const blessed = terminal?.blessed
    const screen = terminal?.screen

    // Headless fallback for automated test gauntlets and CI runners
    if (!screen || !blessed) {
        if (bal?.slv != null) {
            bal.slv({
                putBit: {
                    idx: 'open-input-headless',
                    src: bal?.src || '',
                    val: 0,
                },
            })
        }
        return cpy
    }

    const dat = {
        idx: 'input-bit',
        clr0: Color.GREEN,
        clr1: Color.CYAN,
        ...(bal?.dat || {}),
    }

    const net: NetBit = bal?.net || {
        left: 0,
        top: 0,
        width: '100%',
        height: 3,
    }

    const labelText = bal?.txt || 'input below'

    const title = blessed.textbox({
        parent: screen,
        name: 'input-title',
        keys: false,
        left: net.left,
        top: typeof net.top === 'number' ? net.top : 1,
        width: net.width,
        height: 2,
        content: labelText,
        border: { type: 'line' },
        style: {
            fg: dat.clr0,
            border: { fg: dat.clr0 },
        },
    })

    const input = blessed.textbox({
        parent: screen,
        name: 'input-body',
        input: true,
        keys: true,
        mouse: true,
        left: net.left,
        top: typeof net.top === 'number' ? net.top + 2 : 3,
        width: net.width,
        height: typeof net.height === 'number' ? Math.max(1, net.height - 2) : 1,
        inputOnFocus: true,
        style: {
            bg: dat.clr1,
            fg: Color.BLACK,
            focus: { bg: Color.YELLOW, fg: Color.BLACK },
            hover: { bg: Color.YELLOW, fg: Color.BLACK },
        },
    })

    let cleanedUp = false
    const cleanup = () => {
        if (cleanedUp) return
        cleanedUp = true

        try {
            input.unkey(['escape'], handleCancel)
            title.destroy()
            input.destroy()
            screen.render()
        } catch {
            // Teardown defensive catch
        }
    }

    const handleCancel = () => {
        cleanup()
        if (bal?.slv != null) {
            bal.slv({
                putBit: {
                    idx: 'open-input-cancel',
                    src: '',
                    val: -1,
                },
            })
        }
    }

    input.key(['escape'], handleCancel)

    input.on('submit', (src: string) => {
        const valStr = src || ''
        cleanup()
        if (bal?.slv != null) {
            bal.slv({
                putBit: {
                    idx: 'open-input',
                    src: valStr,
                    val: 0,
                },
            })
        }
    })

    input.focus()
    screen.render()

    return cpy
}
