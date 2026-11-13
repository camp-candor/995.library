import React, { useEffect, useState } from 'react';
import { Skull, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVerifyAuth } from '../queue/access.query';
import { useGame } from '../hooks/useGame';
import './GamePad.css';

declare global {
  interface Window {
    SHADE?: (action: string, options: any) => Promise<any>;
  }
}

function GamePad() {
  const { authToken, setAuthToken } = useAuth();
  const { data: authData, isLoading: isAuthLoading } = useVerifyAuth();
  const { gameState, socketStatus, actions } = useGame(authToken ?? undefined);
  const [activeButton, setActiveButton] = useState<string>('STAND');

  useEffect(() => {
    console.log('🎮 [CHILD] GamePad lifecycle initialization started.');

    // Helper closure to safely update parent window environment with metrics updates
    const reportToParent = (statusMsg: string, details: any = {}) => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'IFRAME_DIAGNOSTIC_REPORT',
            payload: { status: statusMsg, ...details, timestamp: Date.now() },
          },
          '*'
        );
      }
    };

    // 1. Fire baseline validation signals immediately to parent window context
    if (window.parent && window.parent !== window) {
      console.log('📤 [CHILD] Broadcasting structural initialization signal to parent container...');
      window.parent.postMessage({ type: 'IFRAME_ENGINE_BOOTED' }, '*');
      reportToParent('BOOT_SIGNAL_DISPATCHED', { urlQuery: window.location.search });
    } else {
      console.warn('⚠️ [CHILD] App running standalone context. No parent window detected.');
    }

    // 2. Fallback parameter checking
    let tokenFromUrl = null;
    const searchString = window.location.search;
    if (searchString && searchString.indexOf('token=') !== -1) {
      const match = searchString.match(/[?&]token=([^&]+)/);
      if (match && match[1]) {
        tokenFromUrl = decodeURIComponent(match[1]);
        console.log('🎮 [CHILD] Detected authorization string inside URL string params.');
        reportToParent('TOKEN_FOUND_IN_URL');
      }
    }
    if (tokenFromUrl) setAuthToken(tokenFromUrl);

    // 3. Security Boundary Message Interception
    const handleMessage = (event: MessageEvent) => {
      console.log('📥 [CHILD] Data bundle reached Frame listener from Origin:', event.origin, 'Payload:', event.data);
      const data = event.data;
      if (data && data.type === 'CLERK_AUTH_TOKEN') {
        const payloadToken = data.payload ? data.payload.token : null;
        if (payloadToken) {
          console.log('✅ [CHILD] Token successfully authenticated via Handshake gateway.');
          setAuthToken(payloadToken);
          reportToParent('TOKEN_SET_VIA_HANDSHAKE');
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // 4. Polling Graphic Framework Compilation
    let engineCheckInterval: NodeJS.Timeout;

    const initializeGraphicsEngine = () => {
      let attempts = 0;
      engineCheckInterval = setInterval(async () => {
        attempts++;
        if (typeof window['SHADE'] !== 'function') {
          if (attempts % 10 === 0) {
            console.log(`⏳ [CHILD] Polling window.SHADE initialization (Attempt ${attempts})...`);
            reportToParent('AWAITING_SHADE_ENGINE', { pollingAttempts: attempts });
          }
          return;
        }

        clearInterval(engineCheckInterval);
        console.log('🚀 [CHILD] window.SHADE found! Compiling Pixi layers context container...');
        reportToParent('SHADE_ENGINE_DISCOVERED');

        try {
          const targetSurfaceElement = document.getElementById('surface00');
          if (!targetSurfaceElement) {
            console.error('❌ [CHILD] Element DOM identity reference "#surface00" missing from layout!');
            reportToParent('ERROR_DOM_CONTAINER_MISSING');
            return;
          }

          const WRITE_SURFACE = '[Write action] Write Surface';
          const bit = await window['SHADE'](WRITE_SURFACE, {
            idx: 'surface00',
            src: 'surface00',
            dat: { w: 1080, h: 1080 },
          });

          const app = bit?.fceBit?.dat?.bit;
          if (!app) {
            console.error('❌ [CHILD] Engine verified but App failed configuration output instantiation.');
            reportToParent('ERROR_PIXI_APP_UNDEFINED');
            return;
          }

          const stage = app.stage;
          console.log('✅ [CHILD] Pixi context verified. Active version identifier:', app.VERSION || 'V8-ENGINE');

          // Correct pointer tracking logic boundaries inside sandbox setups
          if (app.renderer && app.renderer.events) {
            app.renderer.events.setTargetElement(app.canvas);
          }

          const WRITE_GRAPHIC = '[Write action] Write Graphic';
          let graphicResponse = await window['SHADE'](WRITE_GRAPHIC, { idx: 'graphic00', dat: {} });
          const graphic = graphicResponse.gphBit.dat.bit;

          graphic.rect(0, 0, 1080, 1080).fill({ color: 0xff00ff });

          stage.addChild(graphic);
          console.log('🟩 [CHILD] Canvas background container layer rendered successfully.');

          // Verify canvas existence directly in DOM structure
          const generatedCanvas = targetSurfaceElement.querySelector('canvas');
          reportToParent('RENDER_SUCCESSFUL_COMPLETE', {
            canvasExists: !!generatedCanvas,
            canvasWidth: generatedCanvas?.clientWidth,
            canvasHeight: generatedCanvas?.clientHeight,
          });
        } catch (engineError) {
          console.error('💥 [CHILD] Crash during execution initialization steps:', engineError);
          reportToParent('CRASH_DURING_PIXI_COMPILING', {
            errorName: engineError instanceof Error ? engineError.name : 'Unknown',
            errorMessage: engineError instanceof Error ? engineError.message : String(engineError),
          });
        }
      }, 50);
    };

    initializeGraphicsEngine();

    return () => {
      window.removeEventListener('message', handleMessage);
      if (engineCheckInterval) clearInterval(engineCheckInterval);
    };
  }, []);

  const searchParams = new URLSearchParams(window.location.search);
  const showUI = searchParams.get('ui') !== 'false';

  return (
    <div className={`relative bg-algae-green text-cadmium-yellow min-h-screen flex flex-col m-0 font-display uppercase overflow-y-auto overflow-x-hidden ${showUI ? 'border-4 border-primary reptile-pattern' : 'bg-transparent'}`}>
      {showUI && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bruised-purple text-cadmium-yellow border-2 border-cadmium-yellow px-4 py-1 text-sm font-bold tracking-widest rotate-2 shadow-[4px_4px_0_0_#ec5b13] z-50 animate-pulse">002.GamePad</div>}

      {/* Top Header Panel UI */}
      {showUI && (
        <div className="flex items-center bg-algae-green p-3 border-b border-primary justify-between">
          <div className="flex items-center gap-2">
            <Skull className="text-primary w-8 h-8" />
            <h2 className="text-primary text-xl font-bold tracking-widest">GAMEPAD</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-bruised-purple px-2 py-1 border border-cadmium-yellow flex flex-col items-end">
              <span className="text-[10px] block leading-none">Auth Link</span>
              <span className={`text-sm font-bold ${authToken ? 'text-primary' : 'text-red-500 animate-pulse'}`}>{authToken ? authToken.substring(0, 6) + '...' : 'OFFLINE'}</span>
            </div>
            <div className="bg-bruised-purple px-2 py-1 border border-cadmium-yellow flex flex-col items-end">
              <span className="text-[10px] block leading-none">Status</span>
              <span className={`text-sm font-bold ${isAuthLoading ? 'text-cadmium-yellow animate-pulse' : authData ? 'text-primary' : 'text-red-500'}`}>{isAuthLoading ? 'VERIFYING' : authData ? 'SECURE' : 'UNVERIFIED'}</span>
            </div>
            <div className="bg-bruised-purple px-2 py-1 border border-cadmium-yellow flex flex-col items-end">
              <span className="text-[10px] block leading-none">Socket</span>
              <span className={`text-sm font-bold ${socketStatus === 'OPEN' ? 'text-primary' : socketStatus === 'CONNECTING' ? 'text-cadmium-yellow animate-pulse' : 'text-red-500'}`}>{socketStatus}</span>
            </div>
            <button className="flex items-center justify-center border border-primary p-1">
              <X className="text-primary w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Target Viewport Shell */}
      <div className={showUI ? 'p-2' : ''}>
        <div className="relative flex items-center justify-center bg-black w-full h-[320px] overflow-hidden">
          <div className="absolute inset-0"></div>

          {/* Opacity explicitly 100% to ensure bright canvas debugging validation layout limits */}
          <div id="surface00" className="w-full h-full opacity-100 [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:block" data-alt="Grim swamp landscape with thick green fog"></div>

          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-2 left-2 text-[10px] text-cadmium-yellow border-l border-t border-cadmium-yellow p-1 bg-black/50 pointer-events-auto">
              LOC: BOG_EXT_04 <br />
              POS: {gameState?.update?.x ?? '—'}, {gameState?.update?.y ?? '—'}
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] text-primary border-r border-b border-primary p-1 text-right bg-black/50 pointer-events-auto">
              TICK: {gameState?.update?.tick ?? '—'} <br />
              HP: {gameState?.update?.hp ?? '—'}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <button onClick={() => setActiveButton('MOVE FORWARD')} className={`w-full border border-primary py-4 font-bold uppercase ${activeButton === 'MOVE FORWARD' ? 'bg-primary text-black' : 'bg-bruised-purple text-primary hover:bg-primary hover:text-black active:bg-bruised-purple active:text-primary'}`}>
            Move Forward
          </button>
          <button onClick={() => setActiveButton('STAND')} className={`w-full border border-primary py-4 font-bold uppercase ${activeButton === 'STAND' ? 'bg-primary text-black' : 'bg-bruised-purple text-primary hover:bg-primary hover:text-black active:bg-bruised-purple active:text-primary'}`}>
            Stand
          </button>
          <div className="flex w-full">
            <button onClick={() => setActiveButton('SPIN RIGHT')} className={`flex-1 border border-primary py-2 font-bold uppercase ${activeButton === 'SPIN RIGHT' ? 'bg-primary text-black' : 'bg-bruised-purple text-primary hover:bg-primary hover:text-black active:bg-bruised-purple active:text-primary'}`}>
              Spin Right
            </button>
            <button onClick={() => setActiveButton('SPIN LEFT')} className={`flex-1 border border-primary py-2 font-bold uppercase ${activeButton === 'SPIN LEFT' ? 'bg-primary text-black' : 'bg-bruised-purple text-primary hover:bg-primary hover:text-black active:bg-bruised-purple active:text-primary'}`}>
              Spin Left
            </button>
          </div>
          <button onClick={() => setActiveButton('MOVE BACKWARD')} className={`w-full border border-primary py-2 font-bold uppercase ${activeButton === 'MOVE BACKWARD' ? 'bg-primary text-black' : 'bg-bruised-purple text-primary hover:bg-primary hover:text-black active:bg-bruised-purple active:text-primary'}`}>
            Move Backward
          </button>
        </div>
      </div>
    </div>
  );
}

export default GamePad;
