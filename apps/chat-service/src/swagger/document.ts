import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from '@e-shop-app/packages/libs/swagger';

import '../routes/chat.router';

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Chat Service API',
    description: 'Chat service for managing user and seller orders',
    version: '1.0.0',
  },
});
