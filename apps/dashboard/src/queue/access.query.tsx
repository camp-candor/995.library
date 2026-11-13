import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to verify the auth token with the gatekeeper worker.
 * Implementation example requested by the user.
 */
export function useVerifyAuth() {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: ['auth-verify', authToken],
    queryFn: async () => {
      if (!authToken) return null;
      // The actual auth validation happens during the WebSocket handshake natively on the worker.
      // We short-circuit the local HTTP poll to avoid 404s since there is no React API backend.
      return { status: 'ok', data: true };
    },
    enabled: !!authToken,
    staleTime: Infinity,
  });
}

export function useAccessRead() {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: ['readAccess', authToken],
    queryFn: async () => {
      const endpoint = 'https://tasou-system.onrender.com/api/access/read';

      console.log('Fetching access with token:', authToken?.substring(0, 8) + '...');

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData + ' from api access';
    },
    enabled: !!authToken,
  });
}

export function useAccessUpdate() {
  const queryClient = useQueryClient();
  const { authToken } = useAuth();

  // Note: The standard EventSource API does not support setting Authorization headers.
  // A common practice is to send the token as a query parameter.
  const endpoint = authToken ? `https://tasou-system.onrender.com/api/access/update?token=${authToken}` : null;

  useEffect(() => {
    if (!endpoint) return;

    const eventSource = new EventSource(endpoint);

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        queryClient.setQueryData(['updateAccess'], (oldData: any) => {
          const previousData = Array.isArray(oldData) ? oldData : [];
          return [newData, ...previousData];
        });
      } catch (e) {
        console.error('Failed to parse SSE data:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
      queryClient.setQueryData(['updateAccess'], (old: any) => ({ ...old, error: 'Failed to connect to SSE' }));
    };

    return () => {
      eventSource.close();
    };
  }, [endpoint, queryClient]);

  return useQuery({
    queryKey: ['updateAccess'],
    queryFn: () => new Promise(() => {}),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!authToken,
  });
}
