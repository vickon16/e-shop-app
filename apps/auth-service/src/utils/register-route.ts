import { Router, RequestHandler } from 'express';
import { validate } from '@e-shop-app/packages/utils';
import { RouteContract } from 'node_modules/@e-shop-app/packages/src/types/base.type';
import { registerContract } from '../swagger/contract';

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
