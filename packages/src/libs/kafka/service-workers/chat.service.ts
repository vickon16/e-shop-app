import { appDb, messageTable } from '@e-shop-app/packages/database';
import { incrementUnseenCount } from '@e-shop-app/packages/libs/redis';
import { TWebSocketNewMessageType } from 'src/types/base.type.js';

const MAX_BATCH_SIZE = 500;
const FLUSH_INTERVAL = 2000;

type ChatPayload = TWebSocketNewMessageType['payload'];

class ChatBufferService {
  private buffer: ChatPayload[] = [];
  private timer: NodeJS.Timeout | null = null;
  private flushing: boolean = false;

  async add(message: ChatPayload) {
    this.buffer.push(message);

    // if the length of buffer is at max, first flush the db
    if (this.buffer.length >= MAX_BATCH_SIZE) {
      await this.flush();
      return;
    }

    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, FLUSH_INTERVAL);
    }
  }

  async flush() {
    if (this.flushing) return;

    this.flushing = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length === 0) {
      this.flushing = false;
      return;
    }

    const batch = this.buffer.splice(0, this.buffer.length);

    try {
      const payload = batch.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }));

      await appDb.insert(messageTable).values(payload);

      // Redis unseen counters
      await Promise.all(
        payload.map((msg) => {
          const receiverType = msg.senderType === 'user' ? 'seller' : 'user';

          return incrementUnseenCount(receiverType, msg.conversationId);
        }),
      );

      console.log(`Inserted ${payload.length} chat messages`);
    } catch (err) {
      console.error('DB insert failed', err);

      // restore messages if failure
      this.buffer.unshift(...batch);

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), FLUSH_INTERVAL);
      }
    }

    this.flushing = false;
  }
}

export const chatBufferService = new ChatBufferService();
