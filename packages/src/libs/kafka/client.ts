import { Kafka } from 'kafkajs';
import { env } from '../../env/index.js';

// Information about the required environment variable gotten from the confluent cloud dashboard
// https://www.confluent.io/

export const kafka = new Kafka({
  clientId: 'eshop-kafka-service',
  brokers: [env.KAFKA_BROKER], // Multiple brokers can be added for better fault tolerance
  // ssl: true,
  // sasl: {
  //   mechanism: 'plain',
  //   username: env.KAFKA_USERNAME,
  //   password: env.KAFKA_PASSWORD,
  // },
});
