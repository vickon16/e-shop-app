import 'dotenv/config';

function requireEnv(key: string, fallback: string): string {
  const value = process.env[key];
  if (!value) {
    if (fallback) return fallback;
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  //  --------------------------------------------------
  // Backend Environment Variables
  // -------------------------------------------------- */
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as
    | 'development'
    | 'production',

  // Database
  DATABASE_URL: requireEnv('DATABASE_URL', ''),

  // Auth
  JWT_SECRET: requireEnv('JWT_SECRET', 'f32rlafu3328ffaf3r283hfwfafe'),

  BASE_HOST: requireEnv('BASE_HOST', 'localhost'),

  // Redis
  REDIS_HOST: requireEnv('REDIS_HOST', 'localhost'),
  REDIS_PORT: Number(requireEnv('REDIS_PORT', '6379')),
  REDIS_PASSWORD: requireEnv('REDIS_PASSWORD', ''),

  // Urls
  AUTH_SERVICE_URL: requireEnv('AUTH_SERVICE_URL', 'http://localhost:4001'),
  PRODUCT_SERVICE_URL: requireEnv(
    'PRODUCT_SERVICE_URL',
    'http://localhost:4002',
  ),
  KAFKA_SERVICE_URL: requireEnv('KAFKA_SERVICE_URL', 'http://localhost:4003'),
  ORDER_SERVICE_URL: requireEnv('ORDER_SERVICE_URL', 'http://localhost:4004'),

  // Ports
  GATEWAY_PORT: Number(requireEnv('GATEWAY_PORT', '4000')),
  AUTH_SERVICE_PORT: Number(requireEnv('AUTH_SERVICE_PORT', '4001')),
  PRODUCT_SERVICE_PORT: Number(requireEnv('PRODUCT_SERVICE_PORT', '4002')),
  KAFKA_SERVICE_PORT: Number(requireEnv('KAFKA_SERVICE_PORT', '4003')),
  ORDER_SERVICE_PORT: Number(requireEnv('ORDER_SERVICE_PORT', '4004')),

  // Email
  SMTP_HOST: requireEnv('SMTP_HOST', ''),
  SMTP_PORT: Number(requireEnv('SMTP_PORT', '587')),
  SMTP_SERVICE: requireEnv('SMTP_SERVICE', ''),
  SMTP_USER: requireEnv('SMTP_USER', ''),
  SMTP_PASSWORD: requireEnv('SMTP_PASSWORD', ''),

  ACCESS_TOKEN_SECRET: requireEnv('ACCESS_TOKEN_SECRET', ''),
  REFRESH_TOKEN_SECRET: requireEnv('REFRESH_TOKEN_SECRET', ''),
  ACCESS_TOKEN_EXPIRATION: requireEnv('ACCESS_TOKEN_EXPIRATION', '15m'),
  REFRESH_TOKEN_EXPIRATION: requireEnv('REFRESH_TOKEN_EXPIRATION', '7d'),
  STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET', ''),

  // Imagekit
  IMAGEKIT_PUBLIC_KEY: requireEnv('IMAGEKIT_PUBLIC_KEY', ''),
  IMAGEKIT_PRIVATE_KEY: requireEnv('IMAGEKIT_PRIVATE_KEY', ''),
  IMAGEKIT_URL_ENDPOINT: requireEnv('IMAGEKIT_URL_ENDPOINT', ''),

  // Kafka
  KAFKA_BROKER: requireEnv('KAFKA_BROKER', ''),

  //  --------------------------------------------------
  // Frontend Environment Variables
  // -------------------------------------------------- */
  NEXT_PUBLIC_USER_APP_URL: requireEnv('NEXT_PUBLIC_USER_APP_URL', ''),
  NEXT_PUBLIC_SELLER_APP_URL: requireEnv('NEXT_PUBLIC_SELLER_APP_URL', ''),
} as const;
