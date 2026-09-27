import { useEffect, useRef, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function buildWsUrl() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  const proto = API_BASE_URL.startsWith("https") ? "wss" : "ws";
  return `${API_BASE_URL.replace(/^https?:/, proto)}/ws/notifications/?token=${encodeURIComponent(token)}`;
}

/**
 * Live WebSocket connection to /ws/notifications/.
 * Auth is a JWT passed as a query param (browser WebSocket can't set headers).
 * Auto-reconnects with exponential backoff; `onMessage` receives parsed events.
 * Returns `connected` so the UI can show a live/offline indicator if desired.
 */
export default function useNotificationSocket({ onMessage, enabled = true } = {}) {
  const [connected, setConnected] = useState(false);
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return;

    let socket = null;
    let closedByUs = false;
    let retries = 0;
    let retryTimer = null;

    const connect = () => {
      const url = buildWsUrl();
      if (!url) return;

      socket = new WebSocket(url);

      socket.onopen = () => {
        setConnected(true);
        retries = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          cbRef.current?.(data);
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (closedByUs) return;
        const delay = Math.min(1000 * 2 ** retries, 15000);
        retries += 1;
        retryTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => socket.close();
    };

    connect();

    return () => {
      closedByUs = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (socket) socket.close();
    };
  }, [enabled]);

  return connected;
}