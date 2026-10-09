import type { Action } from '../99.core/interface/action.interface'
import type LibraryBit from './fce/library.bit'

// Library actions

export const INIT_LIBRARY = '[Library action] Init Library'
export class InitLibrary implements Action {
    readonly type = INIT_LIBRARY
    constructor(public bale: LibraryBit) {}
}

export const UPDATE_LIBRARY = '[Library action] Update Library'
export class UpdateLibrary implements Action {
    readonly type = UPDATE_LIBRARY
    constructor(public bale: LibraryBit) {}
}

export const LIST_LIBRARY = '[List action] List Library'
export class ListLibrary implements Action {
    readonly type = LIST_LIBRARY
    constructor(public bale: LibraryBit) {}
}

export const PROGRESS_LIBRARY = '[Progress action] Progress Library'
export class ProgressLibrary implements Action {
    readonly type = PROGRESS_LIBRARY
    constructor(public bale: undefined) {}
}

export const SCAN_LIBRARY = '[Scan action] Scan Library'
export class ScanLibrary implements Action {
    readonly type = SCAN_LIBRARY
    constructor(public bale: undefined) {}
}

export const SCAN_FLEET = '[Scan action] Scan Fleet'
export class ScanFleet implements Action {
    readonly type = SCAN_FLEET
    constructor(public bale?: LibraryBit) {}
}

export const LAUNCH_LIBRARY = '[Launch action] Launch Library'
export class LaunchLibrary implements Action {
    readonly type = LAUNCH_LIBRARY
    constructor(public bale: undefined) {}
}

export const FLAT_LIBRARY = '[Flat action] Flat Library'
export class FlatLibrary implements Action {
    readonly type = FLAT_LIBRARY
    constructor(public bale?: LibraryBit) {}
}


export const CHECK_GIT_WORKING_TREE = '[Git action] Check Git Working Tree'
export class CheckGitWorkingTree implements Action {
    readonly type = CHECK_GIT_WORKING_TREE
    constructor(public bale: LibraryBit) {}
}

export const PROGRESS_LIBRARY_SAGA = '[Progress action] Progress Library Saga'
export class ProgressLibrarySaga implements Action {
    readonly type = PROGRESS_LIBRARY_SAGA
    constructor(public bale: LibraryBit) {}
}

export type Actions =
    | CheckGitWorkingTree
    | ProgressLibrarySaga
    | InitLibrary
    | UpdateLibrary
    | ListLibrary
    | ProgressLibrary
    | ScanLibrary
    | ScanFleet
    | LaunchLibrary
    | FlatLibrary

