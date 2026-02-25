import cors from 'cors';
import express from 'express';

import { env } from '@e-shop-app/packages/env';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { initializeSiteConfig } from './utils/initializeSiteConfig';
import { proxyHelper } from './utils/proxy.helper';

const frontendUserUrl = env.NEXT_PUBLIC_USER_APP_URL;
const frontendSellerUrl = env.NEXT_PUBLIC_SELLER_APP_URL;
const host = env.BASE_HOST;
const gatewayPort = env.GATEWAY_PORT;
const authServiceUrl = env.AUTH_SERVICE_URL;
const productServiceUrl = env.PRODUCT_SERVICE_URL;
const kafkaServiceUrl = env.KAFKA_SERVICE_URL;
const orderServiceUrl = env.ORDER_SERVICE_URL;

const app = express();

/* --------------------------------------------------
 * Global Middlewares
 * -------------------------------------------------- */

app.use(
  cors({
    origin: [frontendUserUrl, frontendSellerUrl],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan('dev'));
app.set('trust proxy', 1); // for test purposes only

/* --------------------------------------------------
 * Rate Limiting (Gateway-level)
 * -------------------------------------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // if user is logged in, allow more requests
  max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 1000/100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: true,
});

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/order/webhook')) {
    return next();
  }
  return limiter(req, res, next);
});

/** Health / welcome */
app.get('/api/gateway-health', (_req, res) => {
  res.json({ message: 'Welcome to API Gateway 🚀' });
});

/* --------------------------------------------------
 * Proxies
 * -------------------------------------------------- */

// Example: main backend service
app.use('/api/auth', proxyHelper(authServiceUrl, 'auth'));
app.use('/api/product', proxyHelper(productServiceUrl, 'product'));
app.use('/api/kafka', proxyHelper(kafkaServiceUrl, 'kafka'));
app.use('/api/order', proxyHelper(orderServiceUrl, 'order'));

// Uncomment this if the gateway have its own routes
// app.use(express.json({ limit: '100mb' }));
// app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const server = app.listen(gatewayPort, async () => {
  console.log(`Gateway service listening at http://${host}:${gatewayPort}/api`);
  try {
    await initializeSiteConfig();
  } catch (error) {
    console.error('Error initializing site configuration:', error);
  }
});

server.on('error', console.error);
