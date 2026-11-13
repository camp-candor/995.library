import { Action } from '../99.core/interface/action.interface.js';
import HexagonBit from './fce/hexagon.bit.js';

// Hexagon actions

export const INIT_HEXAGON = '[Hexagon action] Init Hexagon';
export class InitHexagon implements Action {
  readonly type = INIT_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const UPDATE_HEXAGON = '[Hexagon action] Update Hexagon';
export class UpdateHexagon implements Action {
  readonly type = UPDATE_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const READ_HEXAGON = '[Read action] Read Hexagon';
export class ReadHexagon implements Action {
  readonly type = READ_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const WRITE_HEXAGON = '[Write action] Write Hexagon';
export class WriteHexagon implements Action {
  readonly type = WRITE_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const CREATE_HEXAGON = '[Create action] Create Hexagon';
export class CreateHexagon implements Action {
  readonly type = CREATE_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const REMOVE_HEXAGON = '[Replace action] Remove Hexagon';
export class RemoveHexagon implements Action {
  readonly type = REMOVE_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const DELETE_HEXAGON = '[Delete action] Delete Hexagon';
export class DeleteHexagon implements Action {
  readonly type = DELETE_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const FOCUS_HEXAGON = '[Focus action] Focus Hexagon';
export class FocusHexagon implements Action {
  readonly type = FOCUS_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const HEXMAP_HEXAGON = '[Hexmap action] Hexmap Hexagon';
export class HexmapHexagon implements Action {
  readonly type = HEXMAP_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const HEXAGON_HEXAGON = '[Hexmap action] Hexagon Hexagon';
export class HexagonHexagon implements Action {
  readonly type = HEXAGON_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const RECTANGLE_HEXAGON = '[Hexmap action] Rectangle Hexagon';
export class RectangleHexagon implements Action {
  readonly type = RECTANGLE_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const TRIANGLE_HEXAGON = '[Hexmap action] Triangle Hexagon';
export class TriangleHexagon implements Action {
  readonly type = TRIANGLE_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const PARALLELOGRAM_HEXAGON = '[Hexmap action] Parallelogram Hexagon';
export class ParallelogramHexagon implements Action {
  readonly type = PARALLELOGRAM_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export const RING_HEXAGON = '[Hexmap action] Ring Hexagon';
export class RingHexagon implements Action {
  readonly type = RING_HEXAGON;
  constructor(public bale: HexagonBit) {}
}

export type Actions = InitHexagon | UpdateHexagon | ReadHexagon | WriteHexagon | CreateHexagon | RemoveHexagon | DeleteHexagon | FocusHexagon | HexmapHexagon | RectangleHexagon | TriangleHexagon | RingHexagon | HexagonHexagon | ParallelogramHexagon;
