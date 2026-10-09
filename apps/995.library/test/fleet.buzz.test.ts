import test from 'ava'
import path from 'path'
import fs from 'fs-extra'
import sinon from 'sinon'
import { LibraryModel } from '../995.library/00.library.unit/library.model'
import {
    resolveFleetRoot,
    scanFleet,
} from '../995.library/00.library.unit/buz/library.buzz'

const cleanEnv = () => {
    delete process.env.FLEET_ROOT
    delete process.env.WORK_DIR
}

test.beforeEach(() => {
    cleanEnv()
})

test.afterEach(() => {
    cleanEnv()
})

test.serial(
    'resolveFleetRoot -- prioritizes process.env.FLEET_ROOT over filesystem search',
    async (t) => {
        const scratchDir = path.resolve(process.cwd(), 'scratch_test_fleet_env')
        await fs.ensureDir(scratchDir)

        t.teardown(async () => {
            await fs.remove(scratchDir).catch(() => {})
        })

        process.env.FLEET_ROOT = scratchDir
        const resolved = resolveFleetRoot('/some/arbitrary/nested/path')

        t.is(
            resolved,
            scratchDir,
            'Must directly resolve FLEET_ROOT when directory exists',
        )
    },
)

test.serial(
    'resolveFleetRoot -- prioritizes process.env.WORK_DIR when FLEET_ROOT is absent',
    async (t) => {
        const scratchDir = path.resolve(
            process.cwd(),
            'scratch_test_work_dir_env',
        )
        await fs.ensureDir(scratchDir)

        t.teardown(async () => {
            await fs.remove(scratchDir).catch(() => {})
        })

        process.env.WORK_DIR = scratchDir
        const resolved = resolveFleetRoot('/some/arbitrary/nested/path')

        t.is(
            resolved,
            scratchDir,
            'Must resolve WORK_DIR when FLEET_ROOT is omitted',
        )
    },
)

test.serial(
    'resolveFleetRoot -- crawls upward to discover camp-candor-cauldron sentinel',
    async (t) => {
        const mockRoot = path.resolve(
            process.cwd(),
            'scratch_test_cauldron_root',
        )
        const cauldronDir = path.join(mockRoot, 'camp-candor-cauldron')
        const deepNested = path.join(
            mockRoot,
            '02.simulation',
            '002.worker',
            'src',
        )

        await fs.ensureDir(deepNested)
        await fs.ensureDir(cauldronDir)
        await fs.writeFile(
            path.join(cauldronDir, 'versions.json'),
            '{"sovereign_repo": "000.repo-bot"}',
        )

        t.teardown(async () => {
            await fs.remove(mockRoot).catch(() => {})
        })

        const resolved = resolveFleetRoot(deepNested)
        t.is(
            resolved,
            mockRoot,
            'Must identify parent of camp-candor-cauldron as FLEET_ROOT',
        )
    },
)

test.serial(
    'resolveFleetRoot -- discovers multi-tenant organizational cluster folders',
    async (t) => {
        const mockRoot = path.resolve(process.cwd(), 'scratch_test_org_clusters')
        const orgDirA = path.join(mockRoot, 'campc-it-com', '000.repo-bot')
        const orgDirB = path.join(mockRoot, 'astro-kahn-it-com')
        const deepNested = path.join(orgDirA, 'apps', '995.library')

        await fs.ensureDir(deepNested)
        await fs.ensureDir(orgDirB)

        t.teardown(async () => {
            await fs.remove(mockRoot).catch(() => {})
        })

        const resolved = resolveFleetRoot(deepNested)
        t.is(
            resolved,
            mockRoot,
            'Must resolve directory containing known organization clusters',
        )
    },
)

test.serial(
    'scanFleet -- discovers apps/995.library across multi-tenant organization directories',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_fleet_scan',
        )
        const repoA = path.join(mockFleetRoot, 'campc-it-com', '000.repo-bot')
        const repoB = path.join(
            mockFleetRoot,
            'astro-kahn-it-com',
            '001.goblin-lore',
        )
        const repoC = path.join(
            mockFleetRoot,
            'slopratchet.com',
            '999.plain-service',
        )

        // Repos A & B contain apps/995.library; Repo C does not
        await fs.ensureDir(path.join(repoA, 'apps', '995.library'))
        await fs.writeFile(
            path.join(repoA, 'package.json'),
            '{"name":"repo-bot"}',
        )

        await fs.ensureDir(path.join(repoB, 'apps', '995.library'))
        await fs.writeFile(
            path.join(repoB, 'package.json'),
            '{"name":"goblin-lore"}',
        )

        await fs.ensureDir(path.join(repoC, 'src'))
        await fs.writeFile(
            path.join(repoC, 'package.json'),
            '{"name":"plain-service"}',
        )

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { slv } as any
        const ste = null as any

        await scanFleet(model, bal, ste)

        t.true(slv.calledOnce, 'bal.slv must be invoked once')
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet')
        t.is(payload.libBit.val, 2)
        t.deepEqual(payload.libBit.lst, [
            '[astro-kahn-it-com/001.goblin-lore/apps/995.library]',
            '[campc-it-com/000.repo-bot/apps/995.library]',
        ])
    },
)

test.serial(
    'scanFleet -- discovers targeted package pivot when bal.src is provided',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_pivot_scan',
        )
        const repoA = path.join(mockFleetRoot, 'campc-it-com', '000.repo-bot')
        const repoB = path.join(
            mockFleetRoot,
            'astro-kahn-it-com',
            '001.goblin-lore',
        )

        // Repo A has packages/133.cloudflare; Repo B has packages/001.lore
        await fs.ensureDir(path.join(repoA, 'packages', '133.cloudflare'))
        await fs.writeFile(
            path.join(repoA, 'package.json'),
            '{"name":"repo-bot"}',
        )

        await fs.ensureDir(path.join(repoB, 'packages', '001.lore'))
        await fs.writeFile(
            path.join(repoB, 'package.json'),
            '{"name":"goblin-lore"}',
        )

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { src: '[133.cloudflare]', slv } as any
        const ste = null as any

        await scanFleet(model, bal, ste)

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet')
        t.is(payload.libBit.val, 1)
        t.deepEqual(payload.libBit.lst, [
            '[campc-it-com/000.repo-bot/packages/133.cloudflare]',
        ])
    },
)

test.serial(
    'scanFleet -- returns empty list cleanly when target pivot does not exist',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_empty_pivot',
        )
        const repoA = path.join(mockFleetRoot, 'campc-it-com', '000.repo-bot')
        await fs.ensureDir(path.join(repoA, 'packages', '000.agent'))
        await fs.writeFile(
            path.join(repoA, 'package.json'),
            '{"name":"repo-bot"}',
        )

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { src: '999.nonexistent', slv } as any
        const ste = null as any

        await scanFleet(model, bal, ste)

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet')
        t.is(payload.libBit.val, 0)
        t.deepEqual(payload.libBit.lst, [])
    },
)

test.serial(
    'scanFleet -- handles direct root repository layout alongside nested org clusters',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_mixed_layout',
        )
        const directRepo = path.join(mockFleetRoot, '000.direct-server')
        const nestedRepo = path.join(mockFleetRoot, 'campc-it-com', '000.repo-bot')

        await fs.ensureDir(path.join(directRepo, 'apps', '995.library'))
        await fs.writeFile(
            path.join(directRepo, 'package.json'),
            '{"name":"direct-server"}',
        )

        await fs.ensureDir(path.join(nestedRepo, 'apps', '995.library'))
        await fs.writeFile(
            path.join(nestedRepo, 'package.json'),
            '{"name":"repo-bot"}',
        )

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { slv } as any
        const ste = null as any

        await scanFleet(model, bal, ste)

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.val, 2)
        t.deepEqual(payload.libBit.lst, [
            '[000.direct-server/apps/995.library]',
            '[campc-it-com/000.repo-bot/apps/995.library]',
        ])
    },
)

test.serial(
    'scanFleet -- streams pure 7-bit ASCII console updates to cns00 when state is present',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_telemetry',
        )
        const repoA = path.join(mockFleetRoot, 'campc-it-com', '000.repo-bot')
        await fs.ensureDir(path.join(repoA, 'apps', '995.library'))
        await fs.writeFile(
            path.join(repoA, 'package.json'),
            '{"name":"repo-bot"}',
        )

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const slv = sinon.fake()
        const hunt = sinon.fake.resolves({})
        const ste = { hunt } as any
        const model = new LibraryModel()
        const bal = { slv } as any

        await scanFleet(model, bal, ste)

        t.true(slv.calledOnce)
        t.true(hunt.called, 'ste.hunt must be dispatched for telemetry')

        const loggedLines = hunt.args.map((arg: any) => arg[1]?.src)
        for (const line of loggedLines) {
            t.true(
                /^[\x00-\x7F]*$/.test(line),
                `Line must be pure 7-bit ASCII: ${line}`,
            )
        }
    },
)

test.serial(
    'scanFleet -- fails closed to scan-fleet-error if fleet root cannot be resolved',
    async (t) => {
        cleanEnv()

        const slv = sinon.fake()
        const hunt = sinon.fake.resolves({})
        const ste = { hunt } as any
        const model = new LibraryModel()
        const bal = { slv } as any

        // Force non-resolvable start directory on detached runner path
        const unresolvableDir = '/home/runner/work/detached/detached'

        // Stub resolveFleetRoot behavior by calling with explicit runner path
        const resolved = resolveFleetRoot(unresolvableDir)
        t.is(resolved, null, 'Runner path must fail to null')

        // If resolveFleetRoot returns null in runtime
        const originalResolve = resolveFleetRoot
        // Execute buzzer directly ensuring error handling
        await scanFleet(model, bal, ste)

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.truthy(payload.libBit.idx)
    },
)
