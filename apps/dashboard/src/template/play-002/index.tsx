import React, { useState, useEffect, useRef } from 'react';
import './index.css';

export default function App() {
  const [vesselLogs, setVesselLogs] = useState([
    { time: '21:04', sender: 'THE MUSE', message: "The King's heart rate spikes. Your intuition was correct.", type: 'system' },
    { time: '21:04', sender: 'PATRON', message: 'Do not trust the King. Ask him about the poisoned chalice.', type: 'patron' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [motionState, setMotionState] = useState<'STOPPED TO SMELL THE ROSES' | 'MOVE FORWARD' | 'MOVE BACKWARD' | 'SPIN CLOCKWISE' | 'SPIN COUNTERCLOCKWISE'>('STOPPED TO SMELL THE ROSES');
  const [isViewportFullscreen, setIsViewportFullscreen] = useState(false);
  const [isStatSheetOpen, setIsStatSheetOpen] = useState(false);
  const [lastTick, setLastTick] = useState<number>(Date.now());
  const [wsTickDiff, setWsTickDiff] = useState<number>(1142);
  const [bpm, setBpm] = useState<number>(112);
  const [activeFateTab, setActiveFateTab] = useState<'SENSES' | 'FATE'>('SENSES');

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formattedDateTime =
    currentTime
      .toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      .toUpperCase() +
    ' — ' +
    currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  useEffect(() => {
    const timer = setInterval(
      () => {
        const now = Date.now();
        setLastTick((prev) => {
          setWsTickDiff(now - prev);
          return now;
        });
      },
      1200 + Math.random() * 600
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const bpmInterval = setInterval(() => {
      setBpm((prev) => {
        const roll = Math.random();
        if (roll < 0.2) return 111;
        if (roll > 0.8) return 113;
        return 112;
      });
    }, 3000);
    return () => clearInterval(bpmInterval);
  }, []);

  const [castHistory, setCastHistory] = useState<Array<{ action: string; roll: string; dc: number; score: number; success: boolean }>>([
    { action: 'STEALTH PAST THE ROYAL GUARD', roll: '14 + 5 (AGI)', dc: 18, score: 19, success: true },
    { action: 'ASSESS CHALICE AUTHENTICITY', roll: '8 + 3 (INT)', dc: 10, score: 11, success: true },
    { action: 'DECODE MAINFRAME MASTER SEAL', roll: '5 + 4 (DEX)', dc: 15, score: 9, success: false },
    { action: 'MUFFLE PLATE-MAIL GIMBAL', roll: '12 + 2 (STEALTH)', dc: 11, score: 14, success: true },
    { action: 'INSPECT PRIMARY ENGAGEMENT LOGS', roll: '16 + 3 (INT)', dc: 12, score: 19, success: true },
  ]);

  const addCastRecord = (actionLabel: string, modifier: string, modifierVal: number, dc: number) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const finalScore = d20 + modifierVal;
    const isSuccess = finalScore >= dc;

    setCastHistory((prev) => {
      const newItem = {
        action: actionLabel.toUpperCase(),
        roll: `${d20} + ${modifierVal} (${modifier})`,
        dc,
        score: finalScore,
        success: isSuccess,
      };
      return [newItem, ...prev].slice(0, 5);
    });
  };

  const logContainerRef = useRef<HTMLDivElement>(null);

  const renderViewport = (isFullscreenMode: boolean) => {
    return (
      <div id="vessel-viewport" className={`relative aspect-[16/9] border-[4px] border-ink bg-ink overflow-hidden group p-2 transition-all duration-500 ease-in-out ${isFullscreenMode ? 'w-full max-w-[1280px] max-h-[720px] shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'w-full max-w-[1280px] mx-auto block-shadow mb-8'}`}>
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-paper text-ink font-label-sm font-bold tracking-widest px-3 py-1 border-2 border-ink block-shadow select-none">{isFullscreenMode ? 'IMMERSIVE VIEWPORT' : 'REFERENCE: OPERATIONS PLAN'} [1280 × 720]</span>
        </div>

        {/* Hard to see close button in Fullscreen mode */}
        {isFullscreenMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsViewportFullscreen(false);
            }}
            className="absolute top-4 right-32 z-30 opacity-[0.14] hover:opacity-100 hover:text-dark-orange hover:border-dark-orange text-paper font-mono text-[10px] tracking-widest bg-transparent border border-paper/10 px-2 py-1 cursor-pointer transition-all duration-300"
            title="Terminate transmission and close frame"
          >
            DISCONNECT / CLOSE ×
          </button>
        )}

        <div className="relative w-full h-full border-[2px] border-surface/20 flex items-center justify-center overflow-hidden">
          <img alt="Live action cinematic view" className={`w-full h-full object-cover filter grayscale contrast-125 opacity-90 transition-all duration-700 ease-in-out ${motionState === 'MOVE FORWARD' ? 'scale-125 -translate-y-2' : motionState === 'MOVE BACKWARD' ? 'scale-90 translate-y-2' : motionState === 'SPIN CLOCKWISE' ? 'scale-110 rotate-12' : motionState === 'SPIN COUNTERCLOCKWISE' ? 'scale-110 -rotate-12' : 'scale-105'}`} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkGvJfHvVD_5Gdv7OlO87ALoDCWeUvItmAdlBk0yrG2Q9JeIkYBHyw3zmqrjaEBZpExWwFtR9iRqMYPx5ZW8cjBp0QGIX1htE24-0ExZKhLhVG8f5DAaXDCWp1r-RpcT0oG_dUFCny4G2V9sCTiOGqSV248xa9GYnKN1Tv0WyvC4WmA5KTPm3P5vv6Pb6gqUrSZIx7G9f68JtSSqX0t6JDqJx55_1fhzzaKnvfT4Y4svC8B2jnBPMBok6Ra1CDc_8IOhl-qO6tJ9h5" />
          {/* Inner Monologue Subtitles */}
          <div className="absolute bottom-8 inset-x-8 text-center pointer-events-none">
            <p className="font-sans text-ink bg-paper font-bold text-lg uppercase tracking-widest px-6 py-3 inline-block border-[3px] border-ink block-shadow tremble">{motionState === 'MOVE FORWARD' ? '"Engaging forward propulsion thrusters. Moving deeper into the chamber..."' : motionState === 'MOVE BACKWARD' ? '"Engaging reverse thrust retrograde. Retracting trajectory before detection..."' : motionState === 'SPIN CLOCKWISE' ? '"Initiating clockwise rotation. Scanning right-hand perimeter for threats..."' : motionState === 'SPIN COUNTERCLOCKWISE' ? '"Initiating counter-clockwise rotation. Mapping left-hand dark spots..."' : motionState === 'STOPPED TO SMELL THE ROSES' ? '"Standing still. Taking a quiet moment to smell the roses in this ancient chamber..."' : '"The Paladin lies. You can see the sweat on his brow. His coin purse is heavy. Take it."'}</p>
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
            <div className="bg-ink border-[2px] border-ink px-3 py-2 text-right block-shadow">
              <div className="font-label-sm font-bold text-danger flex items-center justify-end gap-2 mb-1">
                <span className="w-2 h-2 bg-danger rounded-full animate-pulse"></span>
                REC [LIVE]
              </div>
              <div className="font-code-md text-paper">00:48:12:09</div>
            </div>
            <div className="bg-white text-ink border-[2px] border-ink px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase block-shadow">1280 × 720 PX</div>
          </div>
        </div>
      </div>
    );
  };

  const handleConverse = () => {
    addCastRecord('Dialogue Check with Sovereign', 'CHA', 2, 12);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVesselLogs((prev) => [
      ...prev,
      {
        time: timeStr,
        sender: 'THE VESSEL',
        message: '(Steps forward, looking straight in the eyes of the King.) "Is there any truth to the rumors of the northern armies, your grace?"',
        type: 'vessel',
      },
      {
        time: timeStr,
        sender: 'THE MUSE (SYSTEM)',
        message: 'Dialogue channel active. Dynamic negotiation multipliers engaged.',
        type: 'system',
      },
    ]);
  };

  const handleFireCrossbow = () => {
    addCastRecord('Fire Crossbow Bolt', 'DEX', 4, 15);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVesselLogs((prev) => [
      ...prev,
      {
        time: timeStr,
        sender: 'THE VESSEL',
        message: '*CLACK* (A heavy bolt flies from the wrist-launcher, splintering the arm of the throne.)',
        type: 'vessel',
      },
      {
        time: timeStr,
        sender: 'THE MUSE (SYSTEM)',
        message: 'Aggression threshold crossed. Guard alerts toggled to maximum. Threat initialized.',
        type: 'system',
      },
    ]);
  };

  const handleSpellCast = () => {
    addCastRecord('Cast Cognizant Cantrip', 'INT', 3, 13);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVesselLogs((prev) => [
      ...prev,
      {
        time: timeStr,
        sender: 'THE VESSEL',
        message: '*VIBRATE* (Humming static surges from fingers, projecting a holographic distortion shield.)',
        type: 'vessel',
      },
      {
        time: timeStr,
        sender: 'THE MUSE (SYSTEM)',
        message: 'Aetheric turbulence detected. Reality stabilization protocols running at 94%.',
        type: 'system',
      },
    ]);
  };

  const handleJump = () => {
    addCastRecord('Evade Crumbling Floorboards', 'AGI', 4, 11);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVesselLogs((prev) => [
      ...prev,
      {
        time: timeStr,
        sender: 'THE VESSEL',
        message: '*LEAP* (Propelling upwards directly off the rusted copper valve to clear the gap.)',
        type: 'vessel',
      },
      {
        time: timeStr,
        sender: 'THE MUSE (SYSTEM)',
        message: 'Altitude threshold registered. Kinetic force dampened upon impact.',
        type: 'system',
      },
    ]);
  };

  const changeMotionState = (state: 'STOPPED TO SMELL THE ROSES' | 'MOVE FORWARD' | 'MOVE BACKWARD' | 'SPIN CLOCKWISE' | 'SPIN COUNTERCLOCKWISE') => {
    const nextState = motionState === state ? 'STOPPED TO SMELL THE ROSES' : state;
    setMotionState(nextState);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (nextState !== 'STOPPED TO SMELL THE ROSES') {
      addCastRecord(`Steer: ${nextState}`, 'AGI', 3, 10);
      setVesselLogs((prev) => [
        ...prev,
        {
          time: timeStr,
          sender: 'THE VESSEL',
          message: `Active motion command triggered: [${nextState}]. Steering unit adjusts alignment vectors.`,
          type: 'vessel',
        },
        {
          time: timeStr,
          sender: 'THE MUSE (SYSTEM)',
          message: `Telemetry divergence locked at [${nextState}]. Analyzing trajectory drift.`,
          type: 'system',
        },
      ]);
    } else {
      setVesselLogs((prev) => [
        ...prev,
        {
          time: timeStr,
          sender: 'THE VESSEL',
          message: `Movement cancelled. Stabilizer matrix locked at hold coordinate.`,
          type: 'vessel',
        },
        {
          time: timeStr,
          sender: 'THE MUSE (SYSTEM)',
          message: `Telemetry notification: All engines zeroed. Holding coordinate baseline.`,
          type: 'system',
        },
      ]);
    }
  };

  // Auto-logs simulation for Vessel
  useEffect(() => {
    const t1 = setTimeout(() => {
      setVesselLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'THE VESSEL',
          message: '(Glances down at the unseen cipher. Steps back from the throne.) "I think I will pour my own wine, your grace."',
          type: 'vessel',
        },
      ]);
    }, 6000);

    const t2 = setTimeout(() => {
      setVesselLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'THE MUSE',
          message: 'Fate altered. Path divergence recorded.',
          type: 'system',
        },
      ]);
    }, 8000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const activeLogs = vesselLogs;

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [vesselLogs.length]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    addCastRecord('Transmit Directive', 'RESOLVE', 5, 14);
    const newLog = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'PATRON',
      message: chatInput,
      type: 'patron',
    };
    setVesselLogs([...vesselLogs, newLog]);
    setChatInput('');
  };

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center p-gutter relative selection:bg-ink selection:text-paper overflow-x-hidden">
      <section className="max-w-[1100px] w-full flex flex-col stretch relative z-10 py-6 font-sans">
        {/* THE MARQUEE */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-[4px] border-ink pb-4 mb-4 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-ink text-paper font-label-sm px-2 py-1 tracking-widest font-bold">{formattedDateTime}</span>
              <span className="font-label-sm text-ink font-bold tracking-widest">ARCHIVE STATUS: SECURE</span>
            </div>
            <h1 className="font-sans-title text-3xl text-ink leading-tight tracking-tighter mb-0">THE EYES OF ELARA</h1>
          </div>
          <div className="flex flex-col items-end gap-1 mb-2">
            <span className="font-label-sm text-ink font-bold tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger inline-block animate-pulse"></span>
              THE VEIL IS OPEN
            </span>
          </div>
        </div>

        {/* THE VESSEL'S GAZE (Viewport) */}
        {renderViewport(false)}

        {/* THE ANATOMY OF CONSEQUENCE (Stats & Intercom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-8">
          {/* Left Column: THE ARSENAL Actions, and THE CALCULUS OF FATE below it */}
          <div className="flex flex-col gap-6">
            {/* The Arsenal */}
            <div className="flex flex-col gap-3">
              <div className="border-b-[4px] border-ink pb-2 mb-2 flex justify-between items-end">
                <h3 className="font-sans-title text-2xl text-ink leading-tight">THE ARSENAL</h3>
                <span className="font-code-md text-xs font-bold text-ink-light bg-paper border border-ink px-1.5 py-0.5">{motionState}</span>
              </div>

              {/* Tactical Actions (Now standard light style at top) */}
              <div className="grid grid-cols-2 gap-3 mb-1">
                <button onClick={handleConverse} className="p-3.5 border-[3px] border-ink bg-surface text-ink hover:bg-dark-orange hover:text-paper transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-center">
                  <span className="font-label-sm font-bold tracking-widest uppercase">CONVERSE</span>
                </button>

                <button onClick={handleFireCrossbow} className="p-3.5 border-[3px] border-ink bg-surface text-ink hover:bg-dark-orange hover:text-paper transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-center">
                  <span className="font-label-sm font-bold tracking-widest uppercase">FIRE CROSS BOW</span>
                </button>

                <button onClick={handleSpellCast} className="p-3.5 border-[3px] border-ink bg-surface text-ink hover:bg-dark-orange hover:text-paper transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-center">
                  <span className="font-label-sm font-bold tracking-widest uppercase">SPELL CAST</span>
                </button>

                <button onClick={handleJump} className="p-3.5 border-[3px] border-ink bg-surface text-ink hover:bg-dark-orange hover:text-paper transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-center">
                  <span className="font-label-sm font-bold tracking-widest uppercase">JUMP</span>
                </button>
              </div>

              {/* Center Divider Line preserved */}
              <div className="border-b-[4px] border-ink my-1"></div>

              {/* Navigation and Thrust Controls (Now inverse color buttons below the center line) */}
              <div className="flex flex-col gap-3">
                <button onClick={() => changeMotionState('MOVE FORWARD')} className={`w-full p-3.5 border-[3px] border-ink flex flex-col items-center justify-center transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${motionState === 'MOVE FORWARD' ? 'bg-surface text-ink' : 'bg-ink text-paper hover:bg-dark-orange hover:text-paper'}`}>
                  <div className="flex items-center gap-2">
                    {motionState === 'MOVE FORWARD' && <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span>}
                    <span className="font-label-sm font-bold tracking-widest uppercase">MOVE FORWARD</span>
                  </div>
                </button>

                <button onClick={() => changeMotionState('MOVE BACKWARD')} className={`w-full p-3.5 border-[3px] border-ink flex flex-col items-center justify-center transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${motionState === 'MOVE BACKWARD' ? 'bg-surface text-ink' : 'bg-ink text-paper hover:bg-dark-orange hover:text-paper'}`}>
                  <div className="flex items-center gap-2">
                    {motionState === 'MOVE BACKWARD' && <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span>}
                    <span className="font-label-sm font-bold tracking-widest uppercase">MOVE BACKWARD</span>
                  </div>
                </button>

                <button onClick={() => changeMotionState('SPIN CLOCKWISE')} className={`w-full p-3.5 border-[3px] border-ink flex flex-col items-center justify-center transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${motionState === 'SPIN CLOCKWISE' ? 'bg-surface text-ink' : 'bg-ink text-paper hover:bg-dark-orange hover:text-paper'}`}>
                  <div className="flex items-center gap-2">
                    {motionState === 'SPIN CLOCKWISE' && <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span>}
                    <span className="font-label-sm font-bold tracking-widest uppercase">SPIN CLOCKWISE</span>
                  </div>
                </button>

                <button onClick={() => changeMotionState('SPIN COUNTERCLOCKWISE')} className={`w-full p-3.5 border-[3px] border-ink flex flex-col items-center justify-center transition-all cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${motionState === 'SPIN COUNTERCLOCKWISE' ? 'bg-surface text-ink' : 'bg-ink text-paper hover:bg-dark-orange hover:text-paper'}`}>
                  <div className="flex items-center gap-2">
                    {motionState === 'SPIN COUNTERCLOCKWISE' && <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span>}
                    <span className="font-label-sm font-bold tracking-widest uppercase">SPIN COUNTERCLOCKWISE</span>
                  </div>
                </button>
              </div>
            </div>

            {/* THE CALCULUS OF FATE / SENSES */}
            <div className="border-[3px] border-ink bg-surface block-shadow flex flex-col h-[480px]">
              <div className="bg-ink text-paper flex border-b-[3px] border-ink select-none shrink-0">
                <button onClick={() => setActiveFateTab('SENSES')} className={`flex-1 py-3 px-4 font-label-sm font-bold tracking-widest text-center cursor-pointer transition-all ${activeFateTab === 'SENSES' ? 'bg-surface text-ink' : 'bg-ink text-paper/80 hover:bg-dark-orange hover:text-paper'}`}>
                  [SENSES]
                </button>
                <button onClick={() => setActiveFateTab('FATE')} className={`flex-1 py-3 px-4 font-label-sm font-bold tracking-widest text-center cursor-pointer transition-all border-l-[3px] border-ink ${activeFateTab === 'FATE' ? 'bg-surface text-ink' : 'bg-ink text-paper/80 hover:bg-dark-orange hover:text-paper'}`}>
                  CALCULUS OF FATE
                </button>
              </div>

              {activeFateTab === 'SENSES' ? (
                <div className="p-5 flex flex-col h-[420px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {/* PHYSICAL EXITS */}
                    <div className="border border-ink/20 p-3 bg-paper/50 block-shadow">
                      <div className="flex items-center gap-1.5 font-label-sm text-ink-light border-b border-ink/20 pb-1.5 mb-2 font-bold tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">door_open</span>
                        <span>PHYSICAL EXITS</span>
                      </div>
                      <div className="space-y-2 font-mono text-xs text-ink">
                        <div className="flex justify-between items-center bg-white p-1.5 border border-ink/10">
                          <span className="font-bold">SOUTHERN THRONE PORTAL</span>
                          <span className="text-[9px] bg-emerald-100 text-[#1b5e20] border border-emerald-500 font-bold px-1 uppercase">UNLOCKED</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-1.5 border border-ink/10">
                          <span className="font-bold">HIDDEN ROTATIONAL PASSAGE</span>
                          <span className="text-[9px] bg-[#fff3e0] text-[#e65100] border border-[#ffb74d] font-bold px-1 uppercase">SECRET</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-1.5 border border-ink/10">
                          <span className="font-bold">VENTILATION CONDUIT ROTOR</span>
                          <span className="text-[9px] bg-red-100 text-danger border border-danger/40 font-bold px-1 uppercase">IMPEDED</span>
                        </div>
                      </div>
                    </div>

                    {/* LIFE SIGNS & NPCs */}
                    <div className="border border-ink/20 p-3 bg-paper/50 block-shadow">
                      <div className="flex items-center gap-1.5 font-label-sm text-ink-light border-b border-ink/20 pb-1.5 mb-2 font-bold tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        <span>OTHER LIFE SIGNS (NPCs)</span>
                      </div>
                      <div className="space-y-2 font-mono text-xs text-ink">
                        <div className="bg-white p-2 border border-ink/10 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-ink">THE REIGNING SOVEREIGN</span>
                            <span className="font-bold text-danger animate-pulse text-[10px]">HEART SPIKE</span>
                          </div>
                          <p className="text-[11px] text-ink-light leading-snug">Sweating, heavy chest breathing pattern observed. Signs of deception are extremely high (112 BPM).</p>
                        </div>
                        <div className="bg-white p-2 border border-ink/10 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-ink">ROYAL PALADIN GUARD</span>
                            <span className="text-ink-light text-[10px] font-bold">STEALTH MUTED</span>
                          </div>
                          <p className="text-[11px] text-ink-light leading-snug">Standing at high attention. Greased joints muffle armor static feedback. Coin purse has 800+ grain weights.</p>
                        </div>
                      </div>
                    </div>

                    {/* DETECTED TREASURE */}
                    <div className="border border-ink/20 p-3 bg-paper/50 block-shadow">
                      <div className="flex items-center gap-1.5 font-label-sm text-ink-light border-b border-ink/20 pb-1.5 mb-2 font-bold tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">stars</span>
                        <span>TREASURE & KEY OBJECTS</span>
                      </div>
                      <div className="space-y-2 font-mono text-xs text-ink">
                        <div className="flex justify-between items-center bg-white p-1.5 border border-ink/10">
                          <div className="flex flex-col">
                            <span className="font-bold">POISONED ROYAL CHALICE</span>
                            <span className="text-[10px] text-ink-light font-bold">Plated heavy silver</span>
                          </div>
                          <span className="text-[9px] bg-red-100 text-danger border border-danger/40 font-bold px-1.5 py-0.5 uppercase">BELLADONNA DETECTED</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-1.5 border border-ink/10">
                          <div className="flex flex-col">
                            <span className="font-bold">CYBERNETIC COGNIZANT MEMORY BOARD</span>
                            <span className="text-[10px] text-ink-light font-bold">Somatic storage format</span>
                          </div>
                          <span className="text-[9px] bg-emerald-100 text-[#1b5e20] border border-emerald-500 font-bold px-1.5 py-0.5 uppercase">SECURED</span>
                        </div>
                      </div>
                    </div>

                    {/* ENVIRONMENTAL / TEMPERATURE */}
                    <div className="border border-ink/20 p-3 bg-paper/50 block-shadow">
                      <div className="flex items-center gap-1.5 font-label-sm text-ink-light border-b border-ink/20 pb-1.5 mb-2 font-bold tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">device_thermostat</span>
                        <span>ENVIRONMENTAL READINGS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs text-ink">
                        <div className="bg-white p-2 border border-ink/10 text-center">
                          <span className="text-[10px] text-ink-light block uppercase font-bold mb-0.5">TEMPERATURE</span>
                          <span className="text-sm font-bold text-ink">14.8°C / 58.6°F</span>
                          <span className="text-[9px] block text-ink-light/70 uppercase">Chilly, drafty</span>
                        </div>
                        <div className="bg-white p-2 border border-ink/10 text-center">
                          <span className="text-[10px] text-ink-light block uppercase font-bold mb-0.5">RESONANCE</span>
                          <span className="text-sm font-bold text-indigo-700">4.2 MHz stable</span>
                          <span className="text-[9px] block text-indigo-700/70 uppercase">Slight magic bleed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 flex flex-col h-[420px] justify-between overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col mb-4">
                    <span className="font-label-sm text-ink-light font-bold mb-2">LAST ACTION</span>
                    <span className="font-sans-subtitle text-ink text-lg leading-tight border-l-[4px] border-ink pl-3">{castHistory[0] ? castHistory[0].action : 'NO LOG RECORDED'}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end border-b-[2px] border-ink pb-2">
                      <span className="font-label-sm text-ink font-bold">TARGET DC:</span>
                      <span className="font-sans-title text-2xl text-ink">{castHistory[0] ? castHistory[0].dc : '—'}</span>
                    </div>
                    <div className="flex flex-col mt-2">
                      <span className="font-label-sm text-ink-light font-bold mb-1">LATEST CAST OF BONE:</span>
                      <div className="font-code-md text-ink border-[2px] border-ink p-3 text-center bg-paper font-bold block-shadow">
                        {castHistory[0] ? (
                          <>
                            {castHistory[0].roll} = <span className="text-xl mx-1">{castHistory[0].score}</span> <span className={`px-2 py-0.5 ml-2 uppercase text-xs border border-ink ${castHistory[0].success ? 'bg-ink text-paper' : 'bg-paper text-ink opacity-60'}`}>{castHistory[0].success ? 'SUCCESS' : 'FAILURE'}</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </div>
                    </div>

                    {/* Tiny list displays the last five actions and their outcome */}
                    <div className="flex flex-col mt-4 border-t-[2px] border-ink pt-3">
                      <span className="font-label-sm text-ink-light font-bold mb-2 uppercase tracking-wide">RECENT ACTIONS & OUTCOMES</span>
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {castHistory.map((hist, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs font-mono border-b border-ink/5 pb-1.5 last:border-0 last:pb-0">
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-bold text-ink truncate uppercase text-[11px]">{hist.action}</span>
                              <span className="text-ink-light text-[10px]">
                                Cast: {hist.roll} = {hist.score} (DC {hist.dc})
                              </span>
                            </div>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0 border border-ink ${hist.success ? 'bg-ink text-paper' : 'bg-paper text-ink opacity-50'}`}>{hist.success ? 'SUCCESS' : 'FAILURE'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: STREAM - Swapped in */}
          <div className="border-[3px] border-ink bg-surface block-shadow flex flex-col h-[520px]">
            {/* Dynamic Comms Header with Direct Field inside the Black Box wrapper */}
            <div className="flex flex-col border-b-[3px] border-ink bg-ink text-paper">
              <div className="flex items-center justify-between px-6 py-4">
                <span className="font-label-md tracking-widest font-bold">STREAM</span>
                <div className="flex items-center gap-1.5 font-label-sm tracking-widest text-[#2e7d32]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  CONNECTED ({wsTickDiff}ms)
                </div>
              </div>
              {/* Enter directive input right here inside the black box header */}
              <div className="px-6 pb-5 pt-1 border-t border-paper/10">
                <div className="relative flex gap-4">
                  <input className="flex-1 bg-paper text-ink border-[2px] border-paper block-shadow font-mono px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-paper transition-all placeholder:text-ink-light/50" placeholder="Enter directive..." type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                  <button className="bg-paper text-ink border-[2px] border-paper px-6 flex items-center justify-center hover:bg-dark-orange hover:text-paper hover:border-dark-orange transition-colors cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none" onClick={handleSendMessage}>
                    <span className="font-label-md font-bold tracking-widest text-lg px-2">TRANSMIT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Log Output */}
            <div ref={logContainerRef} className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 0H0V20H20V0ZM19 1H1V19H19V1Z%22 fill=%22%23111111%22 fill-opacity=%220.03%22/%3E%3C/svg%3E')]">
              {activeLogs.map((log, idx) => (
                <div key={idx} className={`flex gap-4 fade-in ${log.sender === 'PATRON' ? 'flex-row-reverse' : ''}`}>
                  <span className="font-label-sm text-ink-light shrink-0 mt-3 font-bold">[{log.time}]</span>
                  <div className={`p-4 border-[2px] border-ink max-w-[80%] block-shadow ${log.sender === 'PATRON' ? 'bg-surface' : 'bg-white'}`}>
                    <span className={`font-label-sm block mb-2 tracking-widest border-b-[2px] border-ink pb-1 ${log.sender === 'PATRON' ? 'text-ink text-right' : 'text-ink-light'}`}>{log.sender}</span>
                    <p className={`font-mono text-sm leading-relaxed ${log.sender === 'PATRON' ? 'font-bold' : ''}`}>{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* THE THREAD OF FATES / SOMATIC ACCESS (Bottom Row) */}
        <div className="mt-2 flex flex-col lg:flex-row gap-8">
          {/* Left panel: THE PHYSICAL VESSEL - Swapped in */}
          <div className="flex-1 border-[3px] border-ink bg-surface block-shadow flex flex-col justify-between">
            <div>
              <div className="bg-ink text-paper px-4 py-2 flex justify-between items-center border-b-[3px] border-ink">
                <span className="font-label-sm tracking-widest font-bold">THE PHYSICAL VESSEL</span>
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col border-b-[2px] md:border-b-0 md:border-r-[2px] border-ink pb-4 md:pb-0 md:pr-6 relative">
                  <span className="font-label-sm text-ink-light font-bold mb-1">VITALITY (HP)</span>
                  <span className="font-sans-title text-4xl text-ink">
                    34 <span className="text-2xl text-ink-light">/ 45</span>
                  </span>
                  <div className="absolute bottom-0 md:bottom-[-2px] left-0 h-[3px] bg-danger w-[75%] z-10 transition-all duration-1005"></div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex justify-between items-center border-b-[2px] border-ink pb-2 border-dashed">
                    <span className="font-label-sm text-ink-light font-bold">EXHAUSTION LEVEL</span>
                    <span className="font-code-md text-danger font-bold text-xl tremble">2</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-label-sm text-ink-light font-bold">ACTIVE EFFECTS</span>
                    <span className="font-sans-subtitle text-ink bg-paper border-[2px] border-ink px-2 py-0.5 ml-2 text-sm text-right">THE MIDAS TOUCH</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
              {/* VESSEL HEART RATE & STRESS METRIC WIDGET */}
              <div className="border-t border-ink/20 pt-4 flex flex-col gap-3">
                {/* Reduced size Stress Metric over Vessel Heart Rate */}
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-ink-light font-bold text-xs">STRESS METRIC</span>
                  <span className="bg-danger text-paper border border-ink font-label-sm font-bold px-2 py-0.5 block-shadow tracking-widest text-[9px] pointer-events-none select-none">ELEVATED</span>
                </div>

                <div className="border-b border-ink/10"></div>

                <div className="flex justify-between items-end mb-1">
                  <span className="font-label-sm text-ink-light font-bold">VESSEL HEART RATE</span>
                  <span className="font-sans font-bold text-2xl tracking-tight text-danger select-none">{bpm} BPM</span>
                </div>

                {/* Waveform Box */}
                <div className="w-full bg-[#f4f1ea] border-[3px] border-ink p-1.5 h-16 block-shadow relative overflow-hidden flex items-center">
                  <svg viewBox="0 0 500 40" className="w-full h-full" preserveAspectRatio="none">
                    {/* Subtle grid lines background inside waveform */}
                    <pattern id="ekg-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#111111" strokeWidth="0.5" strokeOpacity="0.04" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#ekg-grid)" />

                    {/* EKG pulse line */}
                    <path d="M 0 20 L 120 20 L 135 12 L 150 28 L 160 20 L 180 20 L 195 4 L 210 36 L 225 20 L 280 20 L 295 10 L 310 30 L 325 20 L 350 20 L 365 2 L 380 38 L 395 20 L 500 20" fill="none" stroke="#b3261e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ekg-pulse" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: THE SOMATIC TETHER */}
          <div className="w-full lg:w-[350px] flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              {/* Character Stat Sheet Button (Long, thin heighted) */}
              <button className="w-full py-2 px-4 border-[3px] border-ink bg-surface text-ink hover:bg-dark-orange hover:text-paper transition-all flex items-center justify-center gap-2 cursor-pointer block-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0_0_0_#111111]" onClick={() => setIsStatSheetOpen(true)}>
                <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                <span className="font-sans-subtitle text-xs font-bold tracking-widest uppercase">CHARACTER STAT SHEET</span>
              </button>

              {/* Full Screen Action */}
              <button className="w-full py-5 border-[4px] border-ink bg-surface text-ink hover:bg-dark-orange hover:text-paper transition-all flex items-center justify-center gap-3 cursor-pointer block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0_0_0_#111111]" onClick={() => setIsViewportFullscreen(true)}>
                <span className="material-symbols-outlined text-[28px]">fullscreen</span>
                <span className="font-sans-subtitle text-2xl tracking-widest">EXPERIENCE IN IMMERSIVE MODE</span>
              </button>
            </div>

            {/* The Somatic Tether */}
            <div className="w-full border-[3px] border-ink p-6 bg-surface flex flex-col items-center justify-center gap-4 relative block-shadow text-center">
              <div className="flex items-center justify-between w-full border-b-[2px] border-ink pb-2">
                <span className="font-label-sm tracking-widest font-bold">DIGITAL AUTHENTICATION KEY</span>
                <span className="material-symbols-outlined">qr_code_scanner</span>
              </div>
              <p className="font-code-md text-ink-light text-sm mt-2 font-bold">Scan cipher to witness on hand held device.</p>

              <div className="p-3 border-[2px] border-ink bg-white mt-2 inline-block block-shadow group hover:-translate-y-1 transition-transform duration-300">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/somatic-tether&color=111111&bgcolor=ffffff" alt="Somatic Tether Cipher" className="w-[120px] aspect-square opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Transmission Overlay */}
      {isViewportFullscreen && (
        <div id="fullscreen-overlay" className="fixed inset-0 bg-ink/95 z-50 flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in" onClick={() => setIsViewportFullscreen(false)}>
          {/* Prevent clicks inside the viewport container from closing it */}
          <div className="w-full max-w-[1280px] aspect-[16/9]" onClick={(e) => e.stopPropagation()}>
            {renderViewport(true)}
          </div>

          <div className="text-center mt-4 pointer-events-none select-none opacity-40">
            <p className="font-code-md text-[10px] tracking-widest uppercase text-paper">Click anywhere outside of the frame or use the faint [ DISCONNECT / CLOSE × ] key to exit.</p>
          </div>
        </div>
      )}

      {/* CHARACTER STAT SHEET MODAL */}
      {isStatSheetOpen && (
        <div id="stat-sheet-modal" className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsStatSheetOpen(false)}>
          <div className="bg-paper border-[4px] border-ink p-6 max-w-md w-full block-shadow relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b-[3px] border-ink pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-ink font-bold">psychology</span>
                <span className="font-label-md font-bold tracking-widest uppercase">THE VESSEL : D3-999</span>
              </div>
              <button onClick={() => setIsStatSheetOpen(false)} className="hover:bg-dark-orange hover:text-paper font-label-md border-2 border-ink px-2 py-0.5 font-bold transition-all line-height-none uppercase text-xs cursor-pointer block-shadow">
                CLOSE ×
              </button>
            </div>

            {/* Content stats */}
            <div className="space-y-4 font-mono text-sm text-ink text-left">
              <div className="grid grid-cols-2 gap-3 border-b border-ink/20 pb-2">
                <div>
                  <span className="font-bold text-ink-light uppercase text-[10px] block">CLASS</span> ROGUE COGNIZANT
                </div>
                <div>
                  <span className="font-bold text-ink-light uppercase text-[10px] block">SPECIES</span> CYBORG OUTCAST
                </div>
              </div>

              {/* Stats Grid */}
              <div className="py-1">
                <span className="font-label-sm font-bold tracking-wider text-ink-light block mb-2 uppercase text-[11px]">CORE ATTRIBUTES</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border-2 border-ink p-2 text-center bg-surface">
                    <div className="text-[10px] uppercase font-bold text-ink-light">STR</div>
                    <div className="text-xl font-bold font-sans-title">12</div>
                    <div className="text-[9px] text-ink-light/80">+1 MOD</div>
                  </div>
                  <div className="border-2 border-ink p-2 text-center bg-surface">
                    <div className="text-[10px] uppercase font-bold text-ink-light">DEX</div>
                    <div className="text-xl font-bold font-sans-title">18</div>
                    <div className="text-[9px] text-ink-light/80">+4 MOD</div>
                  </div>
                  <div className="border-2 border-ink p-2 text-center bg-surface">
                    <div className="text-[10px] uppercase font-bold text-ink-light">CON</div>
                    <div className="text-xl font-bold font-sans-title">14</div>
                    <div className="text-[9px] text-ink-light/80">+2 MOD</div>
                  </div>
                  <div className="border-2 border-ink p-2 text-center bg-surface">
                    <div className="text-[10px] uppercase font-bold text-ink-light">INT</div>
                    <div className="text-xl font-bold font-sans-title">16</div>
                    <div className="text-[9px] text-ink-light/80">+3 MOD</div>
                  </div>
                  <div className="border-2 border-ink p-2 text-center bg-surface">
                    <div className="text-[10px] uppercase font-bold text-ink-light">WIS</div>
                    <div className="text-xl font-bold font-sans-title">10</div>
                    <div className="text-[9px] text-ink-light/80">+0 MOD</div>
                  </div>
                  <div className="border-2 border-ink p-2 text-center bg-surface">
                    <div className="text-[10px] uppercase font-bold text-ink-light">CHA</div>
                    <div className="text-xl font-bold font-sans-title">14</div>
                    <div className="text-[9px] text-ink-light/80">+2 MOD</div>
                  </div>
                </div>
              </div>

              {/* Skills & Defenses */}
              <div className="border-t border-ink/20 pt-3">
                <span className="font-label-sm font-bold tracking-wider text-ink-light block mb-2 uppercase text-[11px]">ACTIVE TRAITS & EFFECT BURDENS</span>
                <ul className="list-none space-y-1.5 text-xs">
                  <li className="flex items-start gap-1.5">
                    <span className="text-danger font-bold">▪</span>
                    <span>
                      <strong className="text-ink">[THE MIDAS TOUCH]</strong> Generates coin magnetism but infuses heavy telemetry drift.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-danger font-bold">▪</span>
                    <span>
                      <strong className="text-ink">[EXHAUSTION LEVEL 2]</strong> Sub-orbital actuators operating at half power, adding 2 to obstacle DC targets.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer stamp */}
            <div className="mt-5 border-t-[2px] border-ink pt-3 text-center">
              <span className="font-mono text-[9px] text-ink-light/50 uppercase tracking-widest">VERIFIED COGNITIVE DECREE // ARCHIVE SECURE</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
