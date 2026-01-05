import proxy from 'express-http-proxy';

export const proxyHelper = (authServiceUrl: string, serviceTag: string) => {
  return proxy(authServiceUrl, {
    proxyReqPathResolver: (req) => `/api/${serviceTag}${req.url}`,
    proxyErrorHandler: (err, res) => {
      console.error(`${serviceTag} service error:`, err.message);
      res.status(502).json({
        error: `${serviceTag} service unavailable`,
      });
    },
    timeout: 15000, // 15 seconds timeout
  });
};
