import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../../src/config/database.js';
import { allModels, ensureIndexes } from '../../src/models/index.js';

let server;

export async function startTestDb() {
  server = await MongoMemoryServer.create();
  await connectDatabase(server.getUri('safeher_test'));
  await ensureIndexes();
}

export async function stopTestDb() {
  await disconnectDatabase();
  await server.stop();
}

// Only ever clears the throwaway in-memory server started above.
export async function clearTestDb() {
  const expectedPort = new URL(server.getUri()).port;
  if (String(mongoose.connection.port) !== expectedPort || mongoose.connection.name !== 'safeher_test') {
    throw new Error('Refusing to clear a database that is not the in-memory test database');
  }
  await Promise.all(allModels.map((model) => model.deleteMany({})));
}
