"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface WebSocketContextType {
  socket: WebSocket | null;
  connected: boolean;
  lastMessage: MessageEvent<any> | null;
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  token: string;
  children: React.ReactNode;
}

export const WebSocketProvider = ({ token, children }: WebSocketProviderProps) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent<any> | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;
    const wsUrl = `wss://connect.yapson.net/ws/payment/?token=${token}&client_type=admin`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (msg) => setLastMessage(msg);

    return () => {
      ws.close();
    };
  }, [token]);

  const send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (socketRef.current && connected) {
      socketRef.current.send(data);
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current, connected, lastMessage, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used within a WebSocketProvider");
  return ctx;
};
