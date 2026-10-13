import type { VersionsManifest, PinnedRepoConfig } from '../fce/versions.interface'
import type {
    ConflictManifestAnalysis,
    RepoConflictDiff,
    ScratchpadMetadata,
} from '../fce/conflict.interface'
import type { LibraryModel } from '../library.model'
import type LibraryBit from '../fce/library.bit'
import type State from '../../99.core/state'
import * as ActCns from '../../83.console.unit/console.action'
import path from 'path'
import fs from 'fs-extra'

/**
 * Compares local and remote manifests to detect divergent repository pins.
 */
export const analyzeManifestDivergence = (
    local: VersionsManifest,
    remote: VersionsManifest,
): ConflictManifestAnalysis => {
    const conflicts: Record<string, RepoConflictDiff> = {}
    const localRepos = local.repositories || {}
    const remoteRepos = remote.repositories || {}

    const allKeys = new Set([...Object.keys(localRepos), ...Object.keys(remoteRepos)])
    let conflictCount = 0

    for (const key of allKeys) {
        const loc = localRepos[key]
        const rem = remoteRepos[key]
        const diffFields: string[] = []

        if (!loc || !rem) {
            diffFields.push(loc ? 'REMOTE_MISSING' : 'LOCAL_MISSING')
        } else {
            if (loc.pinned_sha !== rem.pinned_sha) diffFields.push('pinned_sha')
            if (loc.required_contract_version !== rem.required_contract_version) {
                diffFields.push('required_contract_version')
            }
            if (loc.expected_branch !== rem.expected_branch) diffFields.push('expected_branch')
            if (loc.status !== rem.status) diffFields.push('status')
        }

        const hasConflict = diffFields.length > 0
        if (hasConflict) conflictCount++

        conflicts[key] = {
            repoKey: key,
            hasConflict,
            localConfig: loc,
            remoteConfig: rem,
            diffFields,
        }
    }

    return {
        hasDivergence: conflictCount > 0,
        conflictCount,
        conflicts,
        localManifest: local,
        remoteManifest: remote,
    }
}

/**
 * Synthesizes a human-navigable JSON document with C-style merge conflict markers.
 */
export const synthesizeConflictScratchpad = (
    analysis: ConflictManifestAnalysis,
): string => {
    const base = analysis.localManifest
    const lines: string[] = []

    lines.push('{')
    lines.push(`  "$schema": "${base.$schema || 'https://camp-candor.org/schemas/versions.v1.json'}",`)
    lines.push(`  "schema_version": ${base.schema_version || 1},`)
    lines.push(`  "library_version": "${base.library_version || '1.0.12'}",`)
    lines.push(`  "updated_at": "${new Date().toISOString()}",`)
    lines.push(`  "sovereign_repo": "${base.sovereign_repo || 'camp-candor/995.library'}",`)
    lines.push(`  "allow_periphery_broadcast": ${base.allow_periphery_broadcast ?? false},`)
    lines.push('  "shared_pivots": ' + JSON.stringify(base.shared_pivots || {}, null, 4).replace(/\n/g, '\n  ') + ',')
    lines.push('  "repositories": {')

    const repoKeys = Object.keys(analysis.conflicts).sort()
    repoKeys.forEach((key, index) => {
        const item = analysis.conflicts[key]
        const isLast = index === repoKeys.length - 1
        const comma = isLast ? '' : ','

        if (!item.hasConflict && item.localConfig) {
            lines.push(`    "${key}": ${JSON.stringify(item.localConfig, null, 6).replace(/\n/g, '\n    ')}${comma}`)
        } else {
            const loc = item.localConfig
            const rem = item.remoteConfig
            const locSha = loc?.pinned_sha ? loc.pinned_sha.slice(0, 10) : 'none'
            const remSha = rem?.pinned_sha ? rem.pinned_sha.slice(0, 10) : 'none'

            lines.push(`    "${key}": {`)
            lines.push(`      "path": "${loc?.path || rem?.path || key}",`)
            lines.push(`      "cluster": "${loc?.cluster || rem?.cluster || 'common'}",`)
            lines.push(`      /* <<<<<<< LOCAL WORKSPACE PIN: ${locSha} */`)
            lines.push(`      "pinned_sha": "${loc?.pinned_sha || ''}",`)
            lines.push(`      "required_contract_version": "${loc?.required_contract_version || '1.0.12'}",`)
            lines.push(`      "expected_branch": "${loc?.expected_branch || 'main'}",`)
            lines.push(`      "status": "${loc?.status || 'LOCKED'}"`)
            lines.push(`      /* ======= REMOTE SOVEREIGN PIN: ${remSha} */`)
            lines.push(`      // "pinned_sha": "${rem?.pinned_sha || ''}",`)
            lines.push(`      // "required_contract_version": "${rem?.required_contract_version || '1.0.12'}",`)
            lines.push(`      // "expected_branch": "${rem?.expected_branch || 'main'}",`)
            lines.push(`      // "status": "${rem?.status || 'LOCKED'}"`)
            lines.push(`      /* >>>>>>> */`)
            lines.push(`    }${comma}`)
        }
    })

    lines.push('  }')
    lines.push('}')

    return lines.join('\n')
}

/**
 * Dispatches staging of a conflict scratchpad to an isolated file path.
 */
export const stageLockfileConflict = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
): Promise<LibraryModel> => {
    const emit = async (src: string) => {
        if (ste && typeof ste.hunt === 'function') {
            await ste.hunt(ActCns.UPDATE_CONSOLE, { idx: 'cns00', src }).catch(() => {})
        }
    }

    try {
        const dat = bal?.dat as any
        if (!dat || !dat.localManifest || !dat.remoteManifest) {
            throw new Error('Both localManifest and remoteManifest are required in bal.dat')
        }

        const localManifest: VersionsManifest = dat.localManifest
        const remoteManifest: VersionsManifest = dat.remoteManifest
        const canonicalPath = bal?.src || path.resolve(process.cwd(), 'data', 'versions.json')

        await emit('>> [LOCKFILE_STAGE] Analyzing manifest divergence...')
        const analysis = analyzeManifestDivergence(localManifest, remoteManifest)

        if (!analysis.hasDivergence) {
            await emit('>> [LOCKFILE_STAGE] [OK] No conflict detected between manifests.')
            if (bal?.slv) {
                bal.slv({
                    libBit: {
                        idx: 'stage-lockfile-clean',
                        val: 0,
                        src: canonicalPath,
                    },
                })
            }
            return cpy
        }

        const nonce = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const targetDir = path.resolve(process.cwd(), 'data', 'lockfile')
        await fs.ensureDir(targetDir)

        const scratchpadPath = path.join(targetDir, `.tmp_versions_conflict_${nonce}.json`)
        const content = synthesizeConflictScratchpad(analysis)

        // Write to temporary buffer; canonical path is guaranteed untouched
        await fs.writeFile(scratchpadPath, content, 'utf8')

        const metadata: ScratchpadMetadata = {
            scratchpadPath,
            canonicalPath,
            nonce,
            timestamp: new Date().toISOString(),
            conflictCount: analysis.conflictCount,
            conflicts: Object.keys(analysis.conflicts).filter(
                (k) => analysis.conflicts[k].hasConflict,
            ),
        }

        await emit(`>> [LOCKFILE_STAGE] [OK] Staged ${analysis.conflictCount} conflict(s) to ${path.basename(scratchpadPath)}`)

        if (bal?.slv) {
            bal.slv({
                libBit: {
                    idx: 'stage-lockfile-conflict',
                    src: scratchpadPath,
                    val: analysis.conflictCount,
                    dat: metadata,
                },
            })
        }
    } catch (err: any) {
        await emit(`:: [FAIL] Stage conflict error: ${err.message}`)
        if (bal?.slv) {
            bal.slv({
                libBit: {
                    idx: 'stage-lockfile-conflict-error',
                    src: err.message,
                    val: -1,
                },
            })
        }
    }

    return cpy
}

/**
 * Purges an orphaned or completed temporary scratchpad file.
 */
export const purgeLockfileScratchpad = async (
    cpy: LibraryModel,
    bal: LibraryBit,
    ste: State,
): Promise<LibraryModel> => {
    const targetFile = bal?.src
    if (targetFile && (await fs.pathExists(targetFile))) {
        try {
            await fs.remove(targetFile)
            if (ste && typeof ste.hunt === 'function') {
                await ste.hunt(ActCns.UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: `>> [LOCKFILE_PURGE] [OK] Removed temporary scratchpad: ${path.basename(targetFile)}`,
                }).catch(() => {})
            }
            if (bal?.slv) {
                bal.slv({
                    libBit: {
                        idx: 'purge-lockfile-scratchpad',
                        src: targetFile,
                        val: 0,
                    },
                })
            }
        } catch (err: any) {
            if (bal?.slv) {
                bal.slv({
                    libBit: {
                        idx: 'purge-lockfile-scratchpad-error',
                        src: err.message,
                        val: -1,
                    },
                })
            }
        }
    } else {
        if (bal?.slv) {
            bal.slv({
                libBit: {
                    idx: 'purge-lockfile-scratchpad',
                    src: targetFile || '',
                    val: 0,
                },
            })
        }
    }

    return cpy
}
