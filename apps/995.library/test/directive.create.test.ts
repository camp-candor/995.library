import test from 'ava'
import sinon from 'sinon'
import path from 'path'
import fs from 'fs-extra'
import { DirectiveModel } from '../995.library/06.directive.unit/directive.model'
import { createDirective } from '../995.library/06.directive.unit/buz/directive.buzz'

test.serial(
    'createDirective [PHASE_DIRECTIVE_SCAFFOLDER] -- scaffolds divider and phase pairs sequentially',
    async (t) => {
        const scratchRoot = path.resolve(process.cwd(), 'scratch_test_create_directive')
        await fs.ensureDir(scratchRoot)

        const day000Dir = path.join(scratchRoot, 'data', 'directive', 'day-000')
        const day003Dir = path.join(scratchRoot, 'data', 'directive', 'day-003')

        await fs.ensureDir(day000Dir)
        await fs.ensureDir(day003Dir)

        // Seed day-000 templates
        await fs.writeFile(path.join(day000Dir, '000.focus.cpn'), '// Focus divider template')
        await fs.writeFile(path.join(day000Dir, '000.xxxx.jules.md'), '# Jules task template')
        await fs.writeFile(path.join(day000Dir, '000.xxxxx.gravity.md'), '# Gravity verification template')

        // Seed existing files in day-003 up to 000
        await fs.writeFile(path.join(day003Dir, '000.focus.cpn'), '// Initial day-003 focus')

        await fs.writeJson(path.join(scratchRoot, 'package.json'), {
            name: 'test-monorepo',
            workspaces: ['apps/*', 'packages/*'],
        })
        await fs.ensureDir(path.join(scratchRoot, 'apps'))
        await fs.ensureDir(path.join(scratchRoot, 'packages'))

        t.teardown(async () => {
            await fs.remove(scratchRoot).catch(() => {})
        })

        let resolvedResult: any = null
        const bal = {
            src: 'day-003',
            idx: 'modernize-media-pipeline',
            val: 2, // 2 phases requested
            slv: (res: any) => {
                resolvedResult = res
            },
        }

        const loggedLines: string[] = []
        const mockSte: any = {
            hunt: sinon.spy(async (actionType: string, payload: any) => {
                if (payload?.src) loggedLines.push(payload.src)
                return {}
            }),
        }

        const originalCwd = process.cwd
        process.cwd = () => scratchRoot

        try {
            await createDirective(new DirectiveModel(), bal as any, mockSte)
        } finally {
            process.cwd = originalCwd
        }

        t.truthy(resolvedResult, 'createDirective must invoke bal.slv')
        t.is(resolvedResult.drtBit.idx, 'create-directive')
        t.is(resolvedResult.drtBit.val, 5, '1 divider + (2 phases * 2 files) = 5 files total')

        // Assert exact sequential files exist in day-003
        t.true(await fs.pathExists(path.join(day003Dir, '001.modernize-media-pipeline.cpn')))
        t.true(await fs.pathExists(path.join(day003Dir, '002.phase-one.jules.md')))
        t.true(await fs.pathExists(path.join(day003Dir, '003.phase-one.gravity.md')))
        t.true(await fs.pathExists(path.join(day003Dir, '004.phase-two.jules.md')))
        t.true(await fs.pathExists(path.join(day003Dir, '005.phase-two.gravity.md')))

        // Verify content was transferred from templates
        const cpnContent = await fs.readFile(
            path.join(day003Dir, '001.modernize-media-pipeline.cpn'),
            'utf8',
        )
        t.is(cpnContent, '// Focus divider template')
    },
)

test.serial(
    'createDirective [PHASE_DIRECTIVE_SCAFFOLDER] -- preserves sequence continuation when files already exist',
    async (t) => {
        const scratchRoot = path.resolve(process.cwd(), 'scratch_test_seq_continue')
        await fs.ensureDir(scratchRoot)

        const day003Dir = path.join(scratchRoot, 'data', 'directive', 'day-003')
        await fs.ensureDir(day003Dir)

        // Seed up to index 005
        await fs.writeFile(path.join(day003Dir, '005.phase-two.gravity.md'), '')

        await fs.writeJson(path.join(scratchRoot, 'package.json'), {
            name: 'test-monorepo',
            workspaces: ['apps/*', 'packages/*'],
        })
        await fs.ensureDir(path.join(scratchRoot, 'apps'))
        await fs.ensureDir(path.join(scratchRoot, 'packages'))

        t.teardown(async () => {
            await fs.remove(scratchRoot).catch(() => {})
        })

        let resolvedResult: any = null
        const bal = {
            src: 'day-003',
            idx: 'enforce-type-contracts',
            val: 1, // 1 phase requested
            slv: (res: any) => {
                resolvedResult = res
            },
        }

        const originalCwd = process.cwd
        process.cwd = () => scratchRoot

        try {
            await createDirective(new DirectiveModel(), bal as any, null as any)
        } finally {
            process.cwd = originalCwd
        }

        t.truthy(resolvedResult)
        // Expected sequence starts at 006
        t.true(await fs.pathExists(path.join(day003Dir, '006.enforce-type-contracts.cpn')))
        t.true(await fs.pathExists(path.join(day003Dir, '007.phase-one.jules.md')))
        t.true(await fs.pathExists(path.join(day003Dir, '008.phase-one.gravity.md')))
    },
)
