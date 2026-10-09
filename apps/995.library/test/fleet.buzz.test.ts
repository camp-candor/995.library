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
    'scanFleet -- fails closed to scan-fleet-error if fleet root cannot be resolved',
    async (t) => {
        cleanEnv()

        const slv = sinon.fake()
        const hunt = sinon.fake.resolves({})
        const ste = { hunt } as any
        const model = new LibraryModel()
        const bal = { slv } as any

        // Mock unresolvable root by temporarily overriding process.cwd
        const originalCwd = process.cwd
        process.cwd = () => '/home/runner/work/unresolvable/unresolvable'

        try {
            await scanFleet(model, bal, ste)
        } finally {
            process.cwd = originalCwd
        }

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet-error')
        t.is(payload.libBit.src, 'NO_FLEET_ROOT')
        t.is(payload.libBit.val, -1)
        t.deepEqual(payload.libBit.lst, [])
    },
)

test.serial(
    'scanFleet -- formats bracket paths and sorts alphabetically',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_formatting_sort',
        )
        const repoZ = path.join(mockFleetRoot, 'zeta-org', '999.zeta-bot')
        const repoA = path.join(mockFleetRoot, 'alpha-org', '000.alpha-bot')
        const repoM = path.join(mockFleetRoot, 'middle-org', '100.middle-bot')

        await fs.ensureDir(path.join(repoZ, 'apps', '995.library'))
        await fs.writeFile(path.join(repoZ, 'package.json'), '{}')

        await fs.ensureDir(path.join(repoA, 'apps', '995.library'))
        await fs.writeFile(path.join(repoA, 'package.json'), '{}')

        await fs.ensureDir(path.join(repoM, 'apps', '995.library'))
        await fs.writeFile(path.join(repoM, 'package.json'), '{}')

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { slv } as any

        await scanFleet(model, bal, null as any)

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet')
        t.is(payload.libBit.val, 3)

        // Verify bracket formatting regex: [folder/repo/apps/995.library]
        for (const item of payload.libBit.lst) {
            t.regex(
                item,
                /^\[[a-zA-Z0-9_\-\.\/]+\]$/,
                `Path must be enclosed in square brackets: ${item}`,
            )
        }

        // Verify alphabetical sorting order
        t.deepEqual(payload.libBit.lst, [
            '[alpha-org/000.alpha-bot/apps/995.library]',
            '[middle-org/100.middle-bot/apps/995.library]',
            '[zeta-org/999.zeta-bot/apps/995.library]',
        ])
    },
)

test.serial(
    'scanFleet -- handles headless execution safely without throwing on null ste',
    async (t) => {
        const mockFleetRoot = path.resolve(process.cwd(), 'scratch_test_headless')
        const repoA = path.join(mockFleetRoot, 'org-a', '000.repo')
        await fs.ensureDir(path.join(repoA, 'apps', '995.library'))
        await fs.writeFile(path.join(repoA, 'package.json'), '{}')

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { slv } as any

        // Passing ste = null must execute cleanly without crashing
        await scanFleet(model, bal, null as any)

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet')
        t.is(payload.libBit.val, 1)
    },
)

test.serial(
    'scanFleet -- streams pure 7-bit ASCII telemetry to cns00 when ste is present',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_telemetry_stream',
        )
        const repoA = path.join(mockFleetRoot, 'org-a', '000.repo')
        await fs.ensureDir(path.join(repoA, 'packages', '133.cloudflare'))
        await fs.writeFile(path.join(repoA, 'package.json'), '{}')

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        const hunt = sinon.fake.resolves({})
        const ste = { hunt } as any
        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { src: '[133.cloudflare]', slv } as any

        await scanFleet(model, bal, ste)

        t.true(slv.calledOnce)
        t.true(hunt.called, 'ste.hunt must be called to update console')

        const loggedMessages: string[] = hunt.args.map((call: any) => call[1]?.src)
        t.true(
            loggedMessages.some((msg) =>
                msg.includes('>> [SCAN_FLEET] Scanning fleet root:'),
            ),
        )
        t.true(
            loggedMessages.some((msg) =>
                msg.includes('>> [SCAN_FLEET] Target pivot filter: 133.cloudflare'),
            ),
        )
        t.true(
            loggedMessages.some((msg) =>
                msg.includes(
                    '>> [SCAN_FLEET_OK] Discovered 1 target(s) across fleet.',
                ),
            ),
        )

        for (const msg of loggedMessages) {
            t.regex(
                msg,
                /^[\x00-\x7F]*$/,
                `Telemetry message must be pure 7-bit ASCII: ${msg}`,
            )
        }
    },
)

test.serial(
    'scanFleet -- fails closed with scan-fleet-error on unresolvable fleet root',
    async (t) => {
        cleanEnv()

        const hunt = sinon.fake.resolves({})
        const ste = { hunt } as any
        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { slv } as any

        // Mock unresolvable root by temporarily overriding process.cwd
        const originalCwd = process.cwd
        process.cwd = () => '/home/runner/work/unresolvable/unresolvable'

        try {
            await scanFleet(model, bal, ste)
        } finally {
            process.cwd = originalCwd
        }

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet-error')
        t.is(payload.libBit.src, 'NO_FLEET_ROOT')
        t.is(payload.libBit.val, -1)
        t.deepEqual(payload.libBit.lst, [])
    },
)

test.serial(
    'scanFleet -- catches unexpected read errors and fulfills scan-fleet-error contract',
    async (t) => {
        const mockFleetRoot = path.resolve(
            process.cwd(),
            'scratch_test_fault_injection',
        )
        await fs.ensureDir(mockFleetRoot)

        t.teardown(async () => {
            await fs.remove(mockFleetRoot).catch(() => {})
        })

        process.env.FLEET_ROOT = mockFleetRoot

        // Inject fault: simulate readdirSync throwing an EACCES / EPERM error
        const originalReaddirSync = fs.readdirSync
        fs.readdirSync = () => {
            throw new Error('EACCES: permission denied')
        }

        const slv = sinon.fake()
        const model = new LibraryModel()
        const bal = { slv } as any

        try {
            await scanFleet(model, bal, null as any)
        } finally {
            fs.readdirSync = originalReaddirSync
        }

        t.true(slv.calledOnce)
        const payload = slv.firstCall.args[0]
        t.is(payload.libBit.idx, 'scan-fleet-error')
        t.is(payload.libBit.val, -1)
        t.true(payload.libBit.src.includes('permission denied'))
        t.deepEqual(payload.libBit.lst, [])
    },
)
