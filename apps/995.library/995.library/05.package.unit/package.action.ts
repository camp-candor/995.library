import { Action } from "../99.core/interface/action.interface";
import  PackageBit  from "./fce/package.bit";

// Package actions

export const INIT_PACKAGE = "[Package action] Init Package";
export class InitPackage implements Action {
 readonly type = INIT_PACKAGE;
 constructor(public bale: PackageBit) {}
}

export const UPDATE_PACKAGE = "[Package action] Update Package";
export class UpdatePackage implements Action {
 readonly type = UPDATE_PACKAGE;
 constructor(public bale: PackageBit) {}
}

export type Actions = | InitPackage | UpdatePackage ;
