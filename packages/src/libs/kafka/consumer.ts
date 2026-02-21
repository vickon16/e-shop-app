import { kafka } from './client.js';
import { KafkaGroups, KafkaTopics } from './constants.js';

export const startConsumer = async (
  groupId: keyof typeof KafkaGroups,
  topics: (keyof typeof KafkaTopics)[],
) => {
  const consumer = kafka.consumer({ groupId: KafkaGroups[groupId] });

  await consumer.connect();

  for (const topic of topics) {
    await consumer.subscribe({
      topic: KafkaTopics[topic],
      fromBeginning: true,
    });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) {
        console.warn('Received message with empty value, skipping...');
        return;
      }

      const value = message.value?.toString();

      console.log('📩 Event Received:', {
        groupId: KafkaGroups[groupId],
        topic,
        partition,
        value,
      });
    },
  });
};
