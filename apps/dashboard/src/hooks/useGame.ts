import { useEffect, useState } from 'react';
import { GameSocket } from '../network/GameSocket';
import type { SocketStatus } from '../network/GameSocket';
import type { ServerPacket } from '@camp_candor/types/';

const WS_URL = 'wss://worker-warden.berad4000.workers.dev/ws';

// Global Singleton State
let globalSocket: GameSocket | null = null;
let currentToken: string | null = null;
const stateListeners = new Set<(state: ServerPacket) => void>();
const statusListeners = new Set<(status: SocketStatus) => void>();
let currentStatus: SocketStatus = 'CLOSED';
let currentGameState: ServerPacket | null = null;
let activeHookCount = 0;
let closeTimeout: any = null;

function getOrCreateSocket(token: string) {
  if (globalSocket && currentToken === token) {
    return globalSocket;
  }

  if (globalSocket) {
    console.log('🎮 [useGame] Token changed. Closing previous socket connection...');
    globalSocket.close();
  }

  console.log(`🎮 [useGame] Initializing global singleton socket → ${WS_URL}`);
  currentToken = token;
  const url = `${WS_URL}?jwt=${token}`;
  const socket = new GameSocket(url);
  globalSocket = socket;
  currentStatus = 'CONNECTING';

  socket.onStateChange = (newState) => {
    currentGameState = newState;
    stateListeners.forEach((listener) => listener(newState));
  };

  socket.onStatusChange = (status) => {
    currentStatus = status;
    statusListeners.forEach((listener) => listener(status));
  };

  return socket;
}

export function useGame(token?: string) {
  const [gameState, setGameState] = useState<ServerPacket | null>(currentGameState);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>(currentStatus);

  useEffect(() => {
    if (!token) {
      setSocketStatus('CONNECTING');
      return;
    }

    activeHookCount++;
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }

    getOrCreateSocket(token);

    // Sync immediate status
    setGameState(currentGameState);
    setSocketStatus(currentStatus);

    const handleState = (state: ServerPacket) => setGameState(state);
    const handleStatus = (status: SocketStatus) => setSocketStatus(status);

    stateListeners.add(handleState);
    statusListeners.add(handleStatus);

    return () => {
      stateListeners.delete(handleState);
      statusListeners.delete(handleStatus);
      activeHookCount--;

      if (activeHookCount === 0 && globalSocket) {
        if (closeTimeout) clearTimeout(closeTimeout);
        closeTimeout = setTimeout(() => {
          if (activeHookCount === 0 && globalSocket) {
            console.log('🎮 [useGame] No active listeners. Cleaning up singleton socket...');
            globalSocket.close();
            globalSocket = null;
            currentToken = null;
            currentGameState = null;
            currentStatus = 'CLOSED';
          }
        }, 1000);
      }
    };
  }, [token]);

  return {
    gameState,
    socketStatus,
    actions: {
      move: (x: number, y: number) => globalSocket?.move(x, y),
      attack: () => globalSocket?.attack(),
    },
  };
}
