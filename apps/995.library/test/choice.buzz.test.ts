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

test('openChoice -- single-step navigation invariant (keys: false on form avoids duplicate key routing)', (t) => {
    const model = new ChoiceModel()
    const slv = sinon.fake()
    const keyFake = sinon.fake()

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
        destroy: sinon.fake(),
        on: sinon.fake(),
    }

    const formFake = sinon.fake.returns(mockForm)
    const mockBlessed = {
        form: formFake,
        button: sinon.fake.returns(mockButton),
    }

    const mockScreen = {
        key: keyFake,
        unkey: sinon.fake(),
        render: sinon.fake(),
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
        lst: ['OPTION A', 'OPTION B', 'OPTION C'],
        slv,
    } as any

    openChoice(model, bal, ste)

    // Form must have keys: false to prevent Blessed Form from intercepting arrow keys
    // which would cause double-jumping when combined with screen.key
    t.true(formFake.calledOnce, 'Form must be created')
    t.is(
        formFake.firstCall.args[0].keys,
        false,
        'Form must be initialized with keys: false to prevent duplicate keypress routing',
    )

    // Extract registered up/down key handlers
    const downCall = keyFake.args.find(
        (args) => Array.isArray(args[0]) && args[0].includes('down'),
    )
    const upCall = keyFake.args.find(
        (args) => Array.isArray(args[0]) && args[0].includes('up'),
    )

    t.truthy(downCall, 'Down key handler must be registered')
    t.truthy(upCall, 'Up key handler must be registered')

    const handleDown = downCall[1]
    const handleUp = upCall[1]

    // Verify exactly one step per keypress (no skipping)
    handleDown()
    t.is(mockForm.focusNext.callCount, 1, 'First down stroke must advance focus by exactly 1 item')

    handleDown()
    t.is(mockForm.focusNext.callCount, 2, 'Second down stroke must advance focus by exactly 1 item')

    handleUp()
    t.is(mockForm.focusPrevious.callCount, 1, 'Up stroke must move focus backward by exactly 1 item')
})

test('openChoice -- synchronizes form._selected on button focus event', (t) => {
    const model = new ChoiceModel()
    const slv = sinon.fake()

    const buttonEventHandlers: Record<string, Function> = {}
    const mockButton = {
        on: (event: string, handler: Function) => {
            buttonEventHandlers[event] = handler
        },
        focus: sinon.fake(),
        content: 'OPTION B',
        index: 2,
    }

    const mockForm: any = {
        _selected: null,
        focusPrevious: sinon.fake(),
        focusNext: sinon.fake(),
        destroy: sinon.fake(),
        on: sinon.fake(),
    }

    const mockBlessed = {
        form: sinon.fake.returns(mockForm),
        button: sinon.fake.returns(mockButton),
    }

    const mockScreen = {
        key: sinon.fake(),
        unkey: sinon.fake(),
        render: sinon.fake(),
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

    t.truthy(buttonEventHandlers['focus'], 'Button focus listener must be attached')

    // Simulate focus event on button
    buttonEventHandlers['focus']()

    t.is(
        mockForm._selected,
        mockButton,
        'form._selected must synchronize with the active focused button',
    )
})