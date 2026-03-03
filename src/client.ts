import { HttpClient } from './http.js';
import { AuthResource } from './resources/auth.js';
import { GamesResource } from './resources/games.js';
import { PlaytestsResource } from './resources/playtests.js';
import { SlotsResource } from './resources/slots.js';
import { SubmissionsResource } from './resources/submissions.js';
import { BillingResource } from './resources/billing.js';
import { ChatResource } from './resources/chat.js';
import { NotificationsResource } from './resources/notifications.js';
import { WebhooksResource } from './resources/webhooks.js';
import { DashboardResource } from './resources/dashboard.js';
import type {
  RegisterParams,
  RegisterResponse,
  RegisterWithApiKeyParams,
  RegisterWithApiKeyResponse,
} from './types.js';

export interface WPGClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  /** Maximum number of retries on retryable errors (default 2, 0 to disable) */
  maxRetries?: number;
}

const DEFAULT_BASE_URL = 'https://app.weplaytestgames.com/api/v1';

export class WPGClient {
  readonly auth: AuthResource;
  readonly games: GamesResource;
  readonly playtests: PlaytestsResource;
  readonly slots: SlotsResource;
  readonly submissions: SubmissionsResource;
  readonly billing: BillingResource;
  readonly chat: ChatResource;
  readonly notifications: NotificationsResource;
  readonly webhooks: WebhooksResource;
  readonly dashboard: DashboardResource;

  constructor(config: WPGClientConfig) {
    const http = new HttpClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
    });

    this.auth = new AuthResource(http);
    this.games = new GamesResource(http);
    this.playtests = new PlaytestsResource(http);
    this.slots = new SlotsResource(http);
    this.submissions = new SubmissionsResource(http);
    this.billing = new BillingResource(http);
    this.chat = new ChatResource(http);
    this.notifications = new NotificationsResource(http);
    this.webhooks = new WebhooksResource(http);
    this.dashboard = new DashboardResource(http);
  }

  /** Register a new game owner account (no API key required) */
  static async register(
    params: RegisterParams,
    options?: { baseUrl?: string; timeout?: number },
  ): Promise<RegisterResponse> {
    const http = new HttpClient({
      baseUrl: options?.baseUrl ?? DEFAULT_BASE_URL,
      timeout: options?.timeout,
    });
    return new AuthResource(http).register(params);
  }

  /** Register a new game owner account and receive an API key (no API key required) */
  static async registerWithApiKey(
    params: RegisterWithApiKeyParams,
    options?: { baseUrl?: string; timeout?: number },
  ): Promise<RegisterWithApiKeyResponse> {
    const http = new HttpClient({
      baseUrl: options?.baseUrl ?? DEFAULT_BASE_URL,
      timeout: options?.timeout,
    });
    return new AuthResource(http).registerWithApiKey(params);
  }
}
