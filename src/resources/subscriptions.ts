import type { HttpClient } from '../http.js';
import type {
  PlanKey,
  PlaytestHoursBalance,
  PlaytestHoursEntry,
  Subscription,
  SubscriptionCheckoutResponse,
  SubscriptionPlan,
  SubscriptionSummary,
} from '../types.js';

/**
 * Indie / Studio subscriptions and the playtest-hours balance they grant.
 *
 * Playtest hours are stored in minutes (1 playtest hour = 60). When an order's
 * hours are covered by the balance, `games.createPlaytest()` pays with hours
 * automatically and returns `paidWithPlaytestHours: true`.
 */
export class SubscriptionsResource {
  constructor(private http: HttpClient) {}

  /** List the available plans with prices and playtest hours per cycle */
  async listPlans(): Promise<SubscriptionPlan[]> {
    const data = await this.http.get<{ plans: SubscriptionPlan[]; configured: boolean }>('/billing/plans');
    return data.plans;
  }

  /** Current subscription (null when not subscribed) and playtest hours balance */
  async get(): Promise<SubscriptionSummary> {
    return this.http.get<SubscriptionSummary>('/billing/subscription');
  }

  /**
   * Start Stripe Checkout for a plan. A human completes the checkout at
   * `checkoutUrl`; with an active subscription on another plan this is a plan
   * change (the old plan ends once the new plan's payment succeeds).
   */
  async createCheckout(planKey: PlanKey): Promise<SubscriptionCheckoutResponse> {
    return this.http.post<SubscriptionCheckoutResponse>('/billing/subscription/checkout', { planKey });
  }

  /** Cancel at the end of the current billing period (hours are kept) */
  async cancel(): Promise<Subscription> {
    const data = await this.http.post<{ subscription: Subscription }>('/billing/subscription/cancel', {});
    return data.subscription;
  }

  /** Undo a pending cancellation */
  async resume(): Promise<Subscription> {
    const data = await this.http.post<{ subscription: Subscription }>('/billing/subscription/resume', {});
    return data.subscription;
  }

  /** Playtest hours balance */
  async playtestHours(): Promise<PlaytestHoursBalance> {
    return this.http.get<PlaytestHoursBalance>('/billing/playtest-hours');
  }

  /** Playtest hours ledger, newest first */
  async playtestHoursHistory(): Promise<PlaytestHoursEntry[]> {
    const data = await this.http.get<{ entries: PlaytestHoursEntry[] }>('/billing/playtest-hours/history');
    return data.entries;
  }
}
