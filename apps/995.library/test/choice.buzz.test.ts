import test from 'ava'
import sinon from 'sinon'
import { ChoiceModel } from '../995.library/85.choice.unit/choice.model'
import { openChoice } from '../995.library/85.choice.unit/buz/choice.buzz'

test('openChoice -- handles headless environment cleanly without throwing', (t) => {
    const model = new ChoiceModel()
    const slv = sinon.fake()
    const bal = {
        idx: 'test-choice',
        lst: ['OPTION A', 'OPTION B'],
        slv,
    } as any

    const ste = {
        value: {
            terminal: {},
        },
    } as any

    openChoice(model, bal, ste)

    t.true(slv.calledOnce, 'Resolver must be called immediately in headless state')
    const result = slv.firstCall.args[0]
    t.is(result.chcBit.idx, 'open-choice-headless')
    t.is(result.chcBit.src, 'OPTION A')
})

test('openChoice -- binds vertical navigation keys and unbinds on submit', (t) => {
    const model = new ChoiceModel()
    const slv = sinon.fake()

    const unkeyFake = sinon.fake()
    const keyFake = sinon.fake()
    const renderFake = sinon.fake()
    const destroyFake = sinon.fake()

    let submitHandler: Function = () => {}

    const mockButton = {
        on: sinon.fake(),
        focus: sinon.fake(),
        content: 'OPTION A',
        index: 1,
    }

    const mockForm = {
        _selected: mockButton,
        focusPrevious: sinon.fake(),
        focusNext: sinon.fake(),
        destroy: destroyFake,
        on: (event: string, handler: Function) => {
            if (event === 'submit') submitHandler = handler
        },
    }

    const mockBlessed = {
        form: () => mockForm,
        button: () => mockButton,
    }

    const mockScreen = {
        key: keyFake,
        unkey: unkeyFake,
        render: renderFake,
    }

    const ste = {
        value: {
            terminal: {
                blessed: mockBlessed,
                screen: mockScreen,
            },
        },
    } as any

    const bal = {
        idx: 'test-choice',
        lst: ['OPTION A', 'OPTION B'],
        slv,
    } as any

    openChoice(model, bal, ste)

    // Assert vertical keys ('up', 'k') and ('down', 'j') were bound
    t.true(keyFake.calledWith(['up', 'k']), 'Must bind up/k keys')
    t.true(keyFake.calledWith(['down', 'j']), 'Must bind down/j keys')

    // Simulate submission
    submitHandler()

    // Assert cleanup occurred
    t.true(unkeyFake.calledWith(['up', 'k']), 'Must unbind up/k keys on submit')
    t.true(unkeyFake.calledWith(['down', 'j']), 'Must unbind down/j keys on submit')
    t.true(destroyFake.calledOnce, 'Must destroy form widget on submit')
    t.true(slv.calledOnce, 'Must resolve bal.slv upon submit')
    t.is(slv.firstCall.args[0].chcBit.src, 'OPTION A')
})
