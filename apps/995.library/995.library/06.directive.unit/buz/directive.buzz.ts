export const initDirective = (cpy: DirectiveModel, bal:DirectiveBit, ste: State) => {
 debugger
 return cpy;
};

export const updateDirective = (cpy: DirectiveModel, bal:DirectiveBit, ste: State) => {
 return cpy;
};


import { DirectiveModel } from "../directive.model";
import DirectiveBit from "../fce/directive.bit";
import State from "../../99.core/state";

export const dayDirective = async ( cpy: DirectiveModel, bal: DirectiveBit, ste: State,) => { if (ste) { await ste.hunt('[Console action] Update Console', { idx: 'cns00', src: '>> Executing dayDirective stub', }) } if (bal && bal.slv != null) { bal.slv({ dayBit: { idx: 'dayDirective-stub' } }) } return cpy}

export const createDirective = async ( cpy: DirectiveModel, bal: DirectiveBit, ste: State,) => { if (ste) { await ste.hunt('[Console action] Update Console', { idx: 'cns00', src: '>> Executing createDirective stub', }) } if (bal && bal.slv != null) { bal.slv({ createBit: { idx: 'createDirective-stub' } }) } return cpy}
