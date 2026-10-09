import test from 'ava'
import sinon from 'sinon'
import path from 'path'
import fs from 'fs-extra'
import { UnitModel } from '../995.library/01.unit.unit/unit.model'
import {
    flattenUnit,
    createUnit,
    updateUnit,
} from '../995.library/01.unit.unit/buz/unit.buzz'

function makeBal(idx: string, src?: string, dat?: any) {
    return { idx, src, dat, slv: sinon.fake() } as any
}

function makeModel() {
    return new UnitModel()
}

const ste = null as any

test.serial(
    'flattenUnit -- flattens directory to root data/unit/<name>.txt without leaks',
    async (t) => {
        let repoRoot = process.cwd()
        while (
            repoRoot &&
            !(
                fs.existsSync(path.join(repoRoot, 'apps')) &&
                fs.existsSync(path.join(repoRoot, 'packages'))
            )
        ) {
            const parent = path.dirname(repoRoot)
            if (parent === repoRoot) break
            repoRoot = parent
        }

        const tempDir = path.join(repoRoot, 'scratch_test_unit')
        await fs.ensureDir(path.join(tempDir, 'src'))
        await fs.ensureDir(path.join(tempDir, 'node_modules', 'dummy'))
        await fs.ensureDir(path.join(tempDir, 'dist'))
        await fs.ensureDir(path.join(tempDir, 'data'))

        await fs.writeFile(
            path.join(tempDir, 'src', 'index.ts'),
            'export const hello = "world";\n',
        )
        await fs.writeFile(
            path.join(tempDir, 'node_modules', 'dummy', 'index.js'),
            'export const leak = true;\n',
        )
        await fs.writeFile(
            path.join(tempDir, 'dist', 'bundle.js'),
            'export const compiled = true;\n',
        )
        await fs.writeFile(
            path.join(tempDir, 'data', 'store.json'),
            '{"key":"value"}',
        )

        const testIdx = 'test-scratch-unit'
        const bal = makeBal(testIdx, tempDir)

        const expectedOutputFile = path.join(
            repoRoot,
            'data',
            'unit',
            `${testIdx}.txt`,
        )

        t.teardown(async () => {
            await fs.remove(expectedOutputFile).catch(() => {})
            await fs.remove(tempDir).catch(() => {})
        })

        await flattenUnit(makeModel(), bal, ste)

        t.true(bal.slv.calledOnce, 'bal.slv should be called once')
        const result = bal.slv.firstCall.args[0]
        t.is(result.untBit.idx, 'flatten-unit')

        const relativeOutputPath = result.untBit.src
        t.true(
            relativeOutputPath.startsWith('data/unit/'),
            `Path must start with data/unit/, got: ${relativeOutputPath}`,
        )
        t.true(
            relativeOutputPath.endsWith('.txt'),
            `Path must end with .txt, got: ${relativeOutputPath}`,
        )

        const absoluteOutputFile = path.join(repoRoot, relativeOutputPath)
        t.true(
            fs.existsSync(absoluteOutputFile),
            `File should exist on disk at ${absoluteOutputFile}`,
        )

        const content = await fs.readFile(absoluteOutputFile, 'utf8')
        t.true(
            content.includes('export const hello = "world";'),
            'Should contain source code',
        )
        t.false(content.includes('leak'), 'Must not contain node_modules files')
        t.false(content.includes('compiled'), 'Must not contain dist files')
        t.false(content.includes('store.json'), 'Must not contain data files')
    },
)

test.serial(
    'createUnit -- scaffolds templates deterministically and resolves immediately without timeout',
    async (t) => {
        let repoRoot = process.cwd()
        while (
            repoRoot &&
            !(
                fs.existsSync(path.join(repoRoot, 'apps')) &&
                fs.existsSync(path.join(repoRoot, 'packages'))
            )
        ) {
            const parent = path.dirname(repoRoot)
            if (parent === repoRoot) break
            repoRoot = parent
        }

        const testVerb = 'weather'
        const bal = makeBal(testVerb)
        const targetRelativeDir = `data/unit/00.${testVerb}.unit`
        const targetAbsoluteDir = path.join(repoRoot, targetRelativeDir)

        t.teardown(async () => {
            await fs.remove(targetAbsoluteDir).catch(() => {})
        })

        createUnit(makeModel(), bal, ste)

        t.true(
            bal.slv.calledOnce,
            'bal.slv must be invoked synchronously and immediately',
        )
        const result = bal.slv.firstCall.args[0]
        t.is(result.untBit.idx, 'create-unit')
        t.true(
            result.untBit.src.startsWith(targetRelativeDir),
            `Expected ${targetRelativeDir}, got: ${result.untBit.src}`,
        )

        t.true(
            fs.existsSync(targetAbsoluteDir),
            'Target unit directory must exist on disk',
        )

        const expectedFiles = [
            'weather.action.ts',
            'weather.buzzer.ts',
            'weather.model.ts',
            'weather.reduce.ts',
            'weather.unit.ts',
            'buz/weather.buzz.ts',
            'fce/weather.interface.ts',
            'fce/weather.bit.ts',
        ]

        for (const relFile of expectedFiles) {
            const fullFilePath = path.join(targetAbsoluteDir, relFile)
            t.true(
                fs.existsSync(fullFilePath),
                `Missing scaffolded file: ${relFile}`,
            )
        }
    },
)

test.serial(
    'updateUnit -- generates non-blocking async stubs and resolves immediately',
    async (t) => {
        let repoRoot = process.cwd()
        while (
            repoRoot &&
            !(
                fs.existsSync(path.join(repoRoot, 'apps')) &&
                fs.existsSync(path.join(repoRoot, 'packages'))
            )
        ) {
            const parent = path.dirname(repoRoot)
            if (parent === repoRoot) break
            repoRoot = parent
        }

        const tempUnitDir = path.join(
            repoRoot,
            'scratch_unit_update',
            '00.demo.unit',
        )
        const buzzDir = path.join(tempUnitDir, 'buz')
        await fs.ensureDir(buzzDir)

        const buzzFile = path.join(buzzDir, 'demo.buzz.ts')
        const buzzerFile = path.join(tempUnitDir, 'demo.buzzer.ts')
        const actionFile = path.join(tempUnitDir, 'demo.action.ts')
        const reduceFile = path.join(tempUnitDir, 'demo.reduce.ts')

        await fs.writeFile(buzzFile, 'export const initDemo = () => {};\n')
        await fs.writeFile(
            buzzerFile,
            'export { initDemo } from "./buz/demo.buzz";\n',
        )
        await fs.writeFile(
            actionFile,
            [
                'export const INIT_DEMO = "[Demo action] Init Demo";',
                'export class InitDemo { readonly type = INIT_DEMO; }',
                'export type Actions = InitDemo;',
            ].join('\n'),
        )
        await fs.writeFile(
            reduceFile,
            [
                'import * as Act from "./demo.action";',
                'export function reducer(model = {}, act = {}) {',
                '  switch (act.type) {',
                '    default: return model;',
                '  }',
                '}',
            ].join('\n'),
        )

        t.teardown(async () => {
            await fs
                .remove(path.join(repoRoot, 'scratch_unit_update'))
                .catch(() => {})
        })

        const bal = makeBal(
            '00.demo.unit',
            path.join(repoRoot, 'scratch_unit_update'),
            'open',
        )

        await updateUnit(makeModel(), bal, ste)

        t.true(
            bal.slv.calledOnce,
            'updateUnit must resolve immediately without timeout',
        )
        const res = bal.slv.firstCall.args[0]
        t.is(res.untBit.idx, 'update-unit')

        const buzzContent = await fs.readFile(buzzFile, 'utf8')
        t.true(
            buzzContent.includes('export const openDemo = async'),
            'Must append async openDemo export',
        )
        t.true(
            buzzContent.includes('Update Console'),
            'Must include non-blocking console telemetry',
        )
        t.true(
            buzzContent.includes("bal.slv({ openBit: { idx: 'openDemo-stub' } })"),
            'Must resolve bal.slv with openBit payload',
        )
        t.false(
            buzzContent.includes('debugger'),
            'Must not include blocking debugger statements',
        )
    },
)
