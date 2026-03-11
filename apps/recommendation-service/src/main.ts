import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@e-shop-app/packages/env';
import { errorMiddleware } from '@e-shop-app/packages/middlewares';
import recommendationRouter from './routes/recommendation.router';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './swagger/document';

const app = express();

const frontendAdminUrl = env.NEXT_PUBLIC_ADMIN_APP_URL;
const frontendUserUrl = env.NEXT_PUBLIC_USER_APP_URL;
const frontendSellerUrl = env.NEXT_PUBLIC_SELLER_APP_URL;
const host = env.BASE_HOST;
const port = env.RECOMMENDATION_SERVICE_PORT;

app.use(
  cors({
    origin: [frontendAdminUrl, frontendUserUrl, frontendSellerUrl],
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
app.use(
  '/api/recommendation/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument),
);

// Routes
app.use('/api/recommendation', recommendationRouter);

app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Recommendation Service is running at http://${host}:${port}`);
  console.log(
    `Swagger Docs available at http://${host}:${port}/api/recommendation/docs`,
  );
});

server.on('error', (error) => {
  console.error('Error starting server:', error);
});
