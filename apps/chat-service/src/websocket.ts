import { kafkaProducer } from '@e-shop-app/packages/libs/kafka';
import { WebSocket, WebSocketServer } from 'ws';
import { constructChatKey, redis } from '@e-shop-app/packages/libs/redis';
import { Server as HttpServer } from 'http';
import {
  TChatIncomingMessage,
  TWebSocketMessageEvent,
  TWebSocketNewMessageType,
} from '@e-shop-app/packages/types';

const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

export async function createWebsocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });
  await kafkaProducer.connect();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');
    console.log('Connected Users', connectedUsers.entries());
    console.log('Unseen Counts', unseenCounts.entries());

    let registeredUserId: string | null = null;

    ws.on('message', async (message) => {
      try {
        const messageStr = message.toString();

        // Register the user on first plain message (Non-Json)
        if (!registeredUserId && !messageStr.startsWith('{')) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);
          console.log(`User ${registeredUserId} connected`);

          const isSeller = registeredUserId.startsWith('seller_');

          const redisKey = isSeller
            ? constructChatKey(
                'seller',
                registeredUserId.replace('seller_', ''),
              )
            : constructChatKey('user', registeredUserId.replace('user_', ''));

          await redis.set(redisKey, '1');
          await redis.expire(redisKey, 60 * 5); // expire in 5 minutes;
          return;
        }

        console.log('Before parsing message');

        // Process the json message
        const messageData = JSON.parse(messageStr) as TChatIncomingMessage;
        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
          type,
        } = messageData;

        if (
          !messageData ||
          !fromUserId ||
          !toUserId ||
          !messageBody ||
          !conversationId
        ) {
          console.warn('Invalid message format', messageData);
          return;
        }

        if (type === 'MARK_AS_SEEN' && registeredUserId) {
          const seenKey = `${registeredUserId}_${messageData.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
        }

        // Handle incoming messages

        const messagePayload: TWebSocketNewMessageType['payload'] = {
          conversationId,
          senderId: fromUserId,
          senderType,
          messageBody,
          createdAt: new Date(),
        };

        const messageEvent = JSON.stringify({
          type: 'NEW_MESSAGE',
          payload: messagePayload,
        } as TWebSocketMessageEvent);

        const senderKey = `${senderType}_${fromUserId}`;
        const receiverKey = `${senderType === 'user' ? 'seller' : 'user'}_${toUserId}`;

        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        // send the new message to receiver
        const receiverSocket = connectedUsers.get(receiverKey);

        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);

          // also notify sender that the message has been sent
          receiverSocket.send(
            JSON.stringify({
              type: 'UNSEEN_COUNT_UPDATE',
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            } as TWebSocketMessageEvent),
          );

          console.log(`Delivered message + unseen count to ${receiverKey}`);
        } else {
          console.log(`User ${receiverKey} is not online. Messages are queued`);
        }

        // Echo to sender

        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to ${senderKey}`);
        }

        // push to kafka consumer
        await kafkaProducer.send(
          'CHAT_NEW_MESSAGE',
          messagePayload,
          conversationId,
        );

        console.log('Message pushed to kafka', conversationId);
      } catch (error) {
        console.log('Error in websocket connection:', error);
      }
    });

    ws.on('close', async () => {
      try {
        if (registeredUserId) {
          connectedUsers.delete(registeredUserId);
          console.log(`User ${registeredUserId} disconnected`);

          const isSeller = registeredUserId.startsWith('seller_');

          const redisKey = isSeller
            ? constructChatKey(
                'seller',
                registeredUserId.replace('seller_', ''),
              )
            : constructChatKey('user', registeredUserId.replace('user_', ''));

          await redis.del(redisKey);
        }
      } catch (error) {
        console.log('Error in websocket disconnection:', error);
      }
    });

    ws.on('error', (error) => {
      console.log('Error in websocket connection:', error);
    });
  });

  console.log('WebSocket server started');
}
