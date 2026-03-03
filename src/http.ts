import { WPGError } from './error.js';
import type { Meta } from './types.js';

export interface HttpClientConfig {
  apiKey?: string;
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
}

interface RequestOptions {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  idempotencyKey?: string;
}

interface ApiResponse<T = unknown> {
  data: T;
  meta: Meta;
}

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function isRetryableError(error: unknown): boolean {
  if (error instanceof WPGError) {
    return RETRYABLE_STATUS_CODES.has(error.status);
  }
  // Network errors (fetch throws TypeError on network failure)
  if (error instanceof TypeError) return true;
  // AbortError from timeout
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  return false;
}

function retryDelay(attempt: number, retryAfter?: number): number {
  if (retryAfter !== undefined && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 8000);
  }
  const base = 500 * Math.pow(2, attempt);
  const jitter = Math.random() * 250;
  return Math.min(base + jitter, 8000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HttpClient {
  private apiKey: string | undefined;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: HttpClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout ?? 30_000;
    this.maxRetries = config.maxRetries ?? 2;
  }

  async request<T>(method: string, path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options?.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': '@weplaytestgames/sdk/0.1.0',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const bodyStr = options?.body ? JSON.stringify(options.body) : undefined;

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url.toString(), {
          method,
          headers,
          body: bodyStr,
          signal: controller.signal,
        });

        const json = await response.json() as Record<string, unknown>;

        if (!response.ok) {
          const error = json?.error as Record<string, unknown> | undefined;
          const meta = json?.meta as Record<string, unknown> | undefined;
          const wpgError = new WPGError({
            code: (error?.code as string) ?? 'INTERNAL_ERROR',
            message: (error?.message as string) ?? response.statusText,
            status: response.status,
            details: error?.details as { field: string; message: string }[] | undefined,
            requestId: meta?.requestId as string | undefined,
          });

          if (attempt < this.maxRetries && RETRYABLE_STATUS_CODES.has(response.status)) {
            lastError = wpgError;
            const retryAfterHeader = response.headers.get('Retry-After');
            const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
            await sleep(retryDelay(attempt, retryAfter));
            continue;
          }

          throw wpgError;
        }

        return {
          data: json.data as T,
          meta: json.meta as Meta,
        };
      } catch (error) {
        if (error instanceof WPGError) throw error;
        lastError = error;
        if (attempt < this.maxRetries && isRetryableError(error)) {
          await sleep(retryDelay(attempt));
          continue;
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError;
  }

  /** GET request, returns unwrapped data */
  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const res = await this.request<T>('GET', path, { query });
    return res.data;
  }

  /** GET request, returns full envelope (for paginated endpoints) */
  async getPage<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, { query });
  }

  /** POST request, returns unwrapped data */
  async post<T>(path: string, body?: unknown, idempotencyKey?: string): Promise<T> {
    const res = await this.request<T>('POST', path, { body, idempotencyKey });
    return res.data;
  }

  /** PATCH request, returns unwrapped data */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.request<T>('PATCH', path, { body });
    return res.data;
  }

  /** DELETE request, returns unwrapped data */
  async del<T>(path: string): Promise<T> {
    const res = await this.request<T>('DELETE', path);
    return res.data;
  }
}
