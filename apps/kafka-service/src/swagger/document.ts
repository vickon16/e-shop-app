import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from '@e-shop-app/packages/libs/swagger';

import '../routes/kafka.router';

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Kafka Service API',
    description: 'Kafka service for handling events in the e-shop application',
    version: '1.0.0',
  },
});
