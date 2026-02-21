import {
  setupKafkaTopics,
  startWorker,
  waitForKafka,
} from '@e-shop-app/packages/libs/kafka';

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@e-shop-app/packages/env';
import { errorMiddleware } from '@e-shop-app/packages/middlewares';
import authRouter from './routes/kafka.router';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './swagger/document';

const app = express();

const frontendUserUrl = env.NEXT_PUBLIC_USER_APP_URL;
const frontendSellerUrl = env.NEXT_PUBLIC_SELLER_APP_URL;
const host = env.BASE_HOST;
const port = env.KAFKA_SERVICE_PORT;

app.use(
  cors({
    origin: [frontendUserUrl, frontendSellerUrl],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

/* --------------------------------------------------
 * Trust Gateway Proxy
 * -------------------------------------------------- */
app.set('trust proxy', 1);

// Swagger Documentation
app.use('/api/kafka/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Routes
app.use('/api/kafka', authRouter);

app.use(errorMiddleware);

const server = app.listen(port, host, async () => {
  await waitForKafka();

  await setupKafkaTopics();

  // Consumer group 1
  await startWorker('USERS_EVENTS_GROUP', ['USER_EVENTS']);

  // // Consumer group 2
  // await startConsumer('ANALYTICS_GROUP', ['ORDER_CREATED', 'USER_EVENTS']);

  console.log(`Kafka Service is running at http://${host}:${port}`);
  console.log(
    `Swagger Docs available at http://${host}:${port}/api/kafka/docs`,
  );
});

server.on('error', (error) => {
  console.error('Error starting kafka server:', error);
});
