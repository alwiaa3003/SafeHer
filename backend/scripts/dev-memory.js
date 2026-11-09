// Development only: runs the API on a temporary in-memory MongoDB.
// It starts empty, imports approved data, and is discarded when stopped.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { importApprovedAnnualTotals } from '../src/seed/importApproved.js';
import { importDelhiBoundary } from '../src/seed/importBoundary.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('dev:memory must not run in production');
}

const port = Number(process.env.PORT ?? 4000);
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4173').split(',');

const mongo = await MongoMemoryServer.create();
await connectDatabase(mongo.getUri('safeher_dev_memory'));
const report = await importApprovedAnnualTotals();
const boundary = await importDelhiBoundary();
console.log('Temporary database ready:', JSON.stringify(report.inserted), JSON.stringify(boundary));

const server = createApp({ corsOrigins }).listen(port, () => {
  console.log(`SafeHer API listening on port ${port} (temporary in-memory database)`);
});

async function shutdown() {
  server.close();
  await disconnectDatabase();
  await mongo.stop();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
