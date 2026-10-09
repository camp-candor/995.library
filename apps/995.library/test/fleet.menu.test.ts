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
