import './App.css';

import type { HealthCheck } from '@camp_candor/types/';

import { useGame } from './hooks/useGame';

const status: HealthCheck = {
  status: 'ALIVE', // Try changing this to "ZOMBIE" and watch the red squiggly line appear.
  tick: 0,
};

const App = () => {
  const { gameState, actions } = useGame();

  if (!gameState) {
    return <div className="p-10">Connecting to the Void... {status.status}</div>;
  }

  // Extract data from the protobuf message
  const { hp, x, y, tick } = gameState.update ?? { hp: 0, x: 0, y: 0, tick: 0 };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 font-mono">
      <h1 className="text-4xl mb-8">Neuro-Symbolic Debugger</h1>

      <div className="border p-8 rounded bg-gray-900 text-green-400 w-full max-w-md">
        <h2 className="text-xl mb-4 border-b pb-2">Server State</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>TICK:</div>
          <div>{tick}</div>

          <div>HP:</div>
          <div className={hp < 50 ? 'text-red-500 font-bold' : 'text-green-500'}>{hp} / 100</div>

          <div>POS X:</div>
          <div>{x}</div>

          <div>POS Y:</div>
          <div>{y}</div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={() => actions.move(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100))} className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 text-white">
          RANDOM MOVE
        </button>

        <button onClick={() => actions.attack()} className="px-6 py-3 bg-red-600 rounded hover:bg-red-700 text-white">
          SELF HARM (Test)
        </button>
      </div>
    </main>
  );
};

export default App;
