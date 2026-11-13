import React, { useEffect, useState } from 'react';
import { Skull, X, TriangleAlert, Play, Radar, Wind, Upload, Link, Map, Shield, Scissors, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVerifyAuth } from '../queue/access.query';
import { useGame } from '../hooks/useGame';
import './GamePad.css';

function GamePad() {
  const { authToken, setAuthToken } = useAuth();
  const { data: authData, isLoading: isAuthLoading } = useVerifyAuth();
  const { gameState, socketStatus, actions } = useGame(authToken ?? undefined);

  useEffect(() => {
    console.log('🎮 [GamePad] useEffect mounted. Initial authToken state:', authToken ? authToken.substring(0, 10) + '...' : 'NONE');
    // 1. Try to get the token from URL parameters first (Backwards compatible for Safari < 10)
    let tokenFromUrl = null;
    const searchString = window.location.search;
    console.log('🎮 [GamePad] URL Query String:', searchString);

    if (searchString && searchString.indexOf('token=') !== -1) {
      const match = searchString.match(/[?&]token=([^&]+)/);
      if (match && match[1]) {
        tokenFromUrl = decodeURIComponent(match[1]);
      }
    }

    if (tokenFromUrl) {
      console.log('🎮 [GamePad] Got token from URL: ' + tokenFromUrl.substring(0, 10) + '...');
      setAuthToken(tokenFromUrl);
      return;
    }

    // 2. If no token in URL, listen for postMessage
    const handleMessage = (event: MessageEvent) => {
      console.log('🎮 [GamePad] Received postMessage event from origin:', event.origin, 'event.data:', event.data);
      const data = event.data;
      if (data && data.type === 'CLERK_AUTH_TOKEN') {
        const payloadToken = data.payload ? data.payload.token : null;
        console.log('🎮 [GamePad] Parsed token from postMessage:', payloadToken ? payloadToken.substring(0, 10) + '...' : 'NONE');
        if (payloadToken) {
          setAuthToken(payloadToken);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    var alligator = async () => {
      setTimeout(async () => {
        const WRITE_SURFACE = '[Write action] Write Surface';
        var bit = await window['SHADE'](WRITE_SURFACE, {
          idx: 'surface00',
          src: 'surface00',
          dat: { w: 720, h: 1080 },
        });

        var stage = bit.fceBit.dat.bit.stage;

        //const WRITE_GRAPHIC = '[Write action] Write Graphic';
        //var graphic = await window['SHADE'](WRITE_GRAPHIC, { idx: 'graphic00', dat: {} });
        //graphic = graphic.gphBit.dat.bit;

        //graphic
        //  .rect(0, 0, 720, 1080) // x, y, width, height for the rectangle
        //  .fill({ color: 0x00ff00 }) // Fill with red
        //  .stroke({ width: 2, color: 0x000000 }); // Stroke with black

        //graphic.alpha = 0.8;
        //stage.addChild(graphic);

        //const WRITE_HEXAGON = '[Write action] Write Hexagon';
        //var hex = await window['SHADE'](WRITE_HEXAGON, {
        //  idx: 'hex00',
        //  src: 'hex00',
        //  dat: {
        //    dat: {
        //      typ: 'Rectangle',
        //      gph: 'graphic00',
        //    },
        //  },
        //});

        //const WRITE_SPRITE = '[Write action] Write Sprite';
        //var sprite = await window['SHADE'](WRITE_SPRITE, { idx: 'sprite00', src: './img/000.png' });
        //sprite = sprite.sprBit.dat.bit;
        //sprite.scale.x = 1;
        //sprite.scale.y = 1;

        //var stage = bit.fceBit.dat.bit.stage;
        //stage.addChild(sprite);
      }, 222);
    };

    ////CANVAS MATTER
    alligator();

    console.log('prince ali');

    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="relative bg-algae-green text-cadmium-yellow h-[1280px] w-[720px] flex flex-col border-4 border-primary m-0 reptile-pattern font-display uppercase overflow-y-auto overflow-x-hidden">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bruised-purple text-cadmium-yellow border-2 border-cadmium-yellow px-4 py-1 text-sm font-bold tracking-widest rotate-2 shadow-[4px_4px_0_0_#ec5b13] z-50 animate-pulse">002.GamePad</div>
      {/* Top Header */}
      <div className="flex items-center bg-algae-green p-3 border-b border-primary justify-between">
        <div className="flex items-center gap-2">
          <Skull className="text-primary w-8 h-8" />
          <h2 className="text-primary text-xl font-bold tracking-widest">SCRYING POOL V.08</h2>
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

      {/* 720x1080 Viewport */}
      <div className="p-2">
        <div className="relative flex items-center justify-center bg-black border-2 border-cadmium-yellow aspect-[720/1080] h-[240px] overflow-hidden">
          <div className="absolute inset-0 "></div>

          <div id="surface00" className="w-full h-full [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:block" data-alt="Grim swamp landscape with thick green fog">
            {' '}
          </div>

          {/* Touch Blocker & HUD Overlays */}
          <div className="absolute inset-0 z-10">
            <div className="absolute top-2 left-2 text-[10px] text-cadmium-yellow border-l border-t border-cadmium-yellow p-1 bg-black/50">
              LOC: BOG_EXT_04
              <br />
              POS: {gameState?.update?.x ?? '—'}, {gameState?.update?.y ?? '—'}
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] text-primary border-r border-b border-primary p-1 text-right bg-black/50">
              TICK: {gameState?.update?.tick ?? '—'}
              <br />
              HP: {gameState?.update?.hp ?? '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="px-2 pb-2">
        <div className="bg-bruised-purple border border-cadmium-yellow p-1 flex justify-between items-center px-3">
          <span className="text-xs font-bold animate-pulse">CRITICAL HAZARD: MIRE SATURATION L-4</span>
          <TriangleAlert className="w-4 h-4 text-cadmium-yellow" />
        </div>
      </div>

      {/* Tactical Buttons (Vertical Stack) */}
      <div className="flex-1 px-2 flex flex-col gap-2">
        <h3 className="text-primary text-xs font-bold tracking-tighter italic">TACTICAL OVERRIDE_</h3>
        <button onClick={() => actions.move(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100))} className="flex items-center justify-between border-2 border-cadmium-yellow bg-algae-green px-4 py-3 hover:bg-cadmium-yellow hover:text-algae-green active:bg-cadmium-yellow active:text-algae-green transition-colors group">
          <span className="font-bold tracking-widest">PULSE SCAN</span>
          <Radar className="w-6 h-6 group-hover:text-algae-green" />
        </button>
        <button onClick={() => actions.attack()} className="flex items-center justify-between border-2 border-cadmium-yellow bg-algae-green px-4 py-3 hover:bg-cadmium-yellow hover:text-algae-green active:bg-cadmium-yellow active:text-algae-green transition-colors group">
          <span className="font-bold tracking-widest">VENT GAS</span>
          <Wind className="w-6 h-6 group-hover:text-algae-green" />
        </button>
        <button className="flex items-center justify-between border-2 border-cadmium-yellow bg-algae-green px-4 py-3 hover:bg-cadmium-yellow hover:text-algae-green active:bg-cadmium-yellow active:text-algae-green transition-colors group">
          <span className="font-bold tracking-widest">EMERGENCY LIFT</span>
          <Upload className="w-6 h-6 group-hover:text-algae-green" />
        </button>
        <button className="flex items-center justify-between border-2 border-primary bg-[rgba(236,91,19,0.2)] px-4 py-3 hover:bg-primary hover:text-algae-green active:bg-primary active:text-algae-green transition-colors group">
          <span className="font-bold tracking-widest text-primary group-hover:text-algae-green">MIRE-LINK</span>
          <Link className="text-primary w-6 h-6 group-hover:text-algae-green" />
        </button>
      </div>

      {/* Chat Log / Biological Artifact Data */}
      <div className="mx-2 my-2 border-2 border-primary bg-black/40 p-2 h-32 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-all">
        <div className="text-[10px] leading-tight space-y-1 font-mono">
          <p className="text-cadmium-yellow/60">
            [14:02] <span className="text-primary">SYSTEM:</span> CALIBRATING VISION SPHERES...
          </p>
          <p className="text-cadmium-yellow">
            [14:03] <span className="text-cadmium-yellow font-bold">WRAITH_7:</span> ANYONE SEE THE SPIRES YET?
          </p>
          <p className="text-cadmium-yellow/60">
            [14:03] <span className="text-primary">SYSTEM:</span> AMBIENT TOXICITY RISING.
          </p>
          <p className="text-cadmium-yellow">
            [14:04] <span className="text-cadmium-yellow font-bold">MOSS_LORD:</span> STICK TO THE RUSTED PATH.
          </p>
          <p className="text-primary font-bold animate-pulse">[14:05] WARNING: BIO-SIGNATURE DETECTED IN SECTOR 7G</p>
          <div className="flex items-center gap-1 mt-1 border-t border-primary/30 pt-1">
            <span className="text-primary">&gt;</span>
            <span className="animate-ping w-1 h-3 bg-primary"></span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex border-t border-primary bg-algae-green px-1 py-2">
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-cadmium-yellow bg-primary/20 border border-primary mx-1 py-1" href="#">
          <Map className="w-6 h-6" />
        </a>
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-primary border border-primary/40 mx-1 py-1" href="#">
          <Shield className="w-6 h-6" />
        </a>
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-primary border border-primary/40 mx-1 py-1" href="#">
          <Scissors className="w-6 h-6" />
        </a>
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-primary border border-primary/40 mx-1 py-1" href="#">
          <Settings className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}

export default GamePad;
