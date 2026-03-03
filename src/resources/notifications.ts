import type { HttpClient } from '../http.js';
import type { Notification, NotificationsListParams } from '../types.js';
import { makePaginated, type Paginated } from '../pagination.js';

export class NotificationsResource {
  constructor(private http: HttpClient) {}

  /** List notifications (paginated) */
  list(params?: NotificationsListParams): Paginated<Notification> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ notifications: Notification[]; unreadCount: number }>(
          '/notifications',
          {
            limit: p.limit,
            cursor: p.cursor,
            unread: (params as NotificationsListParams | undefined)?.unread ? 'true' : undefined,
          },
        );
        return { data: res.data.notifications, meta: res.meta };
      },
      params ?? {},
    );
  }

  /** Mark all notifications as read */
  async markAllRead(): Promise<{ message: string; updatedCount: number }> {
    return this.http.post<{ message: string; updatedCount: number }>('/notifications/mark-all-read');
  }
}
