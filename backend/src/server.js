import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase, isDatabaseReady } from './config/database.js';
import { loadConfig } from './config/env.js';

const RETRY_MS = 5000;
const config = loadConfig();
let retryTimer;

async function connectWithRetry() {
  try {
    await connectDatabase(config.mongodbUri);
    console.log('MongoDB connected');
  } catch {
    if (isDatabaseReady()) return;
    console.error(`MongoDB is not reachable. Retrying in ${RETRY_MS / 1000} seconds.`);
    retryTimer = setTimeout(connectWithRetry, RETRY_MS);
  }
}

// The API starts even if MongoDB is down, so clients get a clear 503.
const server = createApp({ corsOrigins: config.corsOrigins }).listen(config.port, () => {
  console.log(`SafeHer API listening on port ${config.port}`);
});
connectWithRetry();

async function shutdown() {
  clearTimeout(retryTimer);
  server.close();
  await disconnectDatabase();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
