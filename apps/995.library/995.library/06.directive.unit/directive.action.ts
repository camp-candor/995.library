import { Action } from "../99.core/interface/action.interface";
import  DirectiveBit  from "./fce/directive.bit";

// Directive actions

export const INIT_DIRECTIVE = "[Directive action] Init Directive";
export class InitDirective implements Action {
 readonly type = INIT_DIRECTIVE;
 constructor(public bale: DirectiveBit) {}
}

export const UPDATE_DIRECTIVE = "[Directive action] Update Directive";
export class UpdateDirective implements Action {
 readonly type = UPDATE_DIRECTIVE;
 constructor(public bale: DirectiveBit) {}
}

export type Actions = | InitDirective | UpdateDirective ;
