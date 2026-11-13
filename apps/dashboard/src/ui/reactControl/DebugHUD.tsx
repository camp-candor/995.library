import { useGame } from '../../hooks/useGame';

const App = () => {
  const { gameState, actions } = useGame();

  if (!gameState) {
    return <div className="p-10 font-mono text-yellow-500">Connecting to the Void...</div>;
  }

  // Safe extraction with default fallbacks
  const { hp, x, y, tick } = gameState.update ?? { hp: 0, x: 0, y: 0, tick: 0 };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 font-mono bg-black text-white">
      <h1 className="text-4xl mb-8 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Neuro-Symbolic Debugger</h1>

      <div className="border border-gray-700 p-8 rounded-lg bg-gray-900 w-full max-w-md shadow-lg shadow-blue-500/20">
        <h2 className="text-xl mb-4 border-b border-gray-700 pb-2 text-gray-300">Server State</h2>

        <div className="grid grid-cols-2 gap-4 text-lg">
          <div className="text-gray-500">TICK:</div>
          <div>{tick}</div>

          <div className="text-gray-500">HP:</div>
          <div className={hp < 50 ? 'text-red-500 font-bold animate-pulse' : 'text-green-500'}>{hp} / 100</div>

          <div className="text-gray-500">POS X:</div>
          <div>{x}</div>

          <div className="text-gray-500">POS Y:</div>
          <div>{y}</div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={() => actions.move(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100))} className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors font-bold shadow-md">
          RANDOM MOVE
        </button>

        <button onClick={() => actions.attack()} className="px-6 py-3 bg-red-600 rounded hover:bg-red-700 transition-colors font-bold shadow-md">
          SELF HARM
        </button>
      </div>
    </main>
  );
};

export default App;
