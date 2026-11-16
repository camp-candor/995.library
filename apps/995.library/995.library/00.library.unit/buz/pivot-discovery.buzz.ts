import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type {
  DiscoveredPivotBit,
  FleetDiscoverySummary,
  PivotHydrationReceipt,
  TerminalManifestConfig,
} from '../fce/pivot-discovery.bit';
import type { LibraryModel } from '../library.model';

const CLUSTER_MARKERS = [
  'camp-candor-cauldron',
  '00.governance',
  '01.canon',
  '02.simulation',
  '03.foundry',
  '04.assets',
  '05.delivery',
] as const;

const TOMBSTONE_MARKERS = ['.tombstone', '.pruned', 'TOMBSTONE.md'] as const;

function emitConsoleLine(ste: any, line: string): void {
  if (ste && typeof ste.hunt === 'function') {
    try {
      ste.hunt('[Console action] Update Console', { idx: 'cns00', src: line });
    } catch {
      // headless guard: never throw on missing console
    }
  }
}

function isTombstonedDirectory(dirPath: string): boolean {
  return TOMBSTONE_MARKERS.some((marker) => fs.existsSync(path.join(dirPath, marker)));
}

function parseTerminalConfig(pkgJson: Record<string, any>): TerminalManifestConfig | null {
  const term = pkgJson?.terminal;
  if (!term || typeof term !== 'object') return null;
  if (
    typeof term.globalKey !== 'string' ||
    term.globalKey.trim().length === 0 ||
    typeof term.menuTitle !== 'string' ||
    term.menuTitle.trim().length === 0
  ) {
    return null;
  }
  return {
    globalKey: term.globalKey.trim(),
    menuTitle: term.menuTitle.trim(),
    menuDesc:
      typeof term.menuDesc === 'string' && term.menuDesc.trim().length > 0
        ? term.menuDesc.trim()
        : `Launch ${term.menuTitle.trim()} domain session.`,
  };
}

export const resolveFleetRoot = async (
  cpy: LibraryModel,
  bal: { startDir?: string; slv?: (val: any) => void } = {},
  ste?: any
): Promise<LibraryModel> => {
  const envRoot = process.env.FLEET_ROOT || process.env.WORK_DIR;
  if (envRoot && fs.existsSync(envRoot)) {
    const resolvedEnv = path.resolve(envRoot);
    cpy.fleetRoot = resolvedEnv;
    cpy.isStandaloneMode = false;
    emitConsoleLine(ste, `>> [FLEET:ROOT] Resolved via environment anchor: ${resolvedEnv}`);
    if (bal.slv) bal.slv({ libBit: { idx: 'resolve-fleet-root', fleetRoot: resolvedEnv, isStandalone: false } });
    return cpy;
  }

  let currentDir = path.resolve(bal.startDir || process.cwd());
  const root = path.parse(currentDir).root;
  let foundRoot: string | null = null;

  while (true) {
    const markerHits = CLUSTER_MARKERS.filter((marker) =>
      fs.existsSync(path.join(currentDir, marker))
    );
    let siblingRepoCount = 0;
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (
          entry.isDirectory() &&
          /^\d{3}\./.test(entry.name) &&
          !isTombstonedDirectory(path.join(currentDir, entry.name)) &&
          fs.existsSync(path.join(currentDir, entry.name, 'packages'))
        ) {
          siblingRepoCount += 1;
        }
      }
    } catch {
      // ignore unreadable directories
    }
    if (markerHits.length >= 2 || siblingRepoCount >= 2) {
      foundRoot = currentDir;
      break;
    }
    if (currentDir === root) break;
    currentDir = path.dirname(currentDir);
  }

  if (foundRoot) {
    cpy.fleetRoot = foundRoot;
    cpy.isStandaloneMode = false;
    emitConsoleLine(ste, `>> [FLEET:ROOT] Located multi-cluster workspace at ${foundRoot}`);
  } else {
    cpy.fleetRoot = path.resolve(bal.startDir || process.cwd());
    cpy.isStandaloneMode = true;
    emitConsoleLine(
      ste,
      `>> [FLEET:FALLBACK] Standalone single-repo mode active at ${cpy.fleetRoot}`
    );
  }

  if (bal.slv) {
    bal.slv({
      libBit: {
        idx: 'resolve-fleet-root',
        fleetRoot: cpy.fleetRoot,
        isStandalone: cpy.isStandaloneMode,
      },
    });
  }
  return cpy;
};

export const scanFleetPivots = async (
  cpy: LibraryModel,
  bal: { slv?: (val: any) => void } = {},
  ste?: any
): Promise<LibraryModel> => {
  if (!cpy.fleetRoot) {
    await resolveFleetRoot(cpy, {}, ste);
  }

  const candidateRoots: Array<{ clusterLabel: string; packagesParent: string }> = [
    { clusterLabel: 'local', packagesParent: path.join(process.cwd(), 'packages') },
  ];

  if (!cpy.isStandaloneMode && cpy.fleetRoot) {
    candidateRoots.push({
      clusterLabel: 'front-porch',
      packagesParent: path.join(cpy.fleetRoot, 'camp-candor-cauldron', 'packages'),
    });

    const numberedClusters = [
      '00.governance',
      '01.canon',
      '02.simulation',
      '03.foundry',
      '04.assets',
      '05.delivery',
    ];

    for (const cluster of numberedClusters) {
      const clusterPath = path.join(cpy.fleetRoot, cluster);
      if (!fs.existsSync(clusterPath) || isTombstonedDirectory(clusterPath)) continue;

      let repoEntries: fs.Dirent[] = [];
      try {
        repoEntries = fs.readdirSync(clusterPath, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const repoEntry of repoEntries) {
        if (!repoEntry.isDirectory()) continue;
        const repoPath = path.join(clusterPath, repoEntry.name);
        if (isTombstonedDirectory(repoPath)) continue;
        candidateRoots.push({
          clusterLabel: `${cluster}/${repoEntry.name}`,
          packagesParent: path.join(repoPath, 'packages'),
        });
      }
    }

    // Also scan flat sibling repositories directly under fleetRoot (e.g. 000.camp-candor-cauldron, 000.goblin-lore)
    try {
      const topEntries = fs.readdirSync(cpy.fleetRoot, { withFileTypes: true });
      for (const topEntry of topEntries) {
        if (!topEntry.isDirectory()) continue;
        if (topEntry.name.startsWith('.') || topEntry.name === 'node_modules') continue;
        if ((CLUSTER_MARKERS as readonly string[]).includes(topEntry.name)) continue;
        const repoPath = path.join(cpy.fleetRoot, topEntry.name);
        if (isTombstonedDirectory(repoPath)) continue;
        const pkgsDir = path.join(repoPath, 'packages');
        if (fs.existsSync(pkgsDir)) {
          candidateRoots.push({
            clusterLabel: topEntry.name,
            packagesParent: pkgsDir,
          });
        }
      }
    } catch {
      // ignore unreadable fleetRoot
    }
  }

  const discoveredMap = new Map<string, DiscoveredPivotBit>();

  for (const candidate of candidateRoots) {
    if (!fs.existsSync(candidate.packagesParent)) continue;

    let pkgEntries: fs.Dirent[] = [];
    try {
      pkgEntries = fs.readdirSync(candidate.packagesParent, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const pkgEntry of pkgEntries) {
      if (!pkgEntry.isDirectory()) continue;
      const pkgDir = path.join(candidate.packagesParent, pkgEntry.name);
      if (isTombstonedDirectory(pkgDir)) continue;

      const pkgJsonPath = path.join(pkgDir, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) continue;

      try {
        const raw = fs.readFileSync(pkgJsonPath, 'utf8');
        const pkgJson = JSON.parse(raw);
        let terminalConfig = parseTerminalConfig(pkgJson);
        if (!terminalConfig) {
          const hasMenuUnit =
            fs.existsSync(path.join(pkgDir, '98.menu.unit', 'menu.action.ts')) ||
            fs.existsSync(path.join(candidate.packagesParent, 'dist', pkgEntry.name, '98.menu.unit', 'menu.action.js'));
          if (!hasMenuUnit) continue;
          const domain = pkgEntry.name.includes('.')
            ? pkgEntry.name.split('.').slice(1).join('.')
            : pkgEntry.name;
          const upper = domain.toUpperCase();
          if (upper === 'PIVOT' || upper === 'LIBRARY') continue;
          terminalConfig = {
            globalKey: upper,
            menuTitle: `${upper} MENU`,
            menuDesc: `Open the ${domain} menu\nto manage ${domain}.`,
          };
        }
        if (terminalConfig.globalKey === 'LIBRARY') continue;

        const sharedDistHunt = path.join(candidate.packagesParent, 'dist', pkgEntry.name, 'hunt.js');
        const distHunt = path.join(pkgDir, 'dist', 'hunt.js');
        const rootHunt = path.join(pkgDir, 'hunt.js');
        const huntEntryPath = fs.existsSync(sharedDistHunt)
          ? sharedDistHunt
          : fs.existsSync(distHunt)
            ? distHunt
            : rootHunt;

        if (!discoveredMap.has(terminalConfig.globalKey)) {
          discoveredMap.set(terminalConfig.globalKey, {
            packageName: pkgJson.name || pkgEntry.name,
            packageDir: pkgDir,
            clusterLabel: candidate.clusterLabel,
            huntEntryPath,
            terminal: terminalConfig,
          });
        }
      } catch (err: any) {
        emitConsoleLine(
          ste,
          `:: [WARN] Malformed package.json skipped at ${pkgJsonPath}: ${err?.message || 'parse error'}`
        );
      }
    }
  }

  cpy.discoveredPivots = Array.from(discoveredMap.values());
  emitConsoleLine(
    ste,
    `>> [FLEET:SCAN] Discovered ${cpy.discoveredPivots.length} external terminal pivot(s)`
  );

  if (bal.slv) {
    bal.slv({
      libBit: {
        idx: 'scan-fleet-pivots',
        count: cpy.discoveredPivots.length,
        pivots: cpy.discoveredPivots,
      },
    });
  }
  return cpy;
};

export const hydratePivotModules = async (
  cpy: LibraryModel,
  bal: { registerMenus?: boolean; slv?: (val: any) => void } = {},
  ste?: any
): Promise<LibraryModel> => {
  const g = globalThis as Record<string, any>;
  if (!g.PIVOTS || typeof g.PIVOTS !== 'object') {
    g.PIVOTS = {};
  }

  const receipts: PivotHydrationReceipt[] = [];

  for (const pivot of cpy.discoveredPivots) {
    if (!fs.existsSync(pivot.huntEntryPath)) {
      const receipt: PivotHydrationReceipt = {
        globalKey: pivot.terminal.globalKey,
        menuTitle: pivot.terminal.menuTitle,
        packageName: pivot.packageName,
        status: 'SKIPPED_NO_BUILD',
        reason: `Missing compiled hunt.js at ${pivot.huntEntryPath}`,
      };
      receipts.push(receipt);
      emitConsoleLine(
        ste,
        `:: [SKIP] ${pivot.terminal.menuTitle} (${pivot.packageName}) -> hunt.js not compiled`
      );
      continue;
    }

    try {
      const fileUrl = pathToFileURL(pivot.huntEntryPath).href;
      const importedMod = await import(fileUrl);
      const pivotInstance =
        importedMod?.default ||
        importedMod?.[pivot.terminal.globalKey] ||
        importedMod?.sim ||
        importedMod;

      if (!pivotInstance || typeof pivotInstance.hunt !== 'function') {
        throw new Error('Exported module does not expose a valid hunt() state machine interface');
      }

      g[pivot.terminal.globalKey] = pivotInstance;
      g.PIVOTS[pivot.packageName] = pivotInstance;

      const receipt: PivotHydrationReceipt = {
        globalKey: pivot.terminal.globalKey,
        menuTitle: pivot.terminal.menuTitle,
        packageName: pivot.packageName,
        status: 'HYDRATED',
      };
      receipts.push(receipt);
      emitConsoleLine(
        ste,
        `:: [OK] Hydrated ${pivot.terminal.menuTitle} -> globalThis.${pivot.terminal.globalKey} (${pivot.clusterLabel})`
      );

      if (bal.registerMenus !== false && ste && typeof ste.hunt === 'function') {
        await ste.hunt('[Route action] Route Menu', {
          menuTitle: pivot.terminal.menuTitle,
          menuDesc: pivot.terminal.menuDesc,
          globalKey: pivot.terminal.globalKey,
        });
      }
    } catch (err: any) {
      const reason = err?.message || String(err);
      const receipt: PivotHydrationReceipt = {
        globalKey: pivot.terminal.globalKey,
        menuTitle: pivot.terminal.menuTitle,
        packageName: pivot.packageName,
        status: 'FAILED',
        reason,
      };
      receipts.push(receipt);
      emitConsoleLine(
        ste,
        `:: [FAIL] Isolated hydration failure for ${pivot.terminal.menuTitle}: ${reason}`
      );
    }
  }

  cpy.hydrationReceipts = receipts;
  if (bal.slv) {
    bal.slv({
      libBit: {
        idx: 'hydrate-pivot-modules',
        receipts,
      },
    });
  }
  return cpy;
};

export const discoverFleetPivots = async (
  cpy: LibraryModel,
  bal: { startDir?: string; registerMenus?: boolean; slv?: (val: any) => void } = {},
  ste?: any
): Promise<LibraryModel> => {
  emitConsoleLine(ste, '>> [DISCOVERY] Initiating Local Multi-Cluster Pivot Discovery...');
  await resolveFleetRoot(cpy, { startDir: bal.startDir }, ste);
  await scanFleetPivots(cpy, {}, ste);
  await hydratePivotModules(cpy, { registerMenus: bal.registerMenus }, ste);

  const hydratedCount = cpy.hydrationReceipts.filter((r) => r.status === 'HYDRATED').length;
  emitConsoleLine(
    ste,
    `>> [DISCOVERY:COMPLETE] ${hydratedCount}/${cpy.discoveredPivots.length} pivot session(s) online.`
  );

  const summary: FleetDiscoverySummary = {
    fleetRoot: cpy.fleetRoot,
    isStandalone: cpy.isStandaloneMode,
    discovered: cpy.discoveredPivots,
    receipts: cpy.hydrationReceipts,
  };

  if (bal.slv) {
    bal.slv({ libBit: { idx: 'discover-fleet-pivots', summary } });
  }
  return cpy;
};
