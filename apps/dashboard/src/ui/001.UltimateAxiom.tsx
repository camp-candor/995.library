import React, { useEffect } from 'react';
import { Skull, Terminal, BarChart3, Settings2, Cpu, Microscope, Brain, FolderOpen, ShieldAlert, Power, Sliders, Send, Construction, AlertTriangle, FileJson, History, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVerifyAuth } from '../queue/access.query';
import { useGame } from '../hooks/useGame';
import './GamePad.css';

function GamePad() {
  const { authToken, setAuthToken } = useAuth();
  const { data: authData, isLoading: isAuthLoading } = useVerifyAuth();
  const { gameState, socketStatus, actions } = useGame(authToken ?? undefined);

  useEffect(() => {
    // 1. Try to get the token from URL parameters first
    let tokenFromUrl = null;
    const searchString = window.location.search;

    if (searchString && searchString.indexOf('token=') !== -1) {
      const match = searchString.match(/[?&]token=([^&]+)/);
      if (match && match[1]) {
        tokenFromUrl = decodeURIComponent(match[1]);
      }
    }

    if (tokenFromUrl) {
      console.log('Got token from URL: ' + tokenFromUrl);
      setAuthToken(tokenFromUrl);
      return;
    }

    // 2. If no token in URL, listen for postMessage
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === 'CLERK_AUTH_TOKEN') {
        const payloadToken = data.payload ? data.payload.token : null;
        if (payloadToken) {
          console.log('Got token from postMessage: ' + payloadToken);
          setAuthToken(payloadToken);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Canvas/Shade logic (keeping for backward compatibility/functionality if needed)
    const alligator = async () => {
      setTimeout(async () => {
        if (typeof window['SHADE'] !== 'function') return;

        const WRITE_SURFACE = '[Write action] Write Surface';
        var bit = await window['SHADE'](WRITE_SURFACE, {
          idx: 'surface00',
          src: 'surface00',
          dat: { w: 720, h: 1080 },
        });

        var stage = bit.fceBit.dat.bit.stage;

        const WRITE_GRAPHIC = '[Write action] Write Graphic';
        var graphic = await window['SHADE'](WRITE_GRAPHIC, { idx: 'graphic00', dat: {} });
        graphic = graphic.gphBit.dat.bit;

        graphic.rect(0, 0, 720, 1080).fill({ color: 0x00ff00 }).stroke({ width: 2, color: 0x000000 });

        graphic.alpha = 0.8;
        stage.addChild(graphic);

        const WRITE_SPRITE = '[Write action] Write Sprite';
        var spriteResponse = await window['SHADE'](WRITE_SPRITE, { idx: 'sprite00', src: '/img/000.png' });
        var sprite = spriteResponse?.sprBit?.dat?.bit;
        if (sprite) {
          sprite.scale.x = 1;
          sprite.scale.y = 1;
          stage.addChild(sprite);
        }
      }, 222);
    };

    alligator();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setAuthToken]);

  return (
    <div className="text-on-surface font-body h-screen w-screen flex flex-col bg-surface overflow-y-auto overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="flex justify-between items-center w-full px-4 fixed top-0 left-0 z-50 bg-[#131315] text-primary text-xs font-bold font-['Inter'] tracking-widest uppercase h-12 border-b border-primary/10 shadow-[0_0_15px_rgba(255,159,28,0.05)]">
        <div className="flex items-center h-full gap-8">
          <div className="text-lg font-black font-mono text-primary tracking-tighter flex items-center gap-2">
            <Skull className="w-5 h-5" />
            <div className="flex flex-col leading-none">
              <span>PURIFIED CONSOLE</span>
              <span className="text-[9px] tracking-[0.2em] text-primary/60 font-bold">ALLIGATOR INK AGENT V.0</span>
            </div>
          </div>
          <div className="flex items-center h-full gap-2">
            <a className="text-primary border-b-2 border-primary h-full flex items-center px-4 hover:bg-primary/5 transition-all duration-75 cursor-crosshair active:bg-primary/20" href="#">
              MATRIX
            </a>
            <a className="text-zinc-500 h-full flex items-center px-4 hover:bg-primary/5 hover:text-primary transition-all duration-75 cursor-crosshair active:bg-primary/20" href="#">
              TRACE
            </a>
            <a className="text-zinc-500 h-full flex items-center px-4 hover:bg-primary/5 hover:text-primary transition-all duration-75 cursor-crosshair active:bg-primary/20" href="#">
              LEDGER
            </a>
            <a className="text-zinc-500 h-full flex items-center px-4 hover:bg-primary/5 hover:text-primary transition-all duration-75 cursor-crosshair active:bg-primary/20" href="#">
              OSSUARY
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Terminal className="text-primary w-5 h-5 cursor-crosshair hover:bg-primary/10" />
          <BarChart3 className="text-primary w-5 h-5 cursor-crosshair hover:bg-primary/10" />
          <Settings2 className="text-primary w-5 h-5 cursor-crosshair hover:bg-primary/10" />
          <X className="text-primary w-5 h-5 cursor-crosshair hover:bg-primary/10 border border-primary/20 p-0.5" />
          <img alt="Operator 01" className="w-8 h-8 object-cover opacity-80 filter sepia-[0.2] hue-rotate-[320deg] saturate-[5] contrast-[1.2]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkExTBciceLrhDHCLN-qiRNjHmvydIgvkG9sOUZtxu2HQcQO6ApDyC7rV7ptw2OdbUnmXyEoPPplk-y3JJs-851RGm89od2giGGvv2rrYl24tWZwmFpsQZXgZPQQuR-4cCrx8fPKsUPh5e2q5WkMd7egijM6rfktSHv2fE_RefA2T2dN54zTDSzMpZn5a8TQ50INzaMR8GtQTM3862mM_g7lgVlLJe8xpoRh0QPYrfy-lNrFtwm59CC-9BKV3iMithPqXov2kRNZE" />
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-12 h-[calc(100vh-3rem)] w-16 flex flex-col items-center z-40 bg-[#0e0e10] text-primary font-mono text-[10px] tracking-tighter border-r border-primary/10">
        <div className="flex flex-col items-center py-6 gap-2 w-full ghost-border border-b border-t-0 border-l-0 border-r-0 border-opacity-10 mb-4">
          <Cpu className="text-zinc-500 w-5 h-5" />
        </div>
        <div className="flex flex-col w-full gap-2 px-2">
          <a className="bg-primary/10 text-primary border-l-4 border-primary w-full flex flex-col items-center py-4 hover:text-zinc-300 transition-colors" href="#" title="DIAGNOSTICS">
            <Microscope className="w-5 h-5 mb-1" />
          </a>
          <a className="text-zinc-700 w-full flex flex-col items-center py-4 hover:text-zinc-300 transition-colors" href="#" title="COGNITION">
            <Brain className="w-5 h-5 mb-1" />
          </a>
          <a className="text-zinc-700 w-full flex flex-col items-center py-4 hover:text-zinc-300 transition-colors" href="#" title="FILESYSTEM">
            <FolderOpen className="w-5 h-5 mb-1" />
          </a>
          <a className="text-zinc-700 w-full flex flex-col items-center py-4 hover:text-zinc-300 transition-colors" href="#" title="PROTOCOLS">
            <ShieldAlert className="w-5 h-5 mb-1" />
          </a>
          <a className="text-zinc-700 w-full flex flex-col items-center py-4 hover:text-zinc-300 transition-colors mt-auto mb-4" href="#" title="SHUTDOWN">
            <Power className="w-5 h-5 mb-1 text-secondary-container" />
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-16 grid-layout bg-surface w-[calc(100vw-4rem)]">
        {/* TOP LEFT AREA: Visual Core */}
        <section className="eye-anchor overflow-hidden relative bg-black">
          <div id="surface00" className="absolute inset-0 w-full h-full [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:block z-0"></div>
          <img alt="System Visual Core" className="w-full h-full object-cover opacity-80 filter saturate-[0.8] contrast-[1.2] absolute inset-0 z-0 pointer-events-none" src="https://lh3.googleusercontent.com/aida/ADBb0ugAGfhUADeW63ftWuVBy37NymxsMcPpGk1Zj2jT8ruoj8eL8m26ZtKXdaUIFHG62tv2JDT_uc-AkEOIe9zA_O2lePld-K1SwzjZYLFiNiROWLVEr8uSe6AFQhMUHIekojQUlHXri4CIR1jZ41cnr9_3tHvfvPZW7qgJWOqNZasyygc5zz3idQZEziZaUt4lQI7CBhFa7ADnlnhbqjwOMj7Mb1EpbpJAsoIwc8Gtbs13W0Yap1geV78GvXQ" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60 z-10 pointer-events-none"></div>
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/20 border border-primary/30 text-primary font-mono text-[9px] uppercase tracking-widest backdrop-blur-sm z-10 pointer-events-none">VISUAL_CORE_FEED</div>
          <div className="absolute bottom-2 right-2 flex gap-1 z-10 pointer-events-none">
            <div className="w-1 h-1 bg-primary animate-pulse"></div>
            <div className="w-1 h-1 bg-primary/50"></div>
            <div className="w-1 h-1 bg-primary/50"></div>
          </div>
        </section>

        {/* Command Matrix */}
        <section className="matrix-container flex flex-col h-full bg-surface-container-lowest ghost-border border-r border-t-0 border-b-0 border-l-0 border-opacity-20 overflow-hidden">
          <div className="p-4 border-b ghost-border border-opacity-10 bg-surface-container-low flex items-center justify-between">
            <h2 className="label-sm text-on-surface-variant font-bold tracking-widest uppercase">Command Matrix</h2>
            <Sliders className="w-4 h-4 text-primary-container" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {/* Override Directive */}
            <div className="flex flex-col gap-2">
              <label className="label-sm text-on-surface-variant italic">Alligator Ink Agent V.0</label>
              <div className="relative w-full">
                <textarea className="w-full bg-surface text-on-surface border-b border-outline outline-none p-2 font-mono text-xs focus:border-primary-container focus:ring-0 transition-colors resize-none h-24 placeholder-surface-variant" placeholder="ENTER DIRECTIVE..."></textarea>
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={() => actions.attack()} className="bg-primary-container text-on-primary-container label-sm font-bold px-4 py-2 hover:bg-primary-fixed transition-colors flex items-center gap-2 active:scale-95">
                  <Send className="w-4 h-4" />
                  EXECUTE
                </button>
              </div>
            </div>

            {/* Tactical Overrides */}
            <div className="flex flex-col gap-2">
              <label className="label-sm text-on-surface-variant uppercase">Tactical Overrides</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => actions.move(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100))} className="border border-primary/30 py-2 px-2 text-[10px] font-mono hover:bg-primary/10 transition-colors uppercase text-left">
                  [ Pulse Scan ]
                </button>
                <button onClick={() => actions.attack()} className="border border-primary/30 py-2 px-2 text-[10px] font-mono hover:bg-primary/10 transition-colors uppercase text-left">
                  [ Vent Gas ]
                </button>
                <button className="border border-primary/30 py-2 px-2 text-[10px] font-mono hover:bg-primary/10 transition-colors uppercase text-left">[ Lift ]</button>
                <button className="border border-primary/30 py-2 px-2 text-[10px] font-mono hover:bg-primary/10 transition-colors uppercase text-left">[ Mire-Link ]</button>
              </div>
            </div>

            {/* System Resonance */}
            <div className="flex flex-col gap-4">
              <label className="label-sm text-on-surface-variant">System Resonance</label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-tertiary-fixed-dim uppercase">Pulse Scan</span>
                  <div className="w-32 h-1 bg-surface-variant relative">
                    <div className="absolute top-0 left-0 h-full w-2/3 bg-secondary-container"></div>
                    <div className="absolute top-1/2 left-2/3 w-2 h-4 bg-on-surface transform -translate-y-1/2 -translate-x-1/2 cursor-crosshair"></div>
                  </div>
                  <span className="font-mono text-[10px] text-secondary-container">0.88</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-tertiary-fixed-dim uppercase">Vent Gas</span>
                  <div className="w-32 h-1 bg-surface-variant relative">
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-primary-container"></div>
                    <div className="absolute top-1/2 left-1/3 w-2 h-4 bg-on-surface transform -translate-y-1/2 -translate-x-1/2 cursor-crosshair"></div>
                  </div>
                  <span className="font-mono text-[10px] text-primary-container">0.32</span>
                </div>
              </div>
            </div>

            {/* Protocol Flags */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="label-sm text-on-surface-variant mb-2">Protocol Flags</label>
              <div className="flex items-center gap-2 cursor-crosshair hover:bg-surface-variant/20 p-1">
                <div className="w-3 h-3 border border-primary-container flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary-container"></div>
                </div>
                <span className="font-mono text-[10px] text-on-surface">BYPASS_ETHICS_CHECK</span>
              </div>
              <div className="flex items-center gap-2 cursor-crosshair hover:bg-surface-variant/20 p-1">
                <div className="w-3 h-3 border border-outline flex items-center justify-center"></div>
                <span className="font-mono text-[10px] text-surface-variant">FORCE_SYNCHRONOUS</span>
              </div>
              <div className="flex items-center gap-2 cursor-crosshair hover:bg-surface-variant/20 p-1">
                <div className="w-3 h-3 border border-secondary-container flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-secondary-container"></div>
                </div>
                <span className="font-mono text-[10px] text-secondary-container">ISOLATE_MEMORY_HEAP</span>
              </div>
            </div>

            {/* Status Synths */}
            <div className="mt-auto pt-4 border-t border-primary/10 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-surface-variant">AUTH LINK</span>
                <span className={authToken ? 'text-primary' : 'text-error animate-pulse'}>{authToken ? authToken.substring(0, 10) + '...' : 'OFFLINE'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-surface-variant">STATUS</span>
                <span className={isAuthLoading ? 'text-primary animate-pulse' : authData ? 'text-primary' : 'text-error'}>{isAuthLoading ? 'VERIFYING' : authData ? 'SECURE' : 'UNVERIFIED'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-surface-variant">SOCKET</span>
                <span className={socketStatus === 'OPEN' ? 'text-primary' : socketStatus === 'CONNECTING' ? 'text-primary-container animate-pulse' : 'text-error'}>{socketStatus}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-container-highest border-t ghost-border border-opacity-10 backdrop-blur-md bg-opacity-60">
            <div className="flex items-center justify-between">
              <span className="label-sm text-on-surface-variant">System Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-container animate-pulse"></div>
                <span className="font-mono text-[10px] text-primary-container">PURIFIED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Agentic Trace */}
        <section className="trace-container flex flex-col h-full bg-surface-dim overflow-hidden relative border-r ghost-border border-opacity-20">
          <div className="p-4 border-b ghost-border border-opacity-10 bg-surface-container-low flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <h2 className="label-sm text-on-surface-variant font-bold tracking-widest uppercase">Agentic Trace</h2>
              <span className="px-1.5 py-0.5 bg-surface-container-high text-tertiary-fixed-dim font-mono text-[9px] border ghost-border border-opacity-10">LIVE</span>
            </div>
            <div className="flex gap-4">
              <span className="font-mono text-[10px] text-surface-variant uppercase">
                Tick: <span className="text-primary-container">{gameState?.update?.tick ?? '—'}</span>
              </span>
              <span className="font-mono text-[10px] text-surface-variant uppercase">
                HP: <span className="text-on-surface">{gameState?.update?.hp ?? '—'}</span>
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative">
            <div className="absolute left-10 top-0 bottom-0 w-px bg-surface-variant opacity-30 z-0"></div>

            {/* Thought Node */}
            <div className="flex gap-6 relative z-10 group">
              <div className="w-8 flex flex-col items-center pt-1">
                <div className="w-3 h-3 bg-surface border border-outline z-10"></div>
                <span className="font-mono text-[8px] text-surface-variant mt-1">T-01</span>
              </div>
              <div className="flex-1 bg-surface-container-low p-4 ghost-border border-opacity-15 flex flex-col gap-2 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-tertiary-fixed-dim" />
                  <span className="label-sm text-tertiary-fixed-dim">INTERNAL_MONOLOGUE</span>
                  <span className="ml-auto font-mono text-[9px] text-surface-variant">14:02:44.102</span>
                </div>
                <p className="font-mono text-xs text-on-surface leading-relaxed uppercase">
                  Analyzing override directive. Pos: {gameState?.update?.x ?? '—'}, {gameState?.update?.y ?? '—'}. Applying compensation matrix.
                </p>
              </div>
            </div>

            {/* Tool Execution Node */}
            <div className="flex gap-6 relative z-10 group">
              <div className="w-8 flex flex-col items-center pt-1">
                <div className="w-3 h-3 bg-primary-container z-10 amber-glow"></div>
                <span className="font-mono text-[8px] text-primary-container mt-1">T-02</span>
              </div>
              <div className="flex-1 bg-surface-container-high p-4 border-l-2 border-primary-container flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Construction className="w-4 h-4 text-primary-container" />
                  <span className="label-sm text-primary-container font-bold">TOOL_EXECUTION</span>
                  <span className="ml-auto font-mono text-[9px] text-surface-variant">14:02:44.850</span>
                </div>
                <div className="bg-surface p-3 ghost-border border-opacity-10">
                  <div className="font-mono text-[10px] text-tertiary-fixed-dim mb-2">&gt; RUN: execute_pulse_scan()</div>
                  <div className="font-mono text-[10px] text-on-surface">
                    <span className="text-surface-variant uppercase">[stdout]</span> Initiating handshake...
                    <br />
                    <span className="text-surface-variant uppercase">[stdout]</span> Status: <span className="text-primary-container">SUCCESS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomaly Node */}
            <div className="flex gap-6 relative z-10 group">
              <div className="w-8 flex flex-col items-center pt-1">
                <div className="w-3 h-3 bg-secondary-container z-10"></div>
                <span className="font-mono text-[8px] text-secondary-container mt-1">T-03</span>
              </div>
              <div className="flex-1 bg-surface-container-low p-4 border-l-2 border-secondary-container flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-secondary-container" />
                  <span className="label-sm text-secondary-container font-bold uppercase">Critical Hazard</span>
                  <span className="ml-auto font-mono text-[9px] text-surface-variant">14:02:45.001</span>
                </div>
                <p className="font-mono text-[11px] text-error-container uppercase">Mire saturation L-4. Heat signature rising above threshold. Containment protocols recommended.</p>
                <div className="mt-2">
                  <button className="text-[10px] font-mono text-secondary-container hover:text-error transition-colors flex items-center gap-1 uppercase">[ Isolate Sector ]</button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-surface-dim to-transparent pointer-events-none z-20"></div>
        </section>

        {/* Epistemic Ledger */}
        <section className="ledger-container flex flex-col h-full bg-surface-container-lowest ghost-border border-l border-t-0 border-b-0 border-r-0 border-opacity-20 overflow-hidden">
          <div className="p-4 border-b ghost-border border-opacity-10 bg-surface-container-low flex items-center justify-between">
            <h2 className="label-sm text-on-surface-variant font-bold tracking-widest uppercase">Epistemic Ledger</h2>
            <div className="flex gap-2">
              <FileJson className="w-4 h-4 text-surface-variant hover:text-on-surface cursor-crosshair" />
              <History className="w-4 h-4 text-surface-variant hover:text-on-surface cursor-crosshair" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-surface font-mono text-[11px] leading-tight text-tertiary-fixed-dim whitespace-pre-wrap overflow-x-hidden break-all">
            {JSON.stringify(
              {
                system_state: {
                  id: '0x7A99F2',
                  timestamp: Date.now(),
                  nodes: [
                    {
                      name: 'Alpha-Node',
                      status: 'CALIBRATED',
                      metrics: {
                        temp: 42.1,
                        load: 0.88,
                        vector: [0.44, -0.12, 1.05],
                      },
                    },
                    {
                      name: 'Sector-7G',
                      status: 'CRITICAL',
                      metrics: {
                        temp: 125.4,
                        load: 1.0,
                        containment: false,
                      },
                    },
                  ],
                },
                gameState: gameState?.update || {},
              },
              null,
              2
            )}
          </div>
          <div className="p-2 bg-surface-container-low border-t ghost-border border-opacity-10 text-right">
            <span className="font-mono text-[9px] text-surface-variant">MUTATION HASH: a8f9...3b2c</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default GamePad;
