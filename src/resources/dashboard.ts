import type { HttpClient } from '../http.js';
import type { DashboardStats } from '../types.js';

export class DashboardResource {
  constructor(private http: HttpClient) {}

  /** Get dashboard statistics */
  async stats(): Promise<DashboardStats> {
    return this.http.get<DashboardStats>('/playtests/dashboard/stats');
  }
}
