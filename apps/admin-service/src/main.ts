import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@e-shop-app/packages/env';
import { errorMiddleware } from '@e-shop-app/packages/middlewares';
import adminRouter from './routes/admin.router';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './swagger/document';

const app = express();

const frontendAdminUrl = env.NEXT_PUBLIC_ADMIN_APP_URL;
const host = env.BASE_HOST;
const port = env.ADMIN_SERVICE_PORT;

app.use(
  cors({
    origin: [frontendAdminUrl],
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
app.use('/api/admin/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Routes
app.use('/api/admin', adminRouter);

app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Admin Service is running at http://${host}:${port}`);
  console.log(
    `Swagger Docs available at http://${host}:${port}/api/admin/docs`,
  );
});

server.on('error', (error) => {
  console.error('Error starting server:', error);
});
