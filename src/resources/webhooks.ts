import type { HttpClient } from '../http.js';
import type {
  Webhook,
  WebhookCreateParams,
  WebhookCreateResponse,
  WebhookUpdateParams,
  WebhookDelivery,
  WebhookTestResponse,
  PaginationParams,
} from '../types.js';
import { makePaginated, type Paginated } from '../pagination.js';

export class WebhooksResource {
  constructor(private http: HttpClient) {}

  /** List all webhooks */
  async list(): Promise<Webhook[]> {
    const data = await this.http.get<{ webhooks: Webhook[] }>('/webhooks');
    return data.webhooks;
  }

  /** Create a webhook (returns webhook + secret) */
  async create(params: WebhookCreateParams): Promise<WebhookCreateResponse> {
    return this.http.post<WebhookCreateResponse>('/webhooks', params);
  }

  /** Update a webhook */
  async update(webhookId: string, params: WebhookUpdateParams): Promise<Webhook> {
    const data = await this.http.patch<{ webhook: Webhook }>(`/webhooks/${webhookId}`, params);
    return data.webhook;
  }

  /** Delete a webhook */
  async delete(webhookId: string): Promise<{ message: string }> {
    return this.http.del<{ message: string }>(`/webhooks/${webhookId}`);
  }

  /** List delivery attempts for a webhook (paginated) */
  deliveries(webhookId: string, params?: PaginationParams): Paginated<WebhookDelivery> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ deliveries: WebhookDelivery[] }>(
          `/webhooks/${webhookId}/deliveries`,
          { limit: p.limit, cursor: p.cursor },
        );
        return { data: res.data.deliveries, meta: res.meta };
      },
      params ?? {},
    );
  }

  /** Send a test event to a webhook */
  async test(webhookId: string): Promise<WebhookTestResponse> {
    return this.http.post<WebhookTestResponse>(`/webhooks/${webhookId}/test`);
  }

  /** Re-enable a disabled webhook */
  async enable(webhookId: string): Promise<{ message: string; isActive: boolean }> {
    return this.http.post<{ message: string; isActive: boolean }>(`/webhooks/${webhookId}/enable`);
  }

  /** Rotate webhook secret (returns new secret once) */
  async rotateSecret(webhookId: string): Promise<{ secret: string; message: string }> {
    return this.http.post<{ secret: string; message: string }>(`/webhooks/${webhookId}/rotate-secret`);
  }
}
