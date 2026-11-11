import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { loadConfig } from '../config/env.js';
import { assertDatasetIsSound, findDuplicateDistrictRecords, importPoliceDistrictStatistics, loadPoliceDistrictDataset, verifyPoliceDistrictImport } from './importPoliceDistricts.js';

const hideConnectionStrings = (text) => text.replace(/mongodb(\+srv)?:\/\/\S+/g, '[connection string hidden]');

// NCRB police-district records for the configured database. Modes:
//   --check     validate the dataset file only. Never reads MONGODB_URI or connects.
//   --dry-run   read the configured database and report what an import would insert, leave
//               unchanged or flag as a conflict. Writes nothing, not even indexes.
//   --verify    read-only post-import verification of counts, hashes and reconciliation.
//   --approved  insert missing documents. Never changes existing ones.
// Any mode that connects to Atlas, including the read-only ones, needs the project owner's
// approval first. --approved also needs the NCRB publication question resolved (OR-12).
const MODES = ['--check', '--dry-run', '--verify', '--approved'];

function expectedCounts(dataset) {
  return {
    dataSources: dataset.sources.length,
    validationRecords: dataset.sources.length,
    crimeCategories: dataset.categories.reduce((n, c) => n + c.years.length, 0),
    crimeRecords: dataset.values.length,
  };
}

async function withDatabase(work) {
  const { mongodbUri } = loadConfig();
  await connectDatabase(mongodbUri, { serverSelectionTimeoutMS: 15000 });
  try {
    return await work();
  } finally {
    await disconnectDatabase();
  }
}

async function main() {
  const modes = MODES.filter((mode) => process.argv.includes(mode));
  if (modes.length > 1) throw new Error(`Choose one of ${MODES.join(', ')}`);
  const [mode] = modes;
  const dataset = await loadPoliceDistrictDataset();
  assertDatasetIsSound(dataset);

  if (mode === '--check') {
    console.log(`Dataset sound: ${dataset.values.length} values, ${dataset.units.length} units, ${dataset.categories.length} categories, ${dataset.sources.length} sources. No database was contacted.`);
    console.log(`An import into an empty database would insert ${JSON.stringify(expectedCounts(dataset))}.`);
    return;
  }
  if (!mode) {
    throw new Error('Refusing to import: pass --approved only after the owner has approved this import (or use --check, --dry-run or --verify).');
  }

  if (mode === '--verify') {
    const result = await withDatabase(() => verifyPoliceDistrictImport(dataset));
    for (const c of result.checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? ` (${c.detail})` : ''}`);
    console.log(result.pass ? 'Verification passed.' : 'Verification FAILED.');
    if (!result.pass) process.exitCode = 1;
    return;
  }

  const dryRun = mode === '--dry-run';
  const report = await withDatabase(async () => {
    const duplicates = await findDuplicateDistrictRecords();
    if (duplicates.length > 0) throw new Error(`${duplicates.length} duplicate district record identities already exist; resolve them before importing.`);
    return importPoliceDistrictStatistics(dataset, { dryRun });
  });
  console.log(JSON.stringify({
    mode: dryRun ? 'dry-run (nothing written)' : 'import',
    [dryRun ? 'wouldInsert' : 'inserted']: report.inserted,
    unchanged: report.unchanged,
    conflicts: report.conflicts,
    expectedTotalAfterImport: expectedCounts(dataset),
  }, null, 1));
  if (report.conflicts.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Police-district import failed: ${hideConnectionStrings(error.message)}`);
  process.exitCode = 1;
});
