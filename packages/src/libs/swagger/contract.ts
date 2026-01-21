import { RouteContract } from '../../types/index.js';
import { registry } from './registry.js';

export function registerContract(contract: RouteContract) {
  registry.registerPath({
    method: contract.method,
    path: contract.path,
    tags: contract.tags,

    // ---------------------------
    // REQUEST BODY
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
    // PARAMETERS (PATH + QUERY)
    // ---------------------------
    parameters: [
      ...(Array.isArray(contract.request?.params)
        ? contract.request.params.map((param) => ({
            ...param,
            in: 'path' as const,
            required: true, // path params are ALWAYS required
          }))
        : []),

      ...(Array.isArray(contract.request?.query)
        ? contract.request.query.map((query) => ({
            ...query,
            in: 'query' as const,
          }))
        : []),
    ],

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
