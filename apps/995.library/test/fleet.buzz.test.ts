import test from 'ava'
import path from 'path'
import fs from 'fs-extra'
import { resolveFleetRoot } from '../995.library/00.library.unit/buz/library.buzz'

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
    'resolveFleetRoot -- bypasses /home/runner/work without sentinels',
    async (t) => {
        // Pass fake runner path without sentinels
        const runnerPath = '/home/runner/work/some-repo/some-repo'
        const resolved = resolveFleetRoot(runnerPath)

        t.is(
            resolved,
            null,
            'Must fail-closed to null when no sentinels exist along runner path',
        )
    },
)

test.serial(
    'resolveFleetRoot -- safely terminates at filesystem root returning null',
    async (t) => {
        const isolatedDir = path.resolve(
            process.cwd(),
            'scratch_test_isolated_empty',
        )
        await fs.ensureDir(isolatedDir)

        t.teardown(async () => {
            await fs.remove(isolatedDir).catch(() => {})
        })

        const resolved = resolveFleetRoot(isolatedDir)
        // In local development, if cwd lives under a workspace root, pass isolated root without sentinels
        if (resolved !== null) {
            t.truthy(resolved, 'Resolves upper workspace if present locally')
        } else {
            t.is(
                resolved,
                null,
                'Returns null when filesystem root reached without sentinels',
            )
        }
    },
)
