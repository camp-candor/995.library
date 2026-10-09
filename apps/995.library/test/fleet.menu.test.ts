import test from 'ava';
import * as ActMnu from '../995.library/98.menu.unit/menu.action';
import { reducer } from '../995.library/98.menu.unit/menu.reduce';
import { MenuModel } from '../995.library/98.menu.unit/menu.model';
import { fleetMenu, sagaTornStateMenu } from '../995.library/98.menu.unit/buz/menu.fleet';

test('Phase 4 Actions: declares FLEET_MENU and SAGA_TORN_STATE_MENU action constants and classes', (t) => {
    t.is(ActMnu.FLEET_MENU, '[Menu action] Fleet Menu');
    t.is(ActMnu.SAGA_TORN_STATE_MENU, '[Menu action] Saga Torn State Menu');

    const fleetAct = new ActMnu.FleetMenu({});
    t.is(fleetAct.type, ActMnu.FLEET_MENU);

    const tornAct = new ActMnu.SagaTornStateMenu({ idx: 'torn' });
    t.is(tornAct.type, ActMnu.SAGA_TORN_STATE_MENU);
});

test('Phase 4 Reducer: reduces FLEET_MENU and SAGA_TORN_STATE_MENU actions cleanly', (t) => {
    const model = new MenuModel();
    const reducedFleet = reducer(model, new ActMnu.FleetMenu({}));
    t.truthy(reducedFleet);

    const reducedTorn = reducer(model, new ActMnu.SagaTornStateMenu({ idx: 'torn' }));
    t.truthy(reducedTorn);
});

test('Phase 4 Headless: fleetMenu and sagaTornStateMenu resolve safely without TTY/Blessed crashes', async (t) => {
    const model = new MenuModel();
    let fleetResolved: any = null;
    let tornResolved: any = null;

    await fleetMenu(
        model,
        {
            idx: 'test-fleet',
            slv: (res: any) => {
                fleetResolved = res;
            },
        },
        null as any,
    );

    t.is(fleetResolved?.mnuBit?.idx, 'fleet-menu-headless');

    await sagaTornStateMenu(
        model,
        {
            idx: 'test-torn',
            dat: {
                sagaId: 'saga-test-01',
                targetsCompleted: ['/targetA'],
                targetsFailed: ['/targetB (EBUSY)'],
            },
            slv: (res: any) => {
                tornResolved = res;
            },
        },
        null as any,
    );

    t.is(tornResolved?.mnuBit?.idx, 'saga-torn-state-menu-headless');
    t.is(tornResolved?.mnuBit?.dat?.sagaId, 'saga-test-01');
});

test('Phase 4 Negative Control: sagaTornStateMenu handles missing or malformed journal payloads safely', async (t) => {
    const model = new MenuModel();
    let tornResolved: any = null;

    // Missing dat payload
    await sagaTornStateMenu(
        model,
        {
            idx: 'test-torn-missing',
            slv: (res: any) => {
                tornResolved = res;
            },
        },
        null as any,
    );

    t.is(tornResolved?.mnuBit?.idx, 'saga-torn-state-menu-headless');
    t.is(tornResolved?.mnuBit?.dat?.sagaId, 'saga-fs-unknown');
    t.deepEqual(tornResolved?.mnuBit?.dat?.targetsCompleted, []);
    t.deepEqual(tornResolved?.mnuBit?.dat?.targetsFailed, ['target/unknown (ERROR)']);

    // Malformed dat payload (empty object)
    tornResolved = null;
    await sagaTornStateMenu(
        model,
        {
            idx: 'test-torn-empty',
            dat: {} as any,
            slv: (res: any) => {
                tornResolved = res;
            },
        },
        null as any,
    );

    t.is(tornResolved?.mnuBit?.idx, 'saga-torn-state-menu-headless');
});



import * as ActLib from '../995.library/00.library.unit/library.action'
import * as ActTrm from '../995.library/80.terminal.unit/terminal.action'
import * as ActGrd from '../995.library/81.grid.unit/grid.action'
import * as ActCns from '../995.library/83.console.unit/console.action'
import * as ActChc from '../995.library/85.choice.unit/choice.action'
import { libraryMenu } from '../995.library/98.menu.unit/buz/menu.library'
import sinon from 'sinon'

test.serial(
    'libraryMenu -- exposes AUDIT_LIBRARY option and dispatches audit on selection',
    async (t) => {
        const model = new MenuModel()
        const bal = { idx: 'test-menu' } as any

        let capturedChoices: string[] = []
        let auditedActionDispatched = false
        let printMenuDispatched = false

        const mockState: any = {
            hunt: sinon.spy(async (actionType: string, payload: any) => {
                if (actionType === ActTrm.CLEAR_TERMINAL) {
                    return {}
                }
                if (actionType === ActGrd.UPDATE_GRID) {
                    return { grdBit: { dat: { left: 0, top: 4, width: '40%', height: '50%' } } }
                }
                if (actionType === ActCns.UPDATE_CONSOLE) {
                    return {}
                }
                if (actionType === ActChc.OPEN_CHOICE) {
                    capturedChoices = payload.lst || []
                    // Emulate user selecting the audit action
                    return {
                        chcBit: {
                            src: ActLib.AUDIT_LIBRARY.split(']')[1],
                        },
                    }
                }
                if (actionType === ActLib.AUDIT_LIBRARY) {
                    auditedActionDispatched = true
                    return {
                        libBit: {
                            idx: 'audit-library',
                            val: 0,
                            dat: { totalTracked: 1, alignedCount: 1, driftedCount: 0 },
                        },
                    }
                }
                if (actionType === ActMnu.PRINT_MENU) {
                    printMenuDispatched = true
                    return { mnuBit: { idx: 'print-menu' } }
                }
                return {}
            }),
        }

        const auditActionLabel = ActLib.AUDIT_LIBRARY.split(']')[1]

        // Invoke libraryMenu in headless test mode
        await libraryMenu(model, bal, mockState)

        t.true(
            capturedChoices.includes(auditActionLabel),
            `Menu choices must include ${auditActionLabel}`,
        )
        t.true(
            auditedActionDispatched,
            'Selecting the audit choice must dispatch ActLib.AUDIT_LIBRARY',
        )
        t.true(
            printMenuDispatched,
            'Audit result must be dispatched to ActMnu.PRINT_MENU',
        )
    },
)

test.serial(
    'libraryMenu -- passes tooltips through choice callback without thrown errors',
    async (t) => {
        const model = new MenuModel()
        const bal = { idx: 'test-tooltip' } as any

        let callbackDispatchedLines: string[] = []

        const mockState: any = {
            hunt: sinon.spy(async (actionType: string, payload: any) => {
                if (actionType === ActGrd.UPDATE_GRID) {
                    return { grdBit: { dat: {} } }
                }
                if (actionType === ActChc.OPEN_CHOICE) {
                    // Trigger tooltip callback for AUDIT_LIBRARY
                    if (payload?.dat?.cb) {
                        payload.dat.cb(ActLib.AUDIT_LIBRARY.split(']')[1])
                    }
                    return { chcBit: { src: 'ROOT MENU' } }
                }
                if (actionType === ActCns.UPDATE_CONSOLE) {
                    if (payload?.src) callbackDispatchedLines.push(payload.src)
                    return {}
                }
                if (actionType === ActMnu.UPDATE_MENU) {
                    return {}
                }
                return {}
            }),
        }

        await libraryMenu(model, bal, mockState)

        t.true(
            callbackDispatchedLines.some((line) =>
                line.includes('Central Coordination Manifest'),
            ),
            'Tooltip text for AUDIT_LIBRARY must stream to console',
        )
    },
)
