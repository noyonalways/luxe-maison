import mongoose from 'mongoose';
import { cleanupLegacyCollections } from './cleanup-legacy-collections.js';

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectMongoose(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then(async (conn) => {
      await cleanupLegacyCollections(conn);
      return conn;
    });
  }

  return connectionPromise;
}

export async function disconnectMongoose(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  connectionPromise = null;
}
