import clone from 'clone-deep';
import * as Act from './chrome.action.js';
import { ChromeModel } from './chrome.model.js';
import * as Buzz from './chrome.buzzer.js';
import State from '../99.core/state.js';

export function reducer(model: ChromeModel = new ChromeModel(), act: Act.Actions, state?: State) {
  switch (act.type) {
    case Act.UPDATE_CHROME:
      return Buzz.updateChrome(clone(model), act.bale, state);

    case Act.INIT_CHROME:
      return Buzz.initChrome(clone(model), act.bale, state);

    case Act.READ_CHROME:
      return Buzz.readChrome(clone(model), act.bale, state);

    case Act.WRITE_CHROME:
      return Buzz.writeChrome(clone(model), act.bale, state);

    case Act.REMOVE_CHROME:
      return Buzz.removeChrome(clone(model), act.bale, state);

    case Act.DELETE_CHROME:
      return Buzz.deleteChrome(clone(model), act.bale, state);

    case Act.CREATE_CHROME:
      return Buzz.createChrome(clone(model), act.bale, state);

    default:
      return model;
  }
}
