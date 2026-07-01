import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectMongoose(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then(() => mongoose);
  }

  return connectionPromise;
}

export async function disconnectMongoose(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  connectionPromise = null;
}
