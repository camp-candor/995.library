import * as ActMnu from '../menu.action'
import * as ActClk from '../../03.clock.unit/clock.action'
import * as ActCns from '../../act/console.action'

import * as ActTrm from '../../act/terminal.action'
import * as ActVsg from '../../act/visage.action'
import * as ActGph from '../../act/graphic.action'
import * as ActHex from '../../act/hexagon.action'

var bit, lst, dex, idx, dat

export const clockMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    bit = await ste.hunt(ActTrm.CLEAR_TERMINAL, { src: '-----------' })

    bit = await ste.hunt(ActCns.UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })
    bit = await ste.hunt(ActCns.UPDATE_CONSOLE, {
        idx: 'cns00',
        src: 'Clock Menu',
    })
    bit = await ste.hunt(ActCns.UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })

    bal.slv({ mnuBit: { idx: 'clock-menu' } })
    return cpy
}

var patch = (ste, type, bale) => ste.dispatch({ type, bale })

import { MenuModel } from '../menu.model'
import MenuBit from '../fce/menu.bit'
import State from '../../99.core/state'
