import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@e-shop-app/packages/env';
import { errorMiddleware } from '@e-shop-app/packages/middlewares';
import orderRouter from './routes/order.router';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './swagger/document';
import { createOrderController } from './controllers/order.controller';

const app = express();

const frontendUserUrl = env.NEXT_PUBLIC_USER_APP_URL;
const frontendSellerUrl = env.NEXT_PUBLIC_SELLER_APP_URL;
const host = env.BASE_HOST;
const port = env.ORDER_SERVICE_PORT;

app.use(
  cors({
    origin: [frontendUserUrl, frontendSellerUrl],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// This is route that stripe will call after payment is completed, so we need to parse the body as raw to verify the signature
app.post(
  '/api/order/webhook/stripe',
  express.raw({ type: 'application/json' }),
  createOrderController,
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
app.use('/api/order/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Routes
app.use('/api/order', orderRouter);

app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Order Service is running at http://${host}:${port}`);
  console.log(
    `Swagger Docs available at http://${host}:${port}/api/order/docs`,
  );
});

server.on('error', (error) => {
  console.error('Error starting server:', error);
});
