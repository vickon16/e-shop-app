import { kafka } from './client.js';
import { KafkaTopics } from './constants.js';

class KafkaProducer {
  private producer = kafka.producer();
  private isConnected = false;

  async connect() {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Kafka Producer Connected');
    }
  }

  async send(topic: keyof typeof KafkaTopics, payload: unknown, key?: string) {
    if (!this.isConnected) {
      await this.connect();
    }

    await this.producer.send({
      topic: KafkaTopics[topic],
      messages: [
        {
          key: key ? key : undefined,
          value: JSON.stringify(payload),
        },
      ],
    });
  }

  async disconnect() {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
    }
  }
}

export const kafkaProducer = new KafkaProducer();
