import * as ActCns from '../../83.console.unit/console.action'
import type { PackageModel } from '../package.model'
import type PackageBit from '../fce/package.bit'
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
    return startDir
}

export const initPackage = (cpy: PackageModel, _bal: PackageBit, _ste: State) => {
    return cpy
}

export const updatePackage = (cpy: PackageModel, _bal: PackageBit, _ste: State) => {
    return cpy
}

export const createPackage = async (
    cpy: PackageModel,
    bal: PackageBit,
    ste: State,
): Promise<PackageModel> => {
    const fs = require('fs-extra')
    const path = require('path')

    const repoRoot = findRepoRoot()
    const rawNom = (bal?.idx || 'sample').trim()

    // 1. Resolve template directory (packages/103.factory)
    const templateCandidates = [
        path.join(repoRoot, 'packages', '103.factory'),
        path.resolve(process.cwd(), 'packages', '103.factory'),
    ]

    const templateDir = templateCandidates.find((d) => fs.existsSync(d))
    if (!templateDir) {
        const errMsg = 'Template exemplar packages/103.factory not found'
        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `:: [FAIL] ${errMsg}`,
            })
        }
        if (bal?.slv != null) {
            bal.slv({ pkgBit: { idx: 'create-package-error', src: errMsg } })
        }
        return cpy
    }

    // 2. Parse target prefix and domain identifier
    let num = '000'
    let nom = rawNom.toLowerCase()

    if (/^\d{3}\./.test(rawNom)) {
        const parts = rawNom.split('.')
        num = parts[0]
        nom = parts.slice(1).join('.').toLowerCase()
    } else if (/^\d{2}\./.test(rawNom)) {
        const parts = rawNom.split('.')
        num = `0${parts[0]}`
        nom = parts.slice(1).join('.').toLowerCase()
    }

    const packageFolder = `${num}.${nom}`
    const targetPackageDir = path.join(repoRoot, 'data', 'package', packageFolder)

    const capitalize = (s: string) => (s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s)
    const nomTitle = capitalize(nom)
    const nomUpper = nom.toUpperCase()

    if (ste) {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [SCAFFOLD] Provisioning package [${packageFolder}] into: data/package/`,
        })
    }

    // 3. Scan exemplar files recursively
    async function getTemplateFiles(dir: string): Promise<string[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        let files: string[] = []
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name === 'dist') continue
                files = files.concat(await getTemplateFiles(fullPath))
            } else if (entry.isFile()) {
                files.push(fullPath)
            }
        }
        return files
    }

    const templateFiles = await getTemplateFiles(templateDir)

    // 4. Output rewritten package files
    for (const filePath of templateFiles) {
        const relPath = path.relative(templateDir, filePath)

        const destRelPath = relPath
            .replace(/103\.factory/g, `${num}.${nom}`)
            .replace(/103/g, num)
            .replace(/factory/g, nom)
            .replace(/Factory/g, nomTitle)
            .replace(/FACTORY/g, nomUpper)

        const destFile = path.join(targetPackageDir, destRelPath)
        let content = await fs.readFile(filePath, 'utf8')

        content = content
            .replace(/103\.factory/g, `${num}.${nom}`)
            .replace(/103/g, num)
            .replace(/factory/g, nom)
            .replace(/Factory/g, nomTitle)
            .replace(/FACTORY/g, nomUpper)

        await fs.outputFile(destFile, content, 'utf8')

        if (ste) {
            await ste.hunt(ActCns.UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [OK] writing data/package/${packageFolder}/${destRelPath.replace(/\\/g, '/')}`,
            })
        }
    }

    const relativeResult = path.relative(repoRoot, targetPackageDir).replace(/\\/g, '/')

    if (ste) {
        await ste.hunt(ActCns.UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [OK] Package created: ${relativeResult}`,
        })
    }

    if (bal?.slv != null) {
        bal.slv({
            pkgBit: {
                idx: 'create-package',
                src: relativeResult,
                dat: { idx: nom, path: targetPackageDir },
            },
        })
    }

    return cpy
}
