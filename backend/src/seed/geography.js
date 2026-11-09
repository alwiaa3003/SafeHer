import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { loadConfig } from '../config/env.js';
import { importDelhiBoundary } from './importBoundary.js';

const hideConnectionStrings = (text) => text.replace(/mongodb(\+srv)?:\/\/\S+/g, '[connection string hidden]');

async function main() {
  const { mongodbUri } = loadConfig();
  await connectDatabase(mongodbUri, { serverSelectionTimeoutMS: 15000 });
  try {
    const result = await importDelhiBoundary({ supersede: process.argv.includes('--supersede') });
    console.log(JSON.stringify(result));
    if (result.action === 'conflict') process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  console.error(`Boundary import failed: ${hideConnectionStrings(error.message)}`);
  process.exitCode = 1;
});
