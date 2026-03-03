import type { HttpClient } from '../http.js';
import type { Submission, SubmissionsListParams } from '../types.js';
import { makePaginated, type Paginated } from '../pagination.js';

export class SubmissionsResource {
  constructor(private http: HttpClient) {}

  /** List submissions across all your games (paginated) */
  list(params?: SubmissionsListParams): Paginated<Submission> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ submissions: Submission[] }>('/playtests/submissions', {
          limit: p.limit,
          cursor: p.cursor,
          status: (params as SubmissionsListParams | undefined)?.status,
        });
        return { data: res.data.submissions, meta: res.meta };
      },
      params ?? {},
    );
  }
}
