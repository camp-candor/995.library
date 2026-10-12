export const initPackage = (cpy: PackageModel, bal:PackageBit, ste: State) => {
 debugger
 return cpy;
};

export const updatePackage = (cpy: PackageModel, bal:PackageBit, ste: State) => {
 return cpy;
};


import { PackageModel } from "../package.model";
import PackageBit from "../fce/package.bit";
import State from "../../99.core/state";

export const createPackage = async ( cpy: PackageModel, bal: PackageBit, ste: State,) => { if (ste) { await ste.hunt('[Console action] Update Console', { idx: 'cns00', src: '>> Executing createPackage stub', }) } if (bal && bal.slv != null) { bal.slv({ createBit: { idx: 'createPackage-stub' } }) } return cpy}
