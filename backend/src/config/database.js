import mongoose from 'mongoose';

const STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

export function connectDatabase(uri, { serverSelectionTimeoutMS = 5000 } = {}) {
  if (!uri) throw new Error('A MongoDB connection string is required');
  return mongoose.connect(uri, { serverSelectionTimeoutMS });
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}

export function databaseState() {
  return STATES[mongoose.connection.readyState] ?? 'unknown';
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export async function pingDatabase() {
  if (!isDatabaseReady()) return false;
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
}
