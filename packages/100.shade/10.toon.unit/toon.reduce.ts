import clone from 'clone-deep';
import * as Act from './toon.action.js';
import { ToonModel } from './toon.model.js';
import * as Buzz from './toon.buzzer.js';
import State from '../99.core/state.js';

export function reducer(model: ToonModel = new ToonModel(), act: Act.Actions, state?: State) {
  switch (act.type) {
    case Act.UPDATE_TOON:
      return Buzz.updateToon(clone(model), act.bale, state);

    case Act.INIT_TOON:
      return Buzz.initToon(clone(model), act.bale, state);

    default:
      return model;
  }
}
