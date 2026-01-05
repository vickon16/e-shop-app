import { RouteContract } from '@e-shop-app/packages/types';
import { registry } from './registry';

export function registerContract(contract: RouteContract) {
  registry.registerPath({
    method: contract.method,
    path: contract.path,
    tags: contract.tags,

    // ---------------------------
    // REQUEST
    // ---------------------------
    request: contract.request?.body && {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: contract.request.body,
          },
        },
      },
    },

    // ---------------------------
    // QUERY PARAMS
    // ---------------------------
    parameters: Array.isArray(contract.request?.query)
      ? contract.request?.query
      : [],

    // ---------------------------
    // RESPONSES
    // ---------------------------
    responses: Object.fromEntries(
      Object.entries(contract.responses || {}).map(([status, schema]: any) => [
        status,
        {
          description: 'Response',
          content: {
            'application/json': {
              schema,
            },
          },
        },
      ]),
    ),
  });
}
