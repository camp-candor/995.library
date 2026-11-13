import React, { useState, useEffect } from 'react';
import { useAgent } from '../hooks/useAgent';

function GamePad() {
  const { status, lastResponse, rtt, isCalculating, sendIntent } = useAgent();
  const [intent, setIntent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intent.trim() && !isCalculating) {
      sendIntent(intent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen w-screen bg-surface text-on-surface font-mono overflow-hidden">
      {/* LEFT PANE: Intent */}
      <section className="flex flex-col relative border-r border-primary/10 h-full">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] opacity-40 uppercase">Intent Payload</span>
          <img alt="System Visual Core" className="w-8 h-8 object-cover opacity-50" src="https://lh3.googleusercontent.com/aida/ADBb0ugAGfhUADeW63ftWuVBy37NymxsMcPpGk1Zj2jT8ruoj8eL8m26ZtKXdaUIFHG62tv2JDT_uc-AkEOIe9zA_O2lePld-K1SwzjZYLFiNiROWLVEr8uSe6AFQhMUHIekojQUlHXri4CIR1jZ41cnr9_3tHvfvPZW7qgJWOqNZasyygc5zz3idQZEziZaUt4lQI7CBhFa7ADnlnhbqjwOMj7Mb1EpbpJAsoIwc8Gtbs13W0Yap1geV78GvXQ" />
        </div>

        <div className="flex-1 flex flex-col p-6 pb-24">
          <div className="flex-1"></div>
          <textarea autoFocus aria-label="Agent Intent Payload" className="w-full h-40 bg-transparent border border-primary/20 rounded-none p-4 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 transition-all font-mono text-sm leading-relaxed resize-none" placeholder="Inject Player Intent..." value={intent} onChange={(e) => setIntent(e.target.value)} onKeyDown={handleKeyDown}></textarea>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={handleSubmit} disabled={isCalculating || status !== 'OPEN'} className={`font-bold px-6 py-3 transition-all active:scale-95 text-xs tracking-widest uppercase w-full ${isCalculating || status !== 'OPEN' ? 'bg-surface-variant text-on-surface-variant cursor-wait' : 'bg-primary-container text-black hover:bg-primary'}`}>
            {isCalculating ? '[ CALCULATING... ]' : '[ TRANSMIT_INTENT ]'}
          </button>
        </div>
      </section>

      {/* RIGHT PANE: Consequence */}
      <section className="flex flex-col h-full bg-[#050505]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg height="10" viewBox="0 0 10 10" width="10">
                <circle cx="5" cy="5" fill={status === 'OPEN' ? '#10B981' : '#EF4444'} r="5"></circle>
              </svg>
              <span className={`text-[10px] tracking-widest ${status === 'OPEN' ? 'text-primary' : 'text-error'}`}>{status}</span>
            </div>
            {rtt !== null && (
              <div className="text-[10px] tracking-widest opacity-60">
                RTT: <span className={rtt > 1000 ? 'text-orange-400' : 'text-primary'}>{rtt}ms</span>
              </div>
            )}
          </div>
          <span className="text-[10px] tracking-[0.2em] opacity-40 uppercase">Immutable Ledger</span>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <pre className="h-full overflow-auto text-sm leading-tight scrollbar-thin scrollbar-thumb-surface-variant scrollbar-track-transparent">
            <code className="block whitespace-pre">{lastResponse ? JSON.stringify(lastResponse, null, 2) : '// Awaiting data transmission...'}</code>
          </pre>
        </div>

        <div className="p-3 border-t border-white/5 bg-surface text-right">
          <span className="text-[9px] opacity-30 font-mono uppercase tracking-[0.3em]">Hash: {lastResponse ? Math.random().toString(16).substring(2, 10) : '0000...0000'}</span>
        </div>
      </section>
    </div>
  );
}

export default GamePad;
