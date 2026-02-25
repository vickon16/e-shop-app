import { kafkaProductEventSchema } from '@e-shop-app/packages/libs/kafka';
import { isCombinedAuthenticatedMiddleware } from '@e-shop-app/packages/middlewares';
import { RouteContract } from '@e-shop-app/packages/types';
import { baseApiResponse } from '@e-shop-app/packages/zod-schemas';

const baseContract = {
  tags: ['Kafka'],
  responses: {
    200: baseApiResponse,
  },
};

export const sendKafkaEventContract = {
  ...baseContract,
  method: 'post',
  path: '/api/kafka/send-event',
  routePath: '/send-event',
  request: {
    body: kafkaProductEventSchema,
  },
  otherMiddlewares: [isCombinedAuthenticatedMiddleware],
} as const satisfies RouteContract;
