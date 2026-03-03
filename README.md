# We Playtest Games - TypeScript SDK

Official TypeScript/Node.js SDK for the [We Playtest Games](https://weplaytestgames.com) API.

## Installation

```bash
npm install @weplaytestgames/sdk
```

## Quickstart

```typescript
import { WPGClient } from '@weplaytestgames/sdk';

const client = new WPGClient({ apiKey: 'wpg_sk_...' });

// List your games
const page = await client.games.list().getPage();
console.log(page.data);

// Create a game
const game = await client.games.create({
  name: 'My Game',
  buildUrl: 'https://store.steampowered.com/app/123456',
});

// Order playtests
const result = await client.playtests.create({
  gameId: game.id,
  visibility: 'public',
  quantity: 3,
  durationMinutes: 60,
});
```

## Authentication

Get an API key from your [dashboard](https://app.weplaytestgames.com) or register programmatically:

```typescript
const { user, apiKey } = await WPGClient.registerWithApiKey({
  email: 'studio@example.com',
  password: 'securepassword',
  companyName: 'My Studio',
});
```

## Features

- **Type-safe** - Full TypeScript types for all requests and responses
- **Pagination** - Cursor-based pagination with `getPage()` and `getAll()` helpers
- **Retry with backoff** - Automatic retries on 429/5xx errors with exponential backoff (configurable via `maxRetries`)
- **Webhook verification** - `verifyWebhookSignature()` with replay protection
- **Idempotency** - Pass idempotency keys to mutating operations

## Configuration

```typescript
const client = new WPGClient({
  apiKey: 'wpg_sk_...',
  baseUrl: 'https://app.weplaytestgames.com/api/v1', // default
  timeout: 30_000,   // ms, default 30s
  maxRetries: 2,     // default 2 (3 total attempts), 0 to disable
});
```

## Available Resources

| Resource | Methods |
|----------|---------|
| `client.auth` | `me()`, `profile()`, `updateProfile()`, `categories()`, `devices()` |
| `client.games` | `list()`, `get()`, `create()`, `update()` |
| `client.playtests` | `list()`, `get()`, `create()`, `update()` |
| `client.slots` | `get()`, `accept()`, `reject()`, `downloadUrl()`, `transcript()` |
| `client.submissions` | `list()`, `get()` |
| `client.billing` | `getBalance()`, `payments()`, `getPayment()`, `purchaseCredit()` |
| `client.chat` | `contacts()`, `conversation()`, `sendMessage()`, `unreadCount()` |
| `client.webhooks` | `list()`, `create()`, `update()`, `delete()`, `test()`, `deliveries()` |
| `client.notifications` | `list()`, `markRead()`, `markAllRead()` |
| `client.dashboard` | `stats()` |

## Webhook Verification

```typescript
import { verifyWebhookSignature } from '@weplaytestgames/sdk';

const isValid = verifyWebhookSignature({
  payload: rawBody,
  signature: req.headers['x-wpg-signature'],
  timestamp: req.headers['x-wpg-timestamp'],
  secret: webhookSecret,
});
```

## Documentation

Full API documentation: [weplaytestgames.com/docs](https://weplaytestgames.com/docs)

## License

MIT
