import clone from 'clone-deep';
import * as Act from './graphic.action.js';
import { GraphicModel } from './graphic.model.js';
import * as Buzz from './graphic.buzzer.js';
import State from '../99.core/state.js';

export function reducer(model: GraphicModel = new GraphicModel(), act: Act.Actions, state?: State) {
  switch (act.type) {
    case Act.UPDATE_GRAPHIC:
      return Buzz.updateGraphic(clone(model), act.bale, state);

    case Act.INIT_GRAPHIC:
      return Buzz.initGraphic(clone(model), act.bale, state);

    case Act.READ_GRAPHIC:
      return Buzz.readGraphic(clone(model), act.bale, state);

    case Act.WRITE_GRAPHIC:
      return Buzz.writeGraphic(clone(model), act.bale, state);

    case Act.CREATE_GRAPHIC:
      return Buzz.createGraphic(clone(model), act.bale, state);

    case Act.REMOVE_GRAPHIC:
      return Buzz.removeGraphic(clone(model), act.bale, state);

    case Act.DELETE_GRAPHIC:
      return Buzz.deleteGraphic(clone(model), act.bale, state);

    default:
      return model;
  }
}
