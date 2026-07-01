import { useEffect, useRef, useState } from 'react';
import type { DeliveryStatus } from '@barriapp/shared';
import { resolveApiUrl, unwrap } from '@barriapp/api-client';
import { apiClient } from './api';
import { secureTokenStore } from './secure-token-store';

// The tracking WebSocket sends `route` as an array of [lng, lat] pairs (the
// latest point only). The REST DeliveryPublic sends `route` as GeoJSON points
// ({ type, coordinates }). We normalize both to a single `lastPoint`.
interface WsFrame {
  status: DeliveryStatus;
  route?: [number, number][];
}

export interface TrackingState {
  status: DeliveryStatus | null;
  /** Last known courier position as [lng, lat], or null. */
  lastPoint: [number, number] | null;
  connected: boolean;
  mode: 'ws' | 'polling' | 'idle';
  error: string | null;
}

const IDLE: TrackingState = {
  status: null,
  lastPoint: null,
  connected: false,
  mode: 'idle',
  error: null,
};

/**
 * Live delivery tracking. Opens the tracking WebSocket
 * (`/ws/deliveries/{id}?token=`) and streams status + latest location; on an
 * abnormal close (not an auth rejection) it falls back to polling
 * `GET /deliveries/{id}`.
 */
export function useDeliveryTracking(deliveryId: string | null | undefined): TrackingState {
  const [state, setState] = useState<TrackingState>(IDLE);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!deliveryId) {
      setState(IDLE);
      return;
    }

    let cancelled = false;
    setState({ ...IDLE, mode: 'ws' });

    function startPolling() {
      if (pollRef.current) return;
      setState((prev) => ({ ...prev, mode: 'polling', connected: false }));
      const tick = async () => {
        try {
          const d = await unwrap(
            apiClient.GET('/api/v1/deliveries/{delivery_id}', {
              params: { path: { delivery_id: deliveryId! } },
            }),
          );
          if (cancelled) return;
          setState((prev) => ({
            ...prev,
            status: d.status,
            lastPoint: d.route.at(-1)?.coordinates ?? prev.lastPoint,
          }));
        } catch {
          // keep last known state; next tick retries
        }
      };
      void tick();
      pollRef.current = setInterval(() => void tick(), 6000);
    }

    async function connect() {
      const tokens = await secureTokenStore.getTokens();
      if (cancelled) return;
      if (!tokens?.accessToken) {
        startPolling();
        return;
      }
      const wsBase = resolveApiUrl(process.env.EXPO_PUBLIC_API_URL).replace(/^http/, 'ws');
      const url = `${wsBase}/ws/deliveries/${deliveryId}?token=${encodeURIComponent(tokens.accessToken)}`;
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        startPolling();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        if (!cancelled) setState((prev) => ({ ...prev, connected: true, mode: 'ws', error: null }));
      };
      ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data as string) as WsFrame;
          setState((prev) => ({
            ...prev,
            status: frame.status,
            lastPoint: frame.route?.at(-1) ?? prev.lastPoint,
          }));
        } catch {
          // ignore malformed frames
        }
      };
      ws.onclose = (event) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, connected: false }));
        // 4401 bad token, 4403 not your delivery — do not fall back.
        if (event.code === 4401 || event.code === 4403) {
          setState((prev) => ({ ...prev, error: 'No autorizado para seguir esta entrega.' }));
        } else {
          startPolling();
        }
      };
      ws.onerror = () => {
        // onclose usually follows; polling fallback happens there.
      };
    }

    void connect();

    return () => {
      cancelled = true;
      wsRef.current?.close();
      wsRef.current = null;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [deliveryId]);

  return state;
}
