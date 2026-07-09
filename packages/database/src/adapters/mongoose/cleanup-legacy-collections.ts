import mongoose from 'mongoose';
import { LEGACY_COLLECTIONS } from './collection-names.js';

/**
 * Drops superseded MongoDB collections left over from old model/collection naming.
 * Safe to run on every connect — only targets known legacy names.
 */
export async function cleanupLegacyCollections(
  connection: typeof mongoose = mongoose,
): Promise<string[]> {
  if (connection.connection.readyState !== 1) {
    return [];
  }

  const db = connection.connection.db;
  if (!db) return [];

  const dropped: string[] = [];

  for (const name of LEGACY_COLLECTIONS) {
    try {
      const exists = await db.listCollections({ name }, { nameOnly: true }).toArray();
      if (exists.length === 0) continue;
      await db.dropCollection(name);
      dropped.push(name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('ns not found')) {
        console.warn(`[database] Failed to drop legacy collection "${name}":`, message);
      }
    }
  }

  if (dropped.length > 0) {
    console.log(`[database] Dropped legacy collections: ${dropped.join(', ')}`);
  }

  return dropped;
}
