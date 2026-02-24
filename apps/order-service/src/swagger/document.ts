import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from '@e-shop-app/packages/libs/swagger';

import '../routes/order.router';

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Orders Service API',
    description: 'Orders service for user and seller orders',
    version: '1.0.0',
  },
});
