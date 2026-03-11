import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@e-shop-app/packages/env';
import { errorMiddleware } from '@e-shop-app/packages/middlewares';
import chatRouter from './routes/chat.router';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './swagger/document';
import { createWebsocketServer } from './websocket';

const app = express();

const frontendAdminUrl = env.NEXT_PUBLIC_ADMIN_APP_URL;
const frontendUserUrl = env.NEXT_PUBLIC_USER_APP_URL;
const frontendSellerUrl = env.NEXT_PUBLIC_SELLER_APP_URL;
const host = env.BASE_HOST;
const port = env.CHAT_SERVICE_PORT;

app.use(
  cors({
    origin: [frontendAdminUrl, frontendUserUrl, frontendSellerUrl],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------------------------------------
 * Trust Gateway Proxy
 * -------------------------------------------------- */
app.set('trust proxy', 1);

// Swagger Documentation
app.use('/api/chat/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Routes
app.use('/api/chat', chatRouter);

app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Chat Service is running at http://${host}:${port}`);
  console.log(`Swagger Docs available at http://${host}:${port}/api/chat/docs`);
});

// Websocket server
createWebsocketServer(server);

server.on('error', (error) => {
  console.error('Error starting server:', error);
});
