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

const PHASE_WORDS: Record<number, string> = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
    11: 'eleven',
    12: 'twelve',
    13: 'thirteen',
    14: 'fourteen',
    15: 'fifteen',
    16: 'sixteen',
    17: 'seventeen',
    18: 'eighteen',
    19: 'nineteen',
    20: 'twenty',
}

const getPhaseWord = (num: number): string => PHASE_WORDS[num] || String(num)
const pad3 = (num: number): string => String(num).padStart(3, '0')

export const createDirective = async (
    cpy: DirectiveModel,
    bal: DirectiveBit,
    ste: State,
): Promise<DirectiveModel> => {
    const fs = require('fs-extra')
    const path = require('path')

    let repoRoot = process.cwd()
    while (
        repoRoot &&
        !(
            fs.existsSync(path.join(repoRoot, 'apps')) &&
            fs.existsSync(path.join(repoRoot, 'packages')) &&
            fs.existsSync(path.join(repoRoot, 'package.json'))
        )
    ) {
        const parent = path.dirname(repoRoot)
        if (parent === repoRoot) {
            repoRoot = process.cwd()
            break
        }
        repoRoot = parent
    }
    const targetDay = (bal?.src || 'day-000').replace(/[[\]]/g, '').trim()
    const rawLabel = (bal?.idx || 'focus').trim()
    const phaseCount = typeof bal?.val === 'number' && bal.val > 0 ? bal.val : 1

    const targetDayDir = path.join(repoRoot, 'data', 'directive', targetDay)
    const templateDayDir = path.join(repoRoot, 'data', 'directive', 'day-000')

    try {
        await fs.ensureDir(targetDayDir)

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [DIRECTIVE] Scaffolding stack in ${targetDay} (${phaseCount} phases)...`,
            })
        }

        // 1. Calculate the next monotonic sequential index prefix
        const existingEntries = await fs.readdir(targetDayDir)
        let maxPrefix = -1

        for (const entry of existingEntries) {
            const match = entry.match(/^(\d{3})\./)
            if (match) {
                const num = parseInt(match[1], 10)
                if (num > maxPrefix) {
                    maxPrefix = num
                }
            }
        }

        let currentSeq = maxPrefix + 1
        const createdFiles: string[] = []

        // Helper to resolve template content with fallback extensions
        const readTemplateContent = async (baseNames: string[]): Promise<string> => {
            const searchDirs = [templateDayDir, targetDayDir]
            for (const dir of searchDirs) {
                for (const baseName of baseNames) {
                    const candidate = path.join(dir, baseName)
                    if (await fs.pathExists(candidate)) {
                        return await fs.readFile(candidate, 'utf8')
                    }
                }
            }
            return ''
        }

        // 2. Provision the focus divider (.cpn)
        const focusTemplateContent = await readTemplateContent([
            '000.focus.cpn',
            'focus.cpn',
        ])

        const dividerFileName = `${pad3(currentSeq)}.${rawLabel}.cpn`
        const dividerFilePath = path.join(targetDayDir, dividerFileName)
        await fs.writeFile(dividerFilePath, focusTemplateContent, 'utf8')
        createdFiles.push(dividerFileName)

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [OK] writing data/directive/${targetDay}/${dividerFileName}`,
            })
        }

        // 3. Read base templates for Jules and Gravity/AG-Test pairs
        const julesTemplateContent = await readTemplateContent([
            '000.xxxx.jules.md',
            '000.xxxx.jules',
            '000.jules.md',
        ])

        const gravityTemplateContent = await readTemplateContent([
            '000.xxxxx.gravity.md',
            '000.xxxxx.gravity',
            '000.xxxxx.ag-test.md',
            '000.xxxxx.ag-test',
        ])

        // Determine secondary check suffix (gravity.md vs ag-test.md)
        let checkExt = 'gravity.md'
        if (
            (await fs.pathExists(path.join(templateDayDir, '000.xxxxx.ag-test.md'))) &&
            !(await fs.pathExists(path.join(templateDayDir, '000.xxxxx.gravity.md')))
        ) {
            checkExt = 'ag-test.md'
        }

        // 4. Provision sequential phase pairs
        for (let p = 1; p <= phaseCount; p++) {
            const phaseWord = getPhaseWord(p)

            // 4a. Jules Phase Directive
            currentSeq++
            const julesFileName = `${pad3(currentSeq)}.phase-${phaseWord}.jules.md`
            const julesFilePath = path.join(targetDayDir, julesFileName)
            await fs.writeFile(julesFilePath, julesTemplateContent, 'utf8')
            createdFiles.push(julesFileName)

            if (ste) {
                await ste.hunt(ActCns.UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `>> [OK] writing data/directive/${targetDay}/${julesFileName}`,
                })
            }

            // 4b. Gravity / AG-Test Verification Directive
            currentSeq++
            const gravityFileName = `${pad3(currentSeq)}.phase-${phaseWord}.${checkExt}`
            const gravityFilePath = path.join(targetDayDir, gravityFileName)
            await fs.writeFile(gravityFilePath, gravityTemplateContent, 'utf8')
            createdFiles.push(gravityFileName)

            if (ste) {
                await ste.hunt(ActCns.UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `>> [OK] writing data/directive/${targetDay}/${gravityFileName}`,
                })
            }
        }

        const relOutput = path.relative(repoRoot, targetDayDir).replace(/\\/g, '/')

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [OK] Directive stack created in ${relOutput} (${createdFiles.length} files).`,
            })
        }

        if (bal && bal.slv != null) {
            bal.slv({
                drtBit: {
                    idx: 'create-directive',
                    src: relOutput,
                    val: createdFiles.length,
                    dat: {
                        targetDay,
                        label: rawLabel,
                        files: createdFiles,
                    },
                },
            })
        }
    } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `:: [FAIL] Error in createDirective: ${errorMsg}`,
            })
        }
        if (bal && bal.slv != null) {
            bal.slv({
                drtBit: {
                    idx: 'create-directive-error',
                    src: errorMsg,
                },
            })
        }
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

    let repoRoot = process.cwd()
    while (
        repoRoot &&
        !(
            fs.existsSync(path.join(repoRoot, 'apps')) &&
            fs.existsSync(path.join(repoRoot, 'packages')) &&
            fs.existsSync(path.join(repoRoot, 'package.json'))
        )
    ) {
        const parent = path.dirname(repoRoot)
        if (parent === repoRoot) {
            repoRoot = process.cwd()
            break
        }
        repoRoot = parent
    }
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
