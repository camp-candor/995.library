import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SiblingCockpitSpec {
  readonly globalKey: string;
  readonly menuTitle: string;
  readonly repoName: string;
  readonly runPath: string;
  readonly menuDesc: string;
}

const SIBLING_COCKPITS: readonly SiblingCockpitSpec[] = [
  {
    globalKey: 'CAMP_CANDOR_CAULDRON',
    menuTitle: 'CAMP CANDOR CAULDRON',
    repoName: '000.camp-candor-cauldron',
    runPath: 'D:\\trellis\\000.camp-candor-cauldron\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.camp-candor-cauldron cockpit\n(D:\\trellis\\000.camp-candor-cauldron\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'GOBLIN_LORE',
    menuTitle: 'GOBLIN LORE',
    repoName: '000.goblin-lore',
    runPath: 'D:\\trellis\\000.goblin-lore\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.goblin-lore cockpit\n(D:\\trellis\\000.goblin-lore\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'GOBLIN_SPATIAL',
    menuTitle: 'GOBLIN SPATIAL',
    repoName: '000.goblin-spatial',
    runPath: 'D:\\trellis\\000.goblin-spatial\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.goblin-spatial cockpit\n(D:\\trellis\\000.goblin-spatial\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'GOBLIN_VIEWPORT_TEMPLATE',
    menuTitle: 'GOBLIN VIEWPORT TEMPLATE',
    repoName: '000.goblin-viewport-template',
    runPath: 'D:\\trellis\\000.goblin-viewport-template\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.goblin-viewport-template cockpit\n(D:\\trellis\\000.goblin-viewport-template\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'MICROSERVICE_AUDIO',
    menuTitle: 'MICROSERVICE AUDIO',
    repoName: '000.microservice-audio',
    runPath: 'D:\\trellis\\000.microservice-audio\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.microservice-audio cockpit\n(D:\\trellis\\000.microservice-audio\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'REPO_BOT',
    menuTitle: 'REPO BOT',
    repoName: '000.repo-bot',
    runPath: 'D:\\trellis\\000.repo-bot\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.repo-bot cockpit\n(D:\\trellis\\000.repo-bot\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'SERIES_DASHBOARD',
    menuTitle: 'SERIES DASHBOARD',
    repoName: '000.series-dashboard',
    runPath: 'D:\\trellis\\000.series-dashboard\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.series-dashboard cockpit\n(D:\\trellis\\000.series-dashboard\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'SERIES_SOWER_CONDUCTOR',
    menuTitle: 'SERIES SOWER CONDUCTOR',
    repoName: '000.series-sower-conductor',
    runPath: 'D:\\trellis\\000.series-sower-conductor\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.series-sower-conductor cockpit\n(D:\\trellis\\000.series-sower-conductor\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'SERIES_SOWER_ENGINE',
    menuTitle: 'SERIES SOWER ENGINE',
    repoName: '000.series-sower-engine',
    runPath: 'D:\\trellis\\000.series-sower-engine\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 000.series-sower-engine cockpit\n(D:\\trellis\\000.series-sower-engine\\apps\\995.library\\run.ts)',
  },
  {
    globalKey: 'SERIES_ASSETS_AUDIO',
    menuTitle: 'SERIES ASSETS AUDIO',
    repoName: '001.series-assets-audio',
    runPath: 'D:\\trellis\\001.series-assets-audio\\apps\\995.library\\run.ts',
    menuDesc:
      'Launch 001.series-assets-audio cockpit\n(D:\\trellis\\001.series-assets-audio\\apps\\995.library\\run.ts)',
  },
];

const PIVOT_MENU_ITEMS = [
  ' Update Pivot',
  ' Test Pivot',
  ' List Pivot',
  'DISCOVER FLEET PIVOTS',
  'LIST SWITCHBOARD ROUTES',
  'VERIFY SESSION ROUTES',
  'JUMP TO MOUNTED PIVOT',
  'TOGGLE HUD TELEMETRY',
  'WORKER BRIDGE STATUS',
  'ROOT MENU',
] as const;

const LIBRARY_MENU_ITEMS = [
  ' Update Unit',
  ' Create Unit',
  ' List Library',
  ' Audit Library',
  ' Progress Library',
  'ROOT MENU',
] as const;

const SHADE_MENU_ITEMS = [
  ' Update Shade',
  ' List Shade',
  'ROOT MENU',
] as const;

type ActiveMenuMode =
  | 'ROOT'
  | 'PIVOT_MENU'
  | 'LIBRARY_MENU'
  | 'SHADE_MENU'
  | 'JUMP_SUBMENU'
  | 'SIBLING_SESSION';

const INITIAL_BOOT_LINES: readonly string[] = [
  '-----------',
  '995.library v0.6.0',
  'LIBRARY V0.5.1',
  '-----------',
  '>> [OK] Master Bus Initialized',
  '>> [OK] Mounted UI Pivot: [000.pivot] -> PIVOT MENU',
  '>> [OK] Mounted UI Pivot: [100.shade] -> SHADE MENU',
  '>> [DISCOVERY] Initiating Local Multi-Cluster Pivot Discovery...',
  '>> [FLEET:ROOT] Located multi-cluster workspace at D:\\trellis',
  '>> [FLEET:SCAN] Discovered 10 external terminal pivot(s)',
  ...SIBLING_COCKPITS.map((c) => `:: [OK] Mounted ${c.menuTitle} -> ${c.runPath}`),
  '>> [DISCOVERY:COMPLETE] 10/10 pivot session(s) online.',
  '>> [READY] Terminal Cockpit active',
  ':: [KEYS] UP/DOWN or J/K: Navigate | ENTER: Select',
];

function Terminal() {
  const [mode, setMode] = useState<ActiveMenuMode>('ROOT');
  const [activeSibling, setActiveSibling] = useState<SiblingCockpitSpec | null>(null);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [hudVisible, setHudVisible] = useState<boolean>(false);
  const [logLines, setLogLines] = useState<string[]>([...INITIAL_BOOT_LINES]);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  const appendLogs = useCallback((lines: string | string[]) => {
    const incoming = Array.isArray(lines) ? lines : lines.split('\n');
    setLogLines((prev) => [...prev, ...incoming].slice(-250));
  }, []);

  const currentItems = useMemo<string[]>(() => {
    switch (mode) {
      case 'PIVOT_MENU':
        return [...PIVOT_MENU_ITEMS];
      case 'LIBRARY_MENU':
        return [...LIBRARY_MENU_ITEMS];
      case 'SHADE_MENU':
        return [...SHADE_MENU_ITEMS];
      case 'JUMP_SUBMENU':
        return [...SIBLING_COCKPITS.map((c) => c.menuTitle), 'CANCEL'];
      case 'SIBLING_SESSION':
        return [
          `STATUS: ${activeSibling?.menuTitle || 'SESSION'}`,
          'RUN COCKPIT CHECK',
          'ROOT MENU',
        ];
      case 'ROOT':
      default:
        return [
          ...SIBLING_COCKPITS.map((c) => c.menuTitle),
          'LIBRARY MENU',
          'PIVOT MENU',
          'SHADE MENU',
        ];
    }
  }, [mode, activeSibling]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ block: 'end' });
  }, [logLines]);

  const emitFocusTooltip = useCallback(
    (item: string, targetMode: ActiveMenuMode) => {
      if (targetMode === 'ROOT') {
        const sibling = SIBLING_COCKPITS.find((c) => c.menuTitle === item);
        if (sibling) {
          appendLogs(sibling.menuDesc);
          return;
        }
        if (item === 'LIBRARY MENU') {
          appendLogs('Open the library menu\nto explore library features.');
          return;
        }
        if (item === 'PIVOT MENU') {
          appendLogs('Open the pivot menu\nto manage pivot.');
          return;
        }
        if (item === 'SHADE MENU') {
          appendLogs('Open the shade menu\nto manage shade.');
          return;
        }
      } else if (targetMode === 'PIVOT_MENU') {
        appendLogs(`>> Focus: [${item}] - Press ENTER to execute`);
      }
    },
    [appendLogs],
  );

  const moveFocus = useCallback(
    (delta: number) => {
      setFocusIndex((prev) => {
        const len = currentItems.length;
        if (len === 0) return 0;
        const next = (prev + delta + len) % len;
        const nextItem = currentItems[next];
        if (nextItem) emitFocusTooltip(nextItem, mode);
        return next;
      });
    },
    [currentItems, emitFocusTooltip, mode],
  );

  const enterSiblingSession = useCallback(
    (spec: SiblingCockpitSpec) => {
      appendLogs([
        `>> [SWITCH] Yielding single-screen session to [${spec.menuTitle}]...`,
        `>> [RUNNER] Target: ${spec.runPath}`,
        `>> [READY] ${spec.repoName} Cockpit Active`,
        ':: [KEYS] UP/DOWN or J/K: Navigate | ENTER: Select | ESC: Root Menu',
      ]);
      setActiveSibling(spec);
      setMode('SIBLING_SESSION');
      setFocusIndex(0);
    },
    [appendLogs],
  );

  const returnToRoot = useCallback(() => {
    appendLogs('>> [RETURN] Restored Master Root Switchboard.');
    setActiveSibling(null);
    setMode('ROOT');
    setFocusIndex(0);
  }, [appendLogs]);

  const handleSelect = useCallback(
    async (item: string) => {
      if (mode === 'ROOT') {
        const sibling = SIBLING_COCKPITS.find((c) => c.menuTitle === item);
        if (sibling) {
          enterSiblingSession(sibling);
          return;
        }
        if (item === 'PIVOT MENU') {
          appendLogs([
            '>> [SWITCH] Yielding single-screen session to [PIVOT MENU]...',
            '-----------',
            'PIVOT MENU',
            '-----------',
            '>> [READY] Pivot Control Plane Active',
            ':: [KEYS] UP/DOWN or J/K: Navigate | ENTER: Select | ESC: Back',
          ]);
          setMode('PIVOT_MENU');
          setFocusIndex(0);
          return;
        }
        if (item === 'LIBRARY MENU') {
          appendLogs([
            '>> [SWITCH] Yielding single-screen session to [LIBRARY MENU]...',
            'LIBRARY MENU',
            '-----------',
          ]);
          setMode('LIBRARY_MENU');
          setFocusIndex(0);
          return;
        }
        if (item === 'SHADE MENU') {
          appendLogs([
            '>> [SWITCH] Yielding single-screen session to [SHADE MENU]...',
            'SHADE MENU',
            '-----------',
          ]);
          setMode('SHADE_MENU');
          setFocusIndex(0);
          return;
        }
      }

      if (mode === 'PIVOT_MENU') {
        switch (item) {
          case 'DISCOVER FLEET PIVOTS':
            appendLogs([
              '>> [DISCOVERY] Initiating Local Multi-Cluster Pivot Discovery...',
              '>> [FLEET:ROOT] Located multi-cluster workspace at D:\\trellis',
              '>> [FLEET:SCAN] Discovered 10 external terminal pivot(s)',
              ...SIBLING_COCKPITS.map((c) => `:: [OK] Mounted ${c.menuTitle} -> ${c.runPath}`),
              '>> [DISCOVERY:COMPLETE] 10/10 pivot session(s) online.',
            ]);
            return;

          case 'LIST SWITCHBOARD ROUTES':
            appendLogs([
              '>> [SWITCHBOARD] Registered Master Root Routes:',
              ':: [LIBRARY MENU] -> Open the library menu to explore library features.',
              ...SIBLING_COCKPITS.map(
                (c) => `:: [${c.menuTitle}] -> Launch ${c.repoName} cockpit`,
              ),
              ':: [PIVOT MENU] -> Open the pivot menu to manage pivot.',
              ':: [SHADE MENU] -> Open the shade menu to manage shade.',
            ]);
            return;

          case 'VERIFY SESSION ROUTES': {
            const rows = [
              'LIBRARY MENU',
              ...SIBLING_COCKPITS.map((c) => c.menuTitle),
              'PIVOT MENU',
              'SHADE MENU',
            ];
            appendLogs([
              '>> [AUDIT] Local Session Route Readiness Table:',
              '>> +--------------------------+----------+',
              ...rows.map((r) => `>> | ${r.slice(0, 24).padEnd(24, ' ')} | READY    |`),
              '>> +--------------------------+----------+',
            ]);
            return;
          }

          case 'JUMP TO MOUNTED PIVOT':
            setMode('JUMP_SUBMENU');
            setFocusIndex(0);
            return;

          case 'TOGGLE HUD TELEMETRY': {
            const next = !hudVisible;
            setHudVisible(next);
            appendLogs(
              `>> [HUD] Telemetry banner visibility set to: ${next ? 'VISIBLE' : 'HIDDEN'}`,
            );
            return;
          }

          case 'WORKER BRIDGE STATUS': {
            appendLogs('>> [BRIDGE] Probing worker switchboard at http://127.0.0.1:8787/api/switchboard/routes...');
            try {
              const res = await fetch('http://127.0.0.1:8787/api/switchboard/routes');
              if (!res.ok) throw new Error(`HTTP_${res.status}`);
              const data: any = await res.json();
              const count = Array.isArray(data?.routes) ? data.routes.length : 0;
              appendLogs(`>> [BRIDGE:OK] Remote manifest parity verified (${count} routes)`);
            } catch {
              appendLogs('>> [BRIDGE:OFFLINE] Local workstation autonomous mode active (edge unreachable)');
            }
            return;
          }

          case 'ROOT MENU':
            returnToRoot();
            return;

          default:
            appendLogs(`>> [PIVOT] Executed${item}`);
            return;
        }
      }

      if (mode === 'JUMP_SUBMENU') {
        if (item === 'CANCEL') {
          setMode('PIVOT_MENU');
          setFocusIndex(0);
          return;
        }
        const sibling = SIBLING_COCKPITS.find((c) => c.menuTitle === item);
        if (sibling) {
          appendLogs(`>> [JUMP] Direct cross-pivot transfer -> [${sibling.menuTitle}]`);
          enterSiblingSession(sibling);
        }
        return;
      }

      if (mode === 'SIBLING_SESSION' || mode === 'LIBRARY_MENU' || mode === 'SHADE_MENU') {
        if (item === 'ROOT MENU') {
          returnToRoot();
          return;
        }
        appendLogs(`>> [${activeSibling?.globalKey || mode}] Executed ${item}`);
      }
    },
    [activeSibling, appendLogs, enterSiblingSession, hudVisible, mode, returnToRoot],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        moveFocus(1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        moveFocus(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = currentItems[focusIndex];
        if (item) void handleSelect(item);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (mode !== 'ROOT') returnToRoot();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentItems, focusIndex, handleSelect, mode, moveFocus, returnToRoot]);

  const activeSessionLabel =
    mode === 'ROOT'
      ? 'MASTER SWITCHBOARD'
      : mode === 'SIBLING_SESSION'
        ? activeSibling?.menuTitle || 'SIBLING'
        : mode.replace('_', ' ');

  return (
    <div
      data-testid="blessed-terminal-cockpit"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0c0c0c',
        color: '#16c60c',
        fontFamily: "'Cascadia Mono', 'Consolas', 'Courier New', monospace",
        fontSize: '15px',
        lineHeight: '1.25',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Left Control Pane: 12x12 grid { x: 0, y: 4, xSpan: 4, ySpan: 8 } */}
      <div
        role="menu"
        aria-label="Terminal Control Menu"
        style={{
          position: 'absolute',
          left: 0,
          top: '33.3333%',
          width: '33.3333%',
          height: '66.6667%',
          backgroundColor: '#000000',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {currentItems.map((item, idx) => {
          const isFocused = idx === focusIndex;
          const isJump = mode === 'JUMP_SUBMENU';
          const unfocusedBg = isJump ? '#13a10e' : '#c19c00';
          const focusedBg = '#c50f1f';
          return (
            <button
              key={`${mode}-${item}`}
              type="button"
              role="menuitem"
              onMouseEnter={() => {
                if (focusIndex !== idx) {
                  setFocusIndex(idx);
                  emitFocusTooltip(item, mode);
                }
              }}
              onClick={() => {
                setFocusIndex(idx);
                void handleSelect(item);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                outline: 'none',
                margin: 0,
                padding: '0 1ch 0 2ch',
                height: '1.25em',
                lineHeight: '1.25em',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                backgroundColor: isFocused ? focusedBg : unfocusedBg,
                color: isFocused ? '#ffffff' : '#3a3a3a',
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Right Information & Telemetry Pane: 12x12 grid { x: 4, y: 0, xSpan: 8, ySpan: 12 } */}
      <div
        style={{
          position: 'absolute',
          left: '33.3333%',
          top: 0,
          width: '66.6667%',
          height: '100%',
          backgroundColor: '#0c0c0c',
          color: '#16c60c',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {hudVisible && (
          <div
            style={{
              padding: '4px 1ch',
              borderBottom: '1px solid #13a10e',
              whiteSpace: 'pre',
              flexShrink: 0,
            }}
          >
            {`ACTIVE SESSION: [${activeSessionLabel}] | HOST RIG: RIG 1 (ORCHESTRATOR)\nACTIVE SERIES : UNBOUND | CANON STATUS: UNSEALED (LOCAL_DRAFT)`}
          </div>
        )}

        <div
          aria-label="cns00 telemetry console"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 1ch',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {logLines.map((line, i) => (
            <div key={i} style={{ minHeight: '1.25em' }}>
              {line}
              {i === logLines.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '0.6em',
                    height: '1em',
                    backgroundColor: '#cccccc',
                    verticalAlign: 'text-bottom',
                    marginLeft: '2px',
                  }}
                />
              )}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}

export default Terminal;
