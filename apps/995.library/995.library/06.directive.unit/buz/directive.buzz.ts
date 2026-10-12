import * as ActCns from '../../83.console.unit/console.action'
import type { DirectiveModel } from '../directive.model'
import type DirectiveBit from '../fce/directive.bit'
import type State from '../../99.core/state'

const isRepoRoot = (dir: string): boolean => {
    const fs = require('fs')
    const path = require('path')
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

const findRepoRoot = (startDir: string = process.cwd()): string => {
    const path = require('path')
    let curr = path.resolve(startDir)
    while (curr && curr !== path.dirname(curr)) {
        if (isRepoRoot(curr)) return curr
        curr = path.dirname(curr)
    }
    return process.cwd()
}

export const initDirective = (cpy: DirectiveModel, _bal: DirectiveBit, _ste: State) => {
    return cpy
}

export const updateDirective = (cpy: DirectiveModel, _bal: DirectiveBit, _ste: State) => {
    return cpy
}

export const createDirective = async (
    cpy: DirectiveModel,
    bal: DirectiveBit,
    ste: State,
) => {
    if (ste) {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> Executing createDirective stub',
        })
    }
    if (bal && bal.slv != null) {
        bal.slv({ drtBit: { idx: 'create-directive-stub' } })
    }
    return cpy
}

export const dayDirective = async (
    cpy: DirectiveModel,
    bal: DirectiveBit,
    ste: State,
): Promise<DirectiveModel> => {
    const fs = require('fs-extra')
    const path = require('path')

    const repoRoot = findRepoRoot()
    const directiveRootDir = path.join(repoRoot, 'data', 'directive')

    try {
        await fs.ensureDir(directiveRootDir)

        // 1. Scan existing day folders to determine the next sequential index
        const entries = await fs.readdir(directiveRootDir, { withFileTypes: true })
        let maxIndex = -1

        for (const entry of entries) {
            if (!entry.isDirectory()) continue
            const match = entry.name.match(/^day-(\d+)$/i)
            if (match) {
                const num = parseInt(match[1], 10)
                if (num > maxIndex) {
                    maxIndex = num
                }
            }
        }

        const nextIndex = maxIndex + 1
        const daySlug = `day-${String(nextIndex).padStart(3, '0')}`
        const targetDayDir = path.join(directiveRootDir, daySlug)

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [DIRECTIVE] Provisioning shift ${daySlug}...`,
            })
        }

        await fs.ensureDir(targetDayDir)

        // 2. Provision template files
        const templateFiles = [
            '000.focus.cpn',
            '000.xxxx.jules',
            '000.xxxxx.ag-test',
            '000.xxxxx.gravity',
        ]

        for (const filename of templateFiles) {
            const destPath = path.join(targetDayDir, filename)
            await fs.writeFile(destPath, '', 'utf8')
            if (ste) {
                await ste.hunt(ActCns.UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `>> [OK] writing data/directive/${daySlug}/${filename}`,
                })
            }
        }

        const relOutput = path.relative(repoRoot, targetDayDir).replace(/\\/g, '/')

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [OK] Successfully created directive shift: ${relOutput}`,
            })
        }

        if (bal && bal.slv != null) {
            bal.slv({
                drtBit: {
                    idx: 'day-directive',
                    src: relOutput,
                    val: nextIndex,
                    dat: {
                        dayFolder: daySlug,
                        files: templateFiles,
                    },
                },
                dayBit: {
                    idx: daySlug,
                },
            })
        }
    } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `:: [FAIL] Error in dayDirective: ${errorMsg}`,
            })
        }
        if (bal && bal.slv != null) {
            bal.slv({
                drtBit: {
                    idx: 'day-directive-error',
                    src: errorMsg,
                },
            })
        }
    }

    return cpy
}
