import { useState, useEffect, useRef, useCallback } from 'react';

export type AgentStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'ERROR';

export function useAgent() {
  const [status, setStatus] = useState<AgentStatus>('CONNECTING');
  const [messages, setMessages] = useState<any[]>([]);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [rtt, setRtt] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    const wsUrl = 'wss://worker-agent.berad4000.workers.dev/ws';
    console.log(`🔌 [useAgent] Connecting to ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('🔌 [useAgent] Connected');
      setStatus('OPEN');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('🔌 [useAgent] Message received:', data);

      if (startTimeRef.current) {
        setRtt(Date.now() - startTimeRef.current);
        startTimeRef.current = null;
      }

      setLastResponse(data);
      setMessages((prev) => [...prev, data]);
      setIsCalculating(false);
    };

    ws.onerror = (error) => {
      console.error('🔌 [useAgent] Error:', error);
      setStatus('ERROR');
      setIsCalculating(false);
    };

    ws.onclose = () => {
      console.log('🔌 [useAgent] Closed');
      setStatus('CLOSED');
      setIsCalculating(false);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const sendIntent = useCallback((intent: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('🔌 [useAgent] Cannot send intent: Socket not open');
      return;
    }

    setIsCalculating(true);
    startTimeRef.current = Date.now();

    // Check if intent is JSON, otherwise wrap it
    let payload;
    try {
      payload = JSON.parse(intent);
    } catch (e) {
      payload = { prompt: intent };
    }

    console.log('🔌 [useAgent] Sending intent:', payload);
    socketRef.current.send(JSON.stringify(payload));
  }, []);

  return {
    status,
    lastResponse,
    messages,
    rtt,
    isCalculating,
    sendIntent,
  };
}
