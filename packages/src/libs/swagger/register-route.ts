import { Router, RequestHandler } from 'express';
import { validate } from '../../utils/base.utils.js';
import { RouteContract } from '../../types/index.js';
import { registerContract } from './contract.js';

export function registerRoute(
  router: Router,
  contract: RouteContract,
  handler: RequestHandler,
) {
  const validatorMiddlewares = [];
  const otherMiddlewares = contract.otherMiddlewares || [];

  if (contract.request?.body) {
    validatorMiddlewares.push(validate(contract.request.body));
  }

  router[contract.method](
    contract.routePath,
    [...validatorMiddlewares, ...otherMiddlewares],
    handler,
  );
  registerContract(contract);
}
