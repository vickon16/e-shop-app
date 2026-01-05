import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@e-shop-app/packages/env';
import { errorMiddleware } from '@e-shop-app/packages/middlewares';
import authRouter from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './swagger/document';

const app = express();

const frontendUrl = env.NEXT_PUBLIC_APP_URL;
const host = env.BASE_HOST;
const port = env.AUTH_SERVICE_PORT;

app.use(
  cors({
    origin: [frontendUrl],
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
app.use('/api/auth/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Routes
app.use('/api/auth', authRouter);

app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Auth Service is running at http://${host}:${port}`);
  console.log(`Swagger Docs available at http://${host}:${port}/api/auth/docs`);
});

server.on('error', (error) => {
  console.error('Error starting server:', error);
});
