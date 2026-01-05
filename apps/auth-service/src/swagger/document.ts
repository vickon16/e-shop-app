import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

import '../routes/auth.router';

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    description:
      'Auth service for user authentication and authorization in the e-shop application',
    version: '1.0.0',
  },
});
