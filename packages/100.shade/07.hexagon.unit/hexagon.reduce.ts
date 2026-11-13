import clone from 'clone-deep';
import * as Act from './hexagon.action.js';
import { HexagonModel } from './hexagon.model.js';
import * as Buzz from './hexagon.buzzer.js';
import State from '../99.core/state.js';

export function reducer(model: HexagonModel = new HexagonModel(), act: Act.Actions, state?: State) {
  switch (act.type) {
    case Act.UPDATE_HEXAGON:
      return Buzz.updateHexagon(clone(model), act.bale, state);

    case Act.INIT_HEXAGON:
      return Buzz.initHexagon(clone(model), act.bale, state);

    case Act.READ_HEXAGON:
      return Buzz.readHexagon(clone(model), act.bale, state);

    case Act.WRITE_HEXAGON:
      return Buzz.writeHexagon(clone(model), act.bale, state);

    case Act.CREATE_HEXAGON:
      return Buzz.createHexagon(clone(model), act.bale, state);

    case Act.REMOVE_HEXAGON:
      return Buzz.removeHexagon(clone(model), act.bale, state);

    case Act.DELETE_HEXAGON:
      return Buzz.deleteHexagon(clone(model), act.bale, state);

    case Act.FOCUS_HEXAGON:
      return Buzz.focusHexagon(clone(model), act.bale, state);

    case Act.HEXMAP_HEXAGON:
      return Buzz.hexmapHexagon(clone(model), act.bale, state);

    case Act.RECTANGLE_HEXAGON:
      return Buzz.rectangleHexagon(clone(model), act.bale, state);

    case Act.HEXAGON_HEXAGON:
      return Buzz.hexagonHexagon(clone(model), act.bale, state);

    case Act.PARALLELOGRAM_HEXAGON:
      return Buzz.parallelogramHexagon(clone(model), act.bale, state);

    default:
      return model;
  }
}
