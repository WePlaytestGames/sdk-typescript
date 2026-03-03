/**
 * End-to-end playtest workflow example.
 *
 * This script shows how a game studio would:
 *   1. Create a game and order playtests
 *   2. Set up a webhook to get notified when playtests complete
 *   3. Listen for webhook events via a tiny HTTP server
 *   4. Download the video and transcript for each completed playtest
 *
 * Usage:
 *   npx tsx examples/playtest-workflow.ts
 *
 * Environment variables:
 *   WPG_API_KEY   - Your API key (wpg_sk_...)
 *   WEBHOOK_URL   - Public HTTPS URL that points to this server (e.g. via ngrok)
 *   DOWNLOAD_DIR  - Local folder for downloads (default: ./downloads)
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createWriteStream, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { join } from 'node:path';
import crypto from 'node:crypto';

import { WPGClient, WPGError } from '../src/index.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_KEY = process.env.WPG_API_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // e.g. https://abc123.ngrok.app/webhook
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR ?? './downloads';
const WEBHOOK_PORT = 4000;

if (!API_KEY) {
  console.error('Set WPG_API_KEY to your API key');
  process.exit(1);
}
if (!WEBHOOK_URL) {
  console.error('Set WEBHOOK_URL to a public HTTPS URL (e.g. from ngrok)');
  process.exit(1);
}

const client = new WPGClient({ apiKey: API_KEY });

// ---------------------------------------------------------------------------
// Step 1 — Create a game (or pick an existing one)
// ---------------------------------------------------------------------------

async function getOrCreateGame(): Promise<string> {
  // Check if we already have a game
  const page = await client.games.list({ limit: 1 }).getPage();
  if (page.data.length > 0) {
    const game = page.data[0];
    console.log(`Using existing game: "${game.name}" (${game.id})`);
    return game.id;
  }

  // Otherwise create one
  const game = await client.games.create({
    name: 'My Awesome Game',
    buildUrl: 'https://store.steampowered.com/app/123456',
    description: 'An indie adventure game with puzzle mechanics.',
    tags: [], // add category UUIDs from client.auth.categories()
  });
  console.log(`Created game: "${game.name}" (${game.id})`);
  return game.id;
}

// ---------------------------------------------------------------------------
// Step 2 — Register a webhook for slot events
// ---------------------------------------------------------------------------

let webhookSecret: string;

async function setupWebhook(): Promise<string> {
  // Clean up any existing webhooks pointing to our URL
  const existing = await client.webhooks.list();
  for (const wh of existing) {
    if (wh.url === WEBHOOK_URL) {
      await client.webhooks.delete(wh.id);
      console.log(`Deleted old webhook ${wh.id}`);
    }
  }

  const { webhook, secret } = await client.webhooks.create({
    url: WEBHOOK_URL,
    events: ['slot.submitted', 'slot.accepted', 'slot.rejected', 'slot.expired'],
  });

  webhookSecret = secret;
  console.log(`Webhook created: ${webhook.id}`);
  console.log(`  URL:    ${webhook.url}`);
  console.log(`  Events: ${webhook.events.join(', ')}`);
  console.log(`  Secret: ${secret.slice(0, 8)}...`);
  return webhook.id;
}

// ---------------------------------------------------------------------------
// Step 3 — Order playtests
// ---------------------------------------------------------------------------

async function orderPlaytests(gameId: string): Promise<string> {
  const result = await client.playtests.create(gameId, {
    visibility: 'public',
    quantity: 2,
    durationMinutes: 30,
    notesForTesters: 'Please focus on the first 3 levels and let me know if any puzzles feel unfair.',
  });

  console.log(`\nPlaytest created: ${result.playtest.id}`);
  console.log(`  Status: ${result.playtest.status}`);
  if (result.requiresPayment) {
    console.log(`  Payment required: $${(result.totalCents ?? 0) / 100}`);
    console.log('  (Complete payment in the dashboard to activate the playtest)');
  }

  return result.playtest.id;
}

// ---------------------------------------------------------------------------
// Step 4 — Download video + transcript for a completed slot
// ---------------------------------------------------------------------------

async function downloadSlotArtifacts(slotId: string): Promise<void> {
  mkdirSync(DOWNLOAD_DIR, { recursive: true });

  const slot = await client.slots.get(slotId);
  console.log(`\nDownloading artifacts for slot ${slotId}...`);
  console.log(`  Playtester: ${slot.playtester?.displayName ?? 'unknown'}`);
  console.log(`  Status:     ${slot.status}`);

  // Download video
  try {
    const { downloadUrl, expiresAt } = await client.slots.downloadUrl(slotId);
    console.log(`  Video URL expires: ${expiresAt}`);

    const videoPath = join(DOWNLOAD_DIR, `${slotId}-video.mp4`);
    const res = await fetch(downloadUrl);
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    await pipeline(Readable.fromWeb(res.body as any), createWriteStream(videoPath));
    console.log(`  Video saved to ${videoPath}`);
  } catch (err) {
    if (err instanceof WPGError && err.code === 'NOT_FOUND') {
      console.log('  No video available yet');
    } else {
      console.error('  Video download failed:', err);
    }
  }

  // Download transcript
  try {
    const transcript = await client.slots.transcript(slotId);
    console.log(`  Transcript version: ${transcript.version}`);
    if (transcript.keyTakeaways?.length) {
      console.log(`  Key takeaways:`);
      for (const t of transcript.keyTakeaways) {
        console.log(`    - ${t}`);
      }
    }

    const transcriptPath = join(DOWNLOAD_DIR, `${slotId}-${transcript.filename}`);
    const res = await fetch(transcript.downloadUrl);
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    await pipeline(Readable.fromWeb(res.body as any), createWriteStream(transcriptPath));
    console.log(`  Transcript saved to ${transcriptPath}`);
  } catch (err) {
    if (err instanceof WPGError && err.code === 'NOT_FOUND') {
      console.log('  Transcript not available yet (still processing)');
    } else {
      console.error('  Transcript download failed:', err);
    }
  }
}

// ---------------------------------------------------------------------------
// Step 5 — Webhook listener
// ---------------------------------------------------------------------------

function verifySignature(payload: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function startWebhookServer(): void {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST' || req.url !== '/webhook') {
      res.writeHead(404);
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = Buffer.concat(chunks).toString();

    // Verify signature
    const signature = req.headers['x-wpg-signature'] as string | undefined;
    if (signature && !verifySignature(body, signature)) {
      console.warn('Webhook signature mismatch — ignoring');
      res.writeHead(401);
      res.end();
      return;
    }

    // Acknowledge immediately
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));

    // Process event
    const event = JSON.parse(body);
    console.log(`\n--- Webhook event: ${event.event} ---`);

    if (event.event === 'slot.submitted') {
      console.log(`Slot ${event.data?.slotId} has a new submission — reviewing...`);
      // Auto-accept for this demo (in production you'd review the video first)
      try {
        await client.slots.accept(event.data.slotId);
        console.log('Submission accepted!');
      } catch (err) {
        console.error('Failed to accept:', err);
      }
    }

    if (event.event === 'slot.accepted') {
      console.log(`Slot ${event.data?.slotId} accepted — downloading artifacts...`);
      await downloadSlotArtifacts(event.data.slotId);
    }
  });

  server.listen(WEBHOOK_PORT, () => {
    console.log(`\nWebhook server listening on http://localhost:${WEBHOOK_PORT}/webhook`);
    console.log('Waiting for playtest events...\n');
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== We Playtest Games — SDK Example ===\n');

  // Show who we are
  const user = await client.auth.me();
  console.log(`Logged in as ${user.email} (${user.role})`);

  const balance = await client.billing.getBalance();
  console.log(`Credit balance: $${balance.balanceCents / 100}\n`);

  // Set up game + webhook + playtests
  const gameId = await getOrCreateGame();
  await setupWebhook();
  await orderPlaytests(gameId);

  // Start listening for webhook events
  startWebhookServer();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
