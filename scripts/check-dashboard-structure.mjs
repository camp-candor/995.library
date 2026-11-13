import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const DASHBOARD_DIR = path.join(REPO_ROOT, 'apps', 'dashboard')
const DASHBOARD_SRC_DIR = path.join(DASHBOARD_DIR, 'src')

export const ALLOWED_DASHBOARD_DIRS = new Set([
    'base',
    'functions',
    'public',
    'src',
    'test',
])

export const IGNORED_DASHBOARD_DIRS = new Set([
    '.rsbuild',
    '.wrangler',
    '.turbo',
    'dist',
    'node_modules',
    'playwright-report',
    'test-results',
])

export const ALLOWED_DASHBOARD_SRC_DIRS = new Set([
    'context',
    'hooks',
    'network',
    'page',
    'queue',
    'router',
    'template',
    'ui',
])

function getSubdirectories(dirPath) {
    if (!fs.existsSync(dirPath)) return []
    return fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
}

export function checkFilesystemStructure() {
    const violations = []

    for (const dir of getSubdirectories(DASHBOARD_DIR)) {
        if (
            !ALLOWED_DASHBOARD_DIRS.has(dir) &&
            !IGNORED_DASHBOARD_DIRS.has(dir)
        ) {
            violations.push(`apps/dashboard/${dir}`)
        }
    }

    for (const dir of getSubdirectories(DASHBOARD_SRC_DIR)) {
        if (!ALLOWED_DASHBOARD_SRC_DIRS.has(dir)) {
            violations.push(`apps/dashboard/src/${dir}`)
        }
    }

    return violations
}

export function checkStagedStructure() {
    const raw = execSync('git diff --cached --name-only --diff-filter=ACMR', {
        cwd: REPO_ROOT,
        encoding: 'utf8',
    })
    const stagedFiles = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

    const violations = new Set()

    for (const filePath of stagedFiles) {
        const normalized = filePath.replace(/\\/g, '/')
        if (!normalized.startsWith('apps/dashboard/')) continue

        const rel = normalized.slice('apps/dashboard/'.length)
        const parts = rel.split('/')

        // Ignore files directly at apps/dashboard/<file>
        if (parts.length < 2) continue

        const topDir = parts[0]
        if (
            !ALLOWED_DASHBOARD_DIRS.has(topDir) &&
            !IGNORED_DASHBOARD_DIRS.has(topDir)
        ) {
            violations.add(`apps/dashboard/${topDir}`)
        }

        if (topDir === 'src' && parts.length >= 3) {
            const srcDir = parts[1]
            if (!ALLOWED_DASHBOARD_SRC_DIRS.has(srcDir)) {
                violations.add(`apps/dashboard/src/${srcDir}`)
            }
        }
    }

    return Array.from(violations)
}

function main() {
    const isStaged = process.argv.includes('--staged')
    const violations = isStaged
        ? checkStagedStructure()
        : checkFilesystemStructure()

    if (violations.length > 0) {
        console.error(
            ':: [FAIL] Unapproved directories detected in apps/dashboard:',
        )
        for (const v of violations) {
            console.error(`   - ${v}`)
        }
        console.error(
            ':: Allowed apps/dashboard/* dirs:',
            Array.from(ALLOWED_DASHBOARD_DIRS).join(', '),
        )
        console.error(
            ':: Allowed apps/dashboard/src/* dirs:',
            Array.from(ALLOWED_DASHBOARD_SRC_DIRS).join(', '),
        )
        process.exit(1)
    }

    console.log('>> [PASS] apps/dashboard directory structure verified.')
}

if (
    process.argv[1] &&
    path.resolve(process.argv[1]) ===
        path.resolve(fileURLToPath(import.meta.url))
) {
    main()
}
