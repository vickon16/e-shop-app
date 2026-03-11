'use client';

import {
  TUserWithRelations,
  TWebSocketMessageEvent,
} from '@e-shop-app/packages/types';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const websocketUrl = process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL;

type Props = PropsWithChildren & {
  user: TUserWithRelations;
};

type TWebSocketContextProps = {
  ws: WebSocket | null;
  unreadCounts: Record<string, number>;
  user: TUserWithRelations;
};

const WebSocketContext = createContext<TWebSocketContextProps | null>(null);

export const WebSocketProvider = (props: Props) => {
  const { user, children } = props;

  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user || !websocketUrl) return;

    const ws = new WebSocket(websocketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection opened');
      ws.send(`user_${user.id}`);
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received', event.data);
      const data = JSON.parse(event.data) as TWebSocketMessageEvent;

      if (data.type === 'UNSEEN_COUNT_UPDATE') {
        const { conversationId, count } = data.payload;

        setUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: count,
        }));
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (ws) ws.close();
    };
  }, [user]);

  return (
    <WebSocketContext.Provider
      value={{
        ws: wsRef.current,
        unreadCounts,
        user,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      'useWebSocketContext must be used within a WebSocketProvider',
    );
  }

  return context;
};
