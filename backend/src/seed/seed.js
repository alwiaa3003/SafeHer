import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { loadConfig } from '../config/env.js';
import { importApprovedAnnualTotals } from './importApproved.js';

// Adds approved records only. It never updates, drops or deletes existing data.
async function main() {
  const { mongodbUri } = loadConfig();
  await connectDatabase(mongodbUri);
  try {
    const report = await importApprovedAnnualTotals();
    console.log(JSON.stringify(report, null, 2));
    if (report.conflicts.length > 0) {
      console.error('Existing records differ from approved data. Nothing was overwritten.');
      process.exitCode = 1;
    }
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error(`Import failed: ${error.message}`);
  process.exitCode = 1;
});
