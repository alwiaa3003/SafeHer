// Adds source classification to existing dataSources documents.
// Dry run by default. Pass --apply to write. Do not apply without review.
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { loadConfig } from '../src/config/env.js';
import { migrateSourceMetadata } from '../src/seed/migrateSourceMetadata.js';

async function main() {
  const { mongodbUri } = loadConfig();
  await connectDatabase(mongodbUri);
  try {
    const report = await migrateSourceMetadata({ apply: process.argv.includes('--apply') });
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
