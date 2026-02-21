import { kafka } from './client.js';
import {
  TKafkaProductEventSchemaType,
  KafkaGroups,
  KafkaTopics,
} from './constants.js';
import { eventHandlers } from './handlers.js';

export const startWorker = async (
  groupId: keyof typeof KafkaGroups,
  topics: (keyof typeof KafkaTopics)[],
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

        const event = JSON.parse(
          message.value.toString(),
        ) as TKafkaProductEventSchemaType;

        const handler = eventHandlers[event.action];

        if (!handler) {
          console.warn('Unknown event:', event.action);
          continue;
        }

        console.log('Received event:', event);

        try {
          await handler(event);
          resolveOffset(message.offset);
        } catch (err) {
          console.error('Handler failed:', err);
          throw err;
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
