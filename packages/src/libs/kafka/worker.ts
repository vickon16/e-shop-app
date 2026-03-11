import { TWebSocketNewMessageType } from 'src/types/base.type.js';
import { kafka } from './client.js';
import {
  KafkaGroups,
  KafkaTopics,
  TKafkaProductEventSchemaType,
} from './constants.js';
import { productEventHandlers } from './handlers.js';
import { chatBufferService } from './service-workers/chat.service.js';

export const startWorker = async (
  groupId: keyof typeof KafkaGroups,
  topics: (keyof typeof KafkaTopics)[],
  type: 'product' | 'chat',
  fromBeginning = false,
) => {
  const consumer = kafka.consumer({ groupId: KafkaGroups[groupId] });

  await consumer.connect();

  for (const topic of topics) {
    await consumer.subscribe({
      topic: KafkaTopics[topic],
      fromBeginning,
    });
  }

  await consumer.run({
    autoCommit: false, // “Don’t automatically mark messages as processed.”, only commits when successfully processed
    eachBatch: async ({
      batch,
      resolveOffset, // marks a message as processed, so it won’t be reprocessed on restart
      heartbeat, // sends a heartbeat to Kafka to keep the consumer session active
      commitOffsetsIfNecessary,
    }) => {
      for (const message of batch.messages) {
        if (!message.value) continue;

        let event;

        try {
          if (type === 'product') {
            event = JSON.parse(
              message.value.toString(),
            ) as TKafkaProductEventSchemaType;

            const handler = productEventHandlers[event.action];

            console.log('Received product event:', event);
            await handler(event);
          } else if (type === 'chat') {
            event = JSON.parse(
              message.value.toString(),
            ) as TWebSocketNewMessageType['payload'];

            console.log('Received chat event:', event);
            await chatBufferService.add(event);
          }

          resolveOffset(message.offset);
        } catch (err) {
          console.error('Handler failed:', err);
        }

        // After processing each message, we call heartbeat to ensure the consumer session stays active. If processing takes a long time, this prevents Kafka from thinking the consumer is dead and reassigning its partitions.
        await heartbeat();
      }

      // Commits the offsets of all processed messages in the batch. If any message processing failed, the offsets won’t be committed, and those messages will be reprocessed on restart.
      await commitOffsetsIfNecessary();
    },
  });
};

// resolveOffset = ✔ done
// commitOffsets = 💾 saved
// heartbeat = ❤️ still alive
// autoCommit = 🤖 do it automatically
