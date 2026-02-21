import {
  kafkaProducer,
  TKafkaProductEventSchemaType,
} from '@e-shop-app/packages/libs/kafka';
import { sendSuccess } from '@e-shop-app/packages/utils';
import { NextFunction, Request, Response } from 'express';

export const sendKafkaEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      throw new Error('Authenticated user not found in request');
    }

    const body = req.body as TKafkaProductEventSchemaType;

    await kafkaProducer.connect();
    await kafkaProducer.send('USER_EVENTS', body, authUser.userId);

    sendSuccess(res, null, 'Kafka event sent successfully');
  } catch (error) {
    console.log('Error in sendKafkaEventController:', error);
    return next(error);
  } finally {
    // Optionally disconnect the producer if you don't want to keep it alive
    await kafkaProducer.disconnect();
  }
};
