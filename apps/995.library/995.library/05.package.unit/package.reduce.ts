import clone from "clone-deep";
import * as Act from "./package.action";
import { PackageModel } from "./package.model";
import * as Buzz from "./package.buzzer";
import State from "../99.core/state";

export function reducer(model: PackageModel = new PackageModel(), act: Act.Actions,  state?: State ) {
 switch (act.type) {
 
 case Act.UPDATE_PACKAGE:
 return Buzz.updatePackage(clone(model), act.bale, state);

 case Act.INIT_PACKAGE:
 return Buzz.initPackage(clone(model), act.bale, state);

 default:
 return model;
 }
}
