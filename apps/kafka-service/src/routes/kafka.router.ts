import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import { sendKafkaEventController } from '../controllers/kafka.controller';
import { sendKafkaEventContract } from '../contracts/kafka.contract';

const kafkaRouter = express.Router();

// register user
registerRoute(kafkaRouter, sendKafkaEventContract, sendKafkaEventController);

export default kafkaRouter;
