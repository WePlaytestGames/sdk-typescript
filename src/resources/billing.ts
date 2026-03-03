import type { HttpClient } from '../http.js';
import type { Balance, Payment, PurchaseCreditParams, PurchaseCreditResponse, PaginationParams } from '../types.js';
import { makePaginated, type Paginated } from '../pagination.js';

export class BillingResource {
  constructor(private http: HttpClient) {}

  /** Get current credit balance */
  async getBalance(): Promise<Balance> {
    return this.http.get<Balance>('/billing/balance');
  }

  /** List payment history (paginated) */
  payments(params?: PaginationParams): Paginated<Payment> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ payments: Payment[] }>('/billing/payments', {
          limit: p.limit,
          cursor: p.cursor,
        });
        return { data: res.data.payments, meta: res.meta };
      },
      params ?? {},
    );
  }

  /** Get a single payment by ID */
  async getPayment(paymentId: string): Promise<Payment> {
    const data = await this.http.get<{ payment: Payment }>(`/billing/payments/${paymentId}`);
    return data.payment;
  }

  /** Purchase credit via Stripe Checkout */
  async purchaseCredit(params: PurchaseCreditParams): Promise<PurchaseCreditResponse> {
    return this.http.post<PurchaseCreditResponse>('/billing/credit', params);
  }
}
