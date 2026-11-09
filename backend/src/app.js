import cors from 'cors';
import express from 'express';
import { errorHandler, notFound } from './middleware/index.js';
import { apiRouter } from './routes/index.js';

export function createApp({ corsOrigins = [] } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigins, methods: ['GET', 'HEAD', 'OPTIONS'] }));
  app.use('/api', apiRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
