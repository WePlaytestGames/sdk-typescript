import type { HttpClient } from '../http.js';
import type { ChatContact, ChatMessage, SendMessageParams, PaginationParams } from '../types.js';
import { makePaginated, type Paginated } from '../pagination.js';

export class ChatResource {
  constructor(private http: HttpClient) {}

  /** List chat contacts */
  async contacts(): Promise<ChatContact[]> {
    const data = await this.http.get<{ contacts: ChatContact[] }>('/chat/contacts');
    return data.contacts;
  }

  /** Get conversation messages (paginated) */
  conversation(conversationId: string, params?: PaginationParams): Paginated<ChatMessage> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ messages: ChatMessage[]; isBlocked: boolean }>(
          `/chat/conversations/${conversationId}`,
          { limit: p.limit, cursor: p.cursor },
        );
        return { data: res.data.messages, meta: res.meta };
      },
      params ?? {},
    );
  }

  /** Send a message in a conversation */
  async sendMessage(conversationId: string, params: SendMessageParams): Promise<ChatMessage> {
    const data = await this.http.post<{ message: ChatMessage }>(
      `/chat/conversations/${conversationId}/messages`,
      params,
    );
    return data.message;
  }

  /** Get total unread message count */
  async unreadCount(): Promise<number> {
    const data = await this.http.get<{ unreadCount: number }>('/chat/unread-count');
    return data.unreadCount;
  }
}
