import Model from './99.core/interface/model.interface'

import TimeUnit from './00.time.unit/time.unit'
import ClockUnit from './03.clock.unit/clock.unit'
import CollectUnit from './97.collect.unit/collect.unit'
import MenuUnit from './98.menu.unit/menu.unit'
import BusUnit from './99.bus.unit/bus.unit'

import Time from './00.time.unit/fce/time.interface'
import { TimeModel } from './00.time.unit/time.model'
import Clock from './03.clock.unit/fce/clock.interface'
import { ClockModel } from './03.clock.unit/clock.model'
import Collect from './97.collect.unit/fce/collect.interface'
import { CollectModel } from './97.collect.unit/collect.model'
import Menu from './98.menu.unit/fce/menu.interface'
import { MenuModel } from './98.menu.unit/menu.model'
import Bus from './99.bus.unit/fce/bus.interface'
import { BusModel } from './99.bus.unit/bus.model'

export const list: Array<any> = [
    TimeUnit,
    ClockUnit,
    CollectUnit,
    MenuUnit,
    BusUnit,
]

import * as reduceFromTime from './00.time.unit/time.reduce'
import * as reduceFromClock from './03.clock.unit/clock.reduce'
import * as reduceFromCollect from './97.collect.unit/collect.reduce'
import * as reduceFromMenu from './98.menu.unit/menu.reduce'
import * as reduceFromBus from './99.bus.unit/bus.reduce'

export const reducer: any = {
    time: reduceFromTime.reducer,
    clock: reduceFromClock.reducer,
    collect: reduceFromCollect.reducer,
    menu: reduceFromMenu.reducer,
    bus: reduceFromBus.reducer,
}

export default class UnitData implements Model {
    time: Time = new TimeModel()
    clock: Clock = new ClockModel()
    collect: Collect = new CollectModel()
    menu: Menu = new MenuModel()
    bus: Bus = new BusModel()
}

export { initTime } from './00.time.unit/time.buzzer.js'
export { TimeModel } from './00.time.unit/time.model.js'
export { default as State } from './99.core/state.js'
export { default as TimeUnit } from './00.time.unit/time.unit.js'
export type { default as TimeBit } from './00.time.unit/fce/time.bit.js'
