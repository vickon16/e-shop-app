import { kafka } from './client.js';
import { KafkaTopics } from './constants.js';

export const waitForKafka = async () => {
  const admin = kafka.admin();

  while (true) {
    try {
      await admin.connect();
      await admin.fetchTopicMetadata();
      await admin.disconnect();
      console.log('✅ Kafka is ready');
      break;
    } catch (err) {
      console.log('⏳ Waiting for Kafka broker...');
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
};

export const setupKafkaTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [
      {
        topic: KafkaTopics.USER_EVENTS,
        numPartitions: 6,
        replicationFactor: 1,
      },
      {
        topic: KafkaTopics.ORDER_CREATED,
        numPartitions: 6,
        replicationFactor: 1,
      },
      {
        topic: KafkaTopics.PAYMENT_COMPLETED,
        numPartitions: 2,
        replicationFactor: 1,
      },
    ],
  });

  await admin.disconnect();
};
