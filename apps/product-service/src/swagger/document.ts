import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from '@e-shop-app/packages/libs/swagger';

import '../routes/product.router';

export const openApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Product Service API',
    description:
      'Product service for user and seller products, categories and Items',
    version: '1.0.0',
  },
});
