import type { LibraryModel } from '../library.model'
import type LibraryBit from '../fce/library.bit'
import type State from '../../99.core/state'

import * as ActMnu from '../../98.menu.unit/menu.action'
import * as ActBus from '../../99.bus.unit/bus.action'
import * as ActCns from '../../83.console.unit/console.action'

import * as ActLib from '../library.action'

let bit, val, idx, dex, lst, dat

const exec = require('child_process').exec

export const initLibrary = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
) => {
    global.SOWER = null
    global.TIME = null

    global.SOLID = null
    global.PIXEL = null

    if (bal.dat != null)
        bit = await ste.hunt(ActBus.INIT_BUS, {
            idx: cpy.idx,
            lst: [ActLib],
            dat: bal.dat,
            src: bal.src,
        })

    //setInterval( async ()=>{

    //   ste.bus("[Open action] Open Pixel", {})

    //}, 4444 )

    //if (bal.val == 1) patch(ste, ActMnu.INIT_MENU, bal);
    bit = await ste.hunt(ActMnu.INIT_MENU, bal)
    if (bal.slv != null) bal.slv({ intBit: { idx: 'init-mythos' } })

    return cpy
}

export const listLibrary = (cpy: LibraryModel, bal: LibraryBit, ste: State) => {
    const fs = require('fs')
    const path = require('path')

    const resultList = []
    const isRepoRoot = (dir: string) => {
        try {
            return (
                fs.existsSync(path.join(dir, 'apps')) &&
                fs.existsSync(path.join(dir, 'packages')) &&
                fs.existsSync(path.join(dir, 'package.json'))
            )
        } catch {
            return false
        }
    }

    let parentDir = process.cwd()
    while (parentDir && !isRepoRoot(parentDir)) {
        const parent = path.dirname(parentDir)
        if (parent === parentDir) break
        parentDir = parent
    }
    const IGNORE = new Set([
        'node_modules',
        '.git',
        'dist',
        'page',
        '$RECYCLE.BIN',
        'Config.Msi',
        'vision',
    ])

    function hasDirectUnits(dir: string) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
                if (
                    entry.isDirectory() &&
                    /^\d{2}\..+\.unit$/.test(entry.name)
                ) {
                    return true
                }
            }
        } catch (e) {
            // Ignore read errors
        }
        return false
    }

    function findPivots(dir, results, depth = 0) {
        if (depth > 3) return // Limit depth to prevent freezes
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
                if (!entry.isDirectory()) continue
                if (IGNORE.has(entry.name)) continue

                const targetPath = path.join(dir, entry.name)

                if (/^\d{3}\./.test(entry.name)) {
                    if (hasDirectUnits(targetPath)) {
                        const relativePath = path.relative(
                            parentDir,
                            targetPath,
                        )
                        results.push(`[${relativePath.replace(/\\/g, '/')}]`)
                    }
                }

                findPivots(targetPath, results, depth + 1)
            }
        } catch (e) {
            // Ignore directory read errors
        }
    }

    try {
        const topLevelEntries = fs.readdirSync(parentDir, {
            withFileTypes: true,
        })

        for (const entry of topLevelEntries) {
            if (!entry.isDirectory()) continue
            if (IGNORE.has(entry.name)) continue

            const projectPath = path.join(parentDir, entry.name)

            if (/^\d{3}\./.test(entry.name) && hasDirectUnits(projectPath)) {
                const relativePath = path.relative(parentDir, projectPath)
                resultList.push(`[${relativePath.replace(/\\/g, '/')}]`)
            }

            findPivots(projectPath, resultList)
        }
    } catch (err) {
        console.error(`Error in listLibrary: ${err.message}`)
    }

    bal.slv({ libBit: { idx: 'list-library', lst: resultList, src: bal.idx } })
    return cpy
}

export const updateLibrary = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
) => {
    const fs = require('fs-extra')
    const doT = require('dot')
    const path = require('path')

    const capitalize = (s: string) =>
        s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s

    const isRepoRoot = (dir: string): boolean => {
        try {
            return (
                fs.existsSync(path.join(dir, 'apps')) &&
                fs.existsSync(path.join(dir, 'packages')) &&
                fs.existsSync(path.join(dir, 'package.json'))
            )
        } catch {
            return false
        }
    }

    try {
        // 1. Resolve repository root
        let repoRoot = process.cwd()
        while (repoRoot && !isRepoRoot(repoRoot)) {
            const parent = path.dirname(repoRoot)
            if (parent === repoRoot) break
            repoRoot = parent
        }

        if (!isRepoRoot(repoRoot)) {
            let dir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
            while (dir && dir !== path.dirname(dir)) {
                if (isRepoRoot(dir)) {
                    repoRoot = dir
                    break
                }
                dir = path.dirname(dir)
            }
        }

        // 2. Resolve clean target workspace
        const rawTarget = (bal?.src || 'apps/995.library/995.library')
            .replace(/[\[\]]/g, '')
            .trim()

        let targetDir = path.resolve(repoRoot, rawTarget)
        if (!fs.existsSync(targetDir)) {
            const candidatePkg = path.resolve(repoRoot, 'packages', rawTarget)
            const candidateApp = path.resolve(repoRoot, 'apps', rawTarget)
            if (fs.existsSync(candidatePkg)) {
                targetDir = candidatePkg
            } else if (fs.existsSync(candidateApp)) {
                targetDir = candidateApp
            } else {
                const errMsg = `Target directory not found: ${rawTarget}`
                if (ste) {
                    await ste.hunt(ActCns.UPDATE_CONSOLE, {
                        idx: 'cns00',
                        src: `>> [RE-WIRE ERROR] ${errMsg}`,
                    })
                }
                if (bal?.slv != null) {
                    bal.slv({
                        libBit: {
                            idx: 'update-library-err',
                            dat: errMsg,
                        },
                    })
                }
                return cpy
            }
        }

        const relativeDisplay = path.relative(repoRoot, targetDir).replace(/\\/g, '/')
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [UPDATE] Compiling manifest for: [${relativeDisplay}]`,
            })
        }

        // 3. Resolve template BEE.txt
        const templateCandidates = [
            path.resolve(repoRoot, 'apps/995.library/data/redux/BEE.txt'),
            path.resolve(process.cwd(), './data/redux/BEE.txt'),
            path.resolve(targetDir, 'BEE.txt'),
        ]

        let templatePath: string | null = null
        for (const candidate of templateCandidates) {
            if (fs.existsSync(candidate)) {
                templatePath = candidate
                break
            }
        }

        const defaultTemplate = [
            'import Model from "./99.core/interface/model.interface";',
            '',
            '{{=it.unitImports}}',
            '',
            '{{=it.faceImports}}',
            '',
            'export const list: Array< any > = {{=it.unitList}}',
            '',
            '{{=it.reduceImports}}',
            '',
            'export const reducer: any = {',
            ' {{=it.reduceList}}',
            '};',
            '',
            'export default class UnitData implements Model {',
            ' {{=it.modelList}}',
            '}',
        ].join('\n')

        const rawTemplate = templatePath
            ? fs.readFileSync(templatePath, 'utf8')
            : defaultTemplate

        // 4. Deterministic Unit Discovery
        const entries = fs.readdirSync(targetDir, { withFileTypes: true })
        const unitFolders = entries
            .filter(
                (entry: any) =>
                    entry.isDirectory() && /^\d{2}\..+\.unit$/.test(entry.name),
            )
            .map((entry: any) => entry.name)
            .sort((a: string, b: string) => a.localeCompare(b))

        if (unitFolders.length === 0) {
            const warningMsg = `No .unit packages detected in ${relativeDisplay}`
            if (ste) {
                await ste.hunt(ActCns.UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `>> [UPDATE] [WARN] ${warningMsg}`,
                })
            }
        }

        const items: Array<{
            unitName: string
            element: string
            unitImport: string
            faceImport: string
            modlImport: string
            redcImport: string
            reduced: string
            model: string
        }> = []

        for (const folder of unitFolders) {
            const parts = folder.split('.')
            const element = parts.slice(1, -1).join('.') || parts[1] || folder
            const unitName = capitalize(element)
            const faceTypeName =
                unitName === 'Model' ? 'ModelInterface' : unitName

            const unitImport = `import ${unitName}Unit from "./${folder}/${element}.unit";`
            const faceImport = `import ${faceTypeName} from "./${folder}/fce/${element}.interface";`
            const modlImport = `import { ${unitName}Model } from "./${folder}/${element}.model";`
            const redcImport = `import * as reduceFrom${unitName} from "./${folder}/${element}.reduce";`

            const reduced = `${element}: reduceFrom${unitName}.reducer,`
            const model = `${element}: ${faceTypeName} = new ${unitName}Model();`

            items.push({
                unitName,
                element,
                unitImport,
                faceImport,
                modlImport,
                redcImport,
                reduced,
                model,
            })
        }

        const gel = {
            unitImports: items.map((i) => i.unitImport).join('\n'),
            faceImports: items
                .map((i) => `${i.faceImport}\n${i.modlImport}`)
                .join('\n'),
            unitList: `[${items.map((i) => `${i.unitName}Unit`).join(', ')}];`,
            reduceImports: items.map((i) => i.redcImport).join('\n'),
            reduceList: items.map((i) => `    ${i.reduced}`).join('\n'),
            modelList: items.map((i) => `    ${i.model}`).join('\n'),
        }

        // 5. Template Interpolation
        const lines = rawTemplate.split('\n')
        const outputLines: string[] = []

        for (const line of lines) {
            if (line.trim().startsWith('//')) {
                outputLines.push(line)
                continue
            }
            try {
                const compiled = doT.template(line)(gel)
                outputLines.push(compiled)
            } catch {
                outputLines.push(line)
            }
        }

        const finalContent = outputLines.join('\n').replace(/\n{3,}/g, '\n\n')
        const targetBeePath = path.join(targetDir, 'BEE.ts')

        fs.writeFileSync(targetBeePath, finalContent, 'utf8')

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [UPDATE] [OK] Manifest written: ${path.relative(repoRoot, targetBeePath).replace(/\\/g, '/')}`,
            })
        }

        if (bal?.slv != null) {
            bal.slv({
                libBit: {
                    idx: 'update-library',
                    src: path.relative(repoRoot, targetBeePath).replace(/\\/g, '/'),
                    val: items.length,
                },
            })
        }
    } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [RE-WIRE ERROR] ${errorMsg}`,
            })
        }
        if (bal?.slv != null) {
            bal.slv({
                libBit: {
                    idx: 'update-library-err',
                    src: errorMsg,
                },
            })
        }
    }

    return cpy
}

export const progressLibrary = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
) => {
    /**
     * Synchronizes and overrides a remote directory with the contents of the local `apps/995.library`.
     *
     * This function is essential for propagating updates made to the central `995.library` out to
     * individual project workspaces. It acts as a one-way mirror operation.
     *
     * @param {LibraryModel} cpy - The current state model for the library unit.
     * @param {LibraryBit} bal - The payload object containing operational parameters.
     *                           - `bal.src` MUST specify the target remote directory path. It may contain brackets (e.g., `[../path]`) which will be stripped.
     *                           - `bal.slv` (Optional) The resolver callback to handle async responses.
     * @param {State} ste - The global state store for dispatching console updates via `ste.hunt`.
     *
     * @returns {LibraryModel} The original, unmodified state copy.
     *
     * @remarks
     * 1. **Destructive Action:** The target directory specified by `bal.src` is completely wiped (`fs.rm` with `force: true` and `recursive: true`) before copying.
     * 2. **Execution Flow:**
     *    - Validates `bal.src` is provided. If not, dispatches an error via `bal.slv`.
     *    - Cleans the target path string and resolves absolute paths.
     *    - Attempts to recursively remove the target directory if it exists.
     *    - Recursively copies the entire `apps/995.library` folder into the target location.
     * 3. **Console Output:** Dispatches `UPDATE_CONSOLE` events to `cns00` to track progress and report errors to the terminal UI.
     * 4. **Response:** Resolves with an `idx` of `'progress-library'` upon success or `'progress-library-error'` with the error message upon failure.
     */
    const fs = require('fs').promises
    const path = require('path')

    if (!bal.src) {
        if (bal.slv)
            bal.slv({
                libBit: {
                    idx: 'progress-library-error',
                    src: 'No src provided',
                },
            })
        return cpy
    }

    // Strip brackets that might be present from list commands (e.g., `[../remote/path]`)
    const cleanSrc = bal.src.replace(/[\[\]]/g, '')

    const targetDir = path.resolve(process.cwd(), cleanSrc)
    const sourceDir = path.resolve(process.cwd(), 'apps', '995.library')

    await ste.hunt(ActCns.UPDATE_CONSOLE, {
        idx: 'cns00',
        src: 'Starting to progress library to ' + targetDir,
    })

    try {
        try {
            await fs.access(targetDir)
            await fs.rm(targetDir, { recursive: true, force: true })
        } catch (e) {
            // directory does not exist, which is fine
        }

        await fs.cp(sourceDir, targetDir, { recursive: true })

        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: 'Library copied to ' + targetDir,
        })

        if (bal.slv)
            bal.slv({ libBit: { idx: 'progress-library', src: bal.src } })
    } catch (err) {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: 'Error progressing library: ' + err.message,
        })

        if (bal.slv)
            bal.slv({
                libBit: { idx: 'progress-library-error', src: err.message },
            })
    }

    return cpy
}

export const scanLibrary = (cpy: LibraryModel, bal: LibraryBit, ste: State) => {
    /**
     * Scans sibling directories to find other workspaces containing an `apps/995.library` folder.
     *
     * It moves up one level from the current repository root and inspects all adjacent directories.
     * If a sibling repository contains an `apps/995.library` path, its relative path (from the current
     * process root) is added to the results list. This list can then be used to synchronize or
     * "progress" the library across different projects.
     */
    const fs = require('fs')
    const path = require('path')

    const resultList: string[] = []
    const parentDir = path.resolve(process.cwd(), '..')

    try {
        const entries = fs.readdirSync(parentDir, { withFileTypes: true })

        for (const entry of entries) {
            if (!entry.isDirectory()) continue

            const itemPath = path.join(parentDir, entry.name)

            // Skip the current repo
            if (itemPath === process.cwd()) continue

            const libraryDir = path.join(itemPath, 'apps', '995.library')
            if (fs.existsSync(libraryDir)) {
                const relativePath = path.relative(process.cwd(), libraryDir)
                resultList.push(`[${relativePath.replace(/\\/g, '/')}]`)
            }
        }
    } catch (err: any) {
        console.error(`Error in scanLibrary: ${err.message}`)
    }

    if (bal.slv) bal.slv({ libBit: { idx: 'scan-library', lst: resultList } })

    return cpy
}

var patch = (ste, type, bale) => ste.dispatch({ type, bale })

export const launchLibrary = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
) => {
    const fs = require('fs')
    const path = require('path')
    const { exec } = require('child_process')

    const filePath = path.resolve(process.cwd(), 'data/launch.txt')

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const urls = fileContent
            .split('\n')
            .map((url: string) => url.trim())
            .filter((url: string) => url.length > 0)

        for (const url of urls) {
            let command
            switch (process.platform) {
                case 'darwin':
                    command = `open "${url}"`
                    break
                case 'win32':
                    command = `start "" "${url}"`
                    break
                default:
                    command = `xdg-open "${url}"`
                    break
            }

            exec(command, (error: any) => {
                if (error) {
                    console.error(`Error opening url: ${url}`, error)
                }
            })

            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    } else {
        console.error('launch.txt not found at data/launch.txt')
    }

    if (bal.slv != null) bal.slv({ libBit: { idx: 'launch-library' } })

    return cpy
}

export const flatLibrary = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
) => {
    const fs = require('fs-extra')
    const path = require('path')

    // Resolve repository root directory
    const isRepoRoot = (dir: string) => {
        try {
            return (
                fs.existsSync(path.join(dir, 'apps')) &&
                fs.existsSync(path.join(dir, 'packages')) &&
                fs.existsSync(path.join(dir, 'package.json'))
            )
        } catch {
            return false
        }
    }

    let repoRoot = process.cwd()
    while (repoRoot && !isRepoRoot(repoRoot)) {
        const parent = path.dirname(repoRoot)
        if (parent === repoRoot) break
        repoRoot = parent
    }

    if (!isRepoRoot(repoRoot)) {
        let dir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
        while (dir) {
            if (isRepoRoot(dir)) {
                repoRoot = dir
                break
            }
            const parent = path.dirname(dir)
            if (parent === dir) break
            dir = parent
        }
    }

    const timestamp = Date.now()
    const outputDir = path.join(repoRoot, 'data', 'flat')
    const outputFile = path.join(outputDir, `${timestamp}.txt`)

    if (ste)
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: 'Starting Flat Library...',
        })

    const IGNORED_DIRS = new Set([
        'node_modules',
        'dist',
        'data',
        '.git',
        '.wrangler',
    ])
    const CODE_EXTS = new Set([
        '.ts',
        '.tsx',
        '.js',
        '.cjs',
        '.mjs',
        '.jsonc',
        '.toml',
        '.yml',
        '.yaml',
    ])
    const ALLOWED_FILES = new Set([
        '.gitignore',
        'package.json',
        'AGENTS.md',
        'AGENT_INSTRUCTIONS.md',
    ])

    async function getFilePaths(dir: string): Promise<string[]> {
        let entries
        try {
            entries = await fs.readdir(dir, { withFileTypes: true })
        } catch {
            return []
        }

        const filePaths: string[] = []
        for (const entry of entries) {
            if (entry.isDirectory()) {
                // Skip ignored directories, but allow any directory named "schema"
                if (IGNORED_DIRS.has(entry.name) && entry.name !== 'schema') {
                    continue
                }
                const subFiles = await getFilePaths(path.join(dir, entry.name))
                filePaths.push(...subFiles)
            } else if (entry.isFile()) {
                // Exclude README.md
                if (entry.name.toLowerCase() === 'readme.md') {
                    continue
                }
                filePaths.push(path.join(dir, entry.name))
            }
        }

        return filePaths
    }

    try {
        const targetRoots = ['apps', 'packages', '.github', '.'].map((folder) =>
            path.join(repoRoot, folder),
        )
        const allScannedFiles: string[] = []

        for (const targetRoot of targetRoots) {
            if (!fs.existsSync(targetRoot)) continue

            if (targetRoot === repoRoot) {
                // Special case for root to avoid scanning everything again
                const subEntries = await fs.readdir(targetRoot, {
                    withFileTypes: true,
                })
                for (const entry of subEntries) {
                    if (entry.isFile()) {
                        allScannedFiles.push(path.join(targetRoot, entry.name))
                    }
                }
            } else if (path.basename(targetRoot) === '.github') {
                // Specifically scan .github
                const files = await getFilePaths(targetRoot)
                allScannedFiles.push(...files)
            } else {
                const subEntries = await fs.readdir(targetRoot, {
                    withFileTypes: true,
                })
                for (const entry of subEntries) {
                    if (!entry.isDirectory()) continue
                    if (IGNORED_DIRS.has(entry.name) && entry.name !== 'schema')
                        continue
                    const subDir = path.join(targetRoot, entry.name)
                    const files = await getFilePaths(subDir)
                    allScannedFiles.push(...files)
                }
            }
        }

        // Filter for code files
        const codeFiles = allScannedFiles.filter((file) => {
            const ext = path.extname(file)
            const filename = path.basename(file)

            const isAllowedFile =
                ALLOWED_FILES.has(filename) || filename.startsWith('tsconfig')

            if (!CODE_EXTS.has(ext) && !isAllowedFile) return false
            // If it's a JS file and a corresponding TS file exists in the same folder, skip the compiled duplicate
            if (ext === '.js') {
                const tsSibling = file.slice(0, -3) + '.ts'
                if (fs.existsSync(tsSibling)) return false
            }
            return true
        })

        // Sort files deterministically
        codeFiles.sort((a, b) => a.localeCompare(b))

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `Found ${codeFiles.length} code files to flatten.`,
            })
        }

        // Read content of all files
        const fileContents = await Promise.all(
            codeFiles.map(async (file) => {
                const content = await fs.readFile(file, 'utf8')
                const relativePath = path
                    .relative(repoRoot, file)
                    .replace(/\\/g, '/')
                return `// ----- SOURCE: ${relativePath} -----\n${content}`
            }),
        )

        const combinedData = fileContents.join('\n\n')

        await fs.outputFile(outputFile, combinedData)

        const relOutput = path
            .relative(repoRoot, outputFile)
            .replace(/\\/g, '/')
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `Wrote flattened library to: ${relOutput}`,
            })
        }

        if (bal && bal.slv != null) {
            bal.slv({
                libBit: {
                    idx: 'flat-library',
                    src: relOutput,
                    val: codeFiles.length,
                },
            })
        }
    } catch (err: any) {
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `Error flattening library: ${err.message}`,
            })
        }
        if (bal && bal.slv != null) {
            bal.slv({ libBit: { idx: 'flat-library-error', src: err.message } })
        }
    }

    return cpy
}

/**
 * Resolves the master workspace root (FLEET_ROOT) across multi-tenant organizations.
 * Evaluates explicit environment overrides, sentinel lockfiles, and organization markers
 * while defending against CI runner traps and filesystem escape loops.
 */
export const resolveFleetRoot = (
    startDir: string = process.cwd(),
): string | null => {
    const fs = require('fs-extra')
    const path = require('path')

    // 1. Primary: Explicit environment variables
    if (process.env.FLEET_ROOT) {
        const candidate = path.resolve(process.cwd(), process.env.FLEET_ROOT)
        try {
            if (
                fs.existsSync(candidate) &&
                fs.statSync(candidate).isDirectory()
            ) {
                return candidate
            }
        } catch {
            // Ignore access errors on invalid env paths
        }
    }

    if (process.env.WORK_DIR) {
        const candidate = path.resolve(process.cwd(), process.env.WORK_DIR)
        try {
            if (
                fs.existsSync(candidate) &&
                fs.statSync(candidate).isDirectory()
            ) {
                return candidate
            }
        } catch {
            // Ignore access errors on invalid env paths
        }
    }

    // 2. Secondary: Upward sentinel and organizational crawl
    let current = path.resolve(startDir)
    const root = path.parse(current).root

    while (current && current !== root) {
        // CI Runner Guard: bypass /home/runner/work without sentinels
        const normalizedCurrent = current
            .replace(/^[a-zA-Z]:/, '')
            .replace(/\\/g, '/')
        const isCiRunnerPath =
            current === '/home/runner/work' ||
            path.dirname(current) === '/home/runner' ||
            normalizedCurrent === '/home/runner/work' ||
            normalizedCurrent === '/home/runner' ||
            normalizedCurrent.startsWith('/home/runner/')

        if (!isCiRunnerPath) {
            // Check for Cauldron Sentinel Anchor
            const cauldronAnchor = path.join(
                current,
                'camp-candor-cauldron',
                'versions.json',
            )
            if (fs.existsSync(cauldronAnchor)) {
                return current
            }

            const directAnchor = path.join(current, 'versions.json')
            if (
                fs.existsSync(directAnchor) &&
                path.basename(current) === 'camp-candor-cauldron'
            ) {
                return path.resolve(current, '..')
            }

            // Check for multi-tenant organization markers or thematic clusters
            const hasOrgClusters =
                fs.existsSync(path.join(current, 'campc-it-com')) ||
                fs.existsSync(path.join(current, 'cauldron-it-com')) ||
                fs.existsSync(path.join(current, 'astro-kahn-it-com')) ||
                fs.existsSync(path.join(current, 'slopratchet.com')) ||
                (fs.existsSync(path.join(current, '00.governance')) &&
                    fs.existsSync(path.join(current, '01.canon')))

            if (hasOrgClusters) {
                return current
            }

            // Generic 'work' workspace directory name match
            if (
                path.basename(current).toLowerCase() === 'work' ||
                path.basename(current).toLowerCase() === 'cauldron-it-com'
            ) {
                return current
            }
        }

        const parent = path.dirname(current)
        if (parent === current) break
        current = parent
    }

    return null
}

export const scanFleet = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
) => {
    const fs = require('fs-extra')
    const path = require('path')
    const ActCns = require('../../83.console.unit/console.action')

    const fleetRoot = resolveFleetRoot()

    if (!fleetRoot) {
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: '>> [SCAN_FLEET_ERR] Unable to resolve fleet root boundary.',
            })
        }
        if (bal && bal.slv != null) {
            bal.slv({
                libBit: {
                    idx: 'scan-fleet-error',
                    src: 'NO_FLEET_ROOT',
                    lst: [],
                    val: -1,
                },
            })
        }
        return cpy
    }

    if (ste) {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [SCAN_FLEET] Initiating fleet scan from root: ${fleetRoot}`,
        })
    }

    const IGNORED = new Set([
        'node_modules',
        '.git',
        'dist',
        '.wrangler',
        '$RECYCLE.BIN',
        'Config.Msi',
        'coverage',
        '.nyc_output',
        '.idea',
        '.vscode',
    ])

    const reposToCheck = new Set<string>()

    const isRepo = (dir: string): boolean => {
        try {
            return (
                fs.existsSync(path.join(dir, 'package.json')) ||
                fs.existsSync(path.join(dir, 'apps')) ||
                fs.existsSync(path.join(dir, 'packages'))
            )
        } catch {
            return false
        }
    }

    try {
        const topEntries = fs.readdirSync(fleetRoot, { withFileTypes: true })

        for (const entry of topEntries) {
            if (!entry.isDirectory()) continue
            if (IGNORED.has(entry.name)) continue

            const entryPath = path.join(fleetRoot, entry.name)

            // 1. Direct repository under fleetRoot
            if (isRepo(entryPath)) {
                reposToCheck.add(entryPath)
            }

            // 2. Multi-tenant organizational cluster subdirectories
            try {
                const subEntries = fs.readdirSync(entryPath, {
                    withFileTypes: true,
                })
                for (const sub of subEntries) {
                    if (!sub.isDirectory()) continue
                    if (IGNORED.has(sub.name)) continue

                    const subPath = path.join(entryPath, sub.name)
                    if (isRepo(subPath)) {
                        reposToCheck.add(subPath)
                    }
                }
            } catch {
                // Ignore unreadable subfolders
            }
        }

        const fleetMap: string[] = []
        const targetPivot =
            bal && bal.src ? bal.src.replace(/[\[\]]/g, '').trim() : null

        for (const repoPath of reposToCheck) {
            if (targetPivot) {
                const pkgTarget = path.join(repoPath, 'packages', targetPivot)
                const appTarget = path.join(repoPath, 'apps', targetPivot)

                if (fs.existsSync(pkgTarget)) {
                    const rel = path
                        .relative(fleetRoot, pkgTarget)
                        .replace(/\\/g, '/')
                    fleetMap.push(`[${rel}]`)
                } else if (fs.existsSync(appTarget)) {
                    const rel = path
                        .relative(fleetRoot, appTarget)
                        .replace(/\\/g, '/')
                    fleetMap.push(`[${rel}]`)
                }
            } else {
                // Default: Discover all repositories housing apps/995.library harness
                const harnessTarget = path.join(repoPath, 'apps', '995.library')
                if (fs.existsSync(harnessTarget)) {
                    const rel = path
                        .relative(fleetRoot, harnessTarget)
                        .replace(/\\/g, '/')
                    fleetMap.push(`[${rel}]`)
                }
            }
        }

        fleetMap.sort((a, b) => a.localeCompare(b))

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [SCAN_FLEET_OK] Discovered ${fleetMap.length} targets across fleet.`,
            })
        }

        if (bal && bal.slv != null) {
            bal.slv({
                libBit: {
                    idx: 'scan-fleet',
                    lst: fleetMap,
                    val: fleetMap.length,
                    src: fleetRoot,
                },
            })
        }
    } catch (err: any) {
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [SCAN_FLEET_ERR] Scan failure: ${err.message}`,
            })
        }
        if (bal && bal.slv != null) {
            bal.slv({
                libBit: {
                    idx: 'scan-fleet-error',
                    src: err.message,
                    lst: [],
                    val: -1,
                },
            })
        }
    }

    return cpy
}


