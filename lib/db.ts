/**
 * lib/db.ts
 * Lightweight file-backed store that replaces Firebase Firestore.
 * Works on any Node.js host (Render, Railway, fly.io, self-hosted).
 *
 * Data is kept in memory and flushed to DATA_DIR/submissions.json.
 * On Render, mount a persistent disk at /data and set DATA_DIR=/data
 * so submissions survive deploys; otherwise /tmp is used (ephemeral).
 */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || "/tmp/mula-sakshi-data";
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

// In-memory store — persists for the life of the Node.js process
let store: Map<string, Record<string, unknown>> = new Map();
let ready = false;

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function load() {
  if (ready) return;
  try {
    await ensureDir();
    const raw = await fs.readFile(SUBMISSIONS_FILE, "utf-8");
    const arr: Record<string, unknown>[] = JSON.parse(raw);
    store = new Map(arr.map((s) => [s.id as string, s]));
  } catch {
    store = new Map();
  }
  ready = true;
}

async function persist() {
  try {
    await ensureDir();
    const arr = Array.from(store.values());
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (err) {
    console.warn("[db] Failed to persist data:", err);
  }
}

export interface Db {
  setSubmission(id: string, data: Record<string, unknown>): Promise<void>;
  getSubmission(id: string): Promise<Record<string, unknown> | null>;
  updateSubmission(id: string, updates: Record<string, unknown>): Promise<void>;
  listSubmissions(limit: number): Promise<Record<string, unknown>[]>;
}

export async function getDb(): Promise<Db> {
  await load();

  return {
    async setSubmission(id, data) {
      store.set(id, data);
      await persist();
    },

    async getSubmission(id) {
      return store.get(id) ?? null;
    },

    async updateSubmission(id, updates) {
      const existing = store.get(id);
      if (existing) {
        store.set(id, { ...existing, ...updates });
        await persist();
      }
    },

    async listSubmissions(limit) {
      return Array.from(store.values())
        .sort(
          (a, b) =>
            new Date(b.createdAt as string).getTime() -
            new Date(a.createdAt as string).getTime()
        )
        .slice(0, limit);
    },
  };
}
