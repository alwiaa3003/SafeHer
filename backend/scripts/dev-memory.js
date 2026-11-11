// Development only: runs the API on a temporary in-memory MongoDB.
// It starts empty, imports approved data, and is discarded when stopped.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { importApprovedAnnualTotals } from '../src/seed/importApproved.js';
import { importDelhiBoundary } from '../src/seed/importBoundary.js';
import { importReviewOnlyGsdlDistricts } from '../src/seed/importPoliceDistrictBoundaries.js';
import { importPoliceDistrictStatistics } from '../src/seed/importPoliceDistricts.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('dev:memory must not run in production');
}

const port = Number(process.env.PORT ?? 4000);
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4173').split(',');

const mongo = await MongoMemoryServer.create();
await connectDatabase(mongo.getUri('safeher_dev_memory'));
const report = await importApprovedAnnualTotals();
const boundary = await importDelhiBoundary();
const districts = await importPoliceDistrictStatistics();
console.log('Temporary database ready:', JSON.stringify(report.inserted), JSON.stringify(boundary), JSON.stringify(districts.inserted));

// Optional, for local review only: the Git-ignored GSDL police-district copy. GSDL states
// "All Rights Reserved", so it is never published; the UI labels it as a review copy.
const reviewFile = process.env.SAFEHER_REVIEW_DISTRICT_BOUNDARIES;
if (reviewFile) console.log('Review-only district boundaries:', JSON.stringify(await importReviewOnlyGsdlDistricts(reviewFile)));

const server = createApp({ corsOrigins, reviewBoundaries: Boolean(reviewFile) }).listen(port, () => {
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
