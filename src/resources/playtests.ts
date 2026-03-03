import type { HttpClient } from '../http.js';
import type {
  PlaytestRequest,
  PlaytestDetail,
  PlaytestCreateParams,
  PlaytestCreateResponse,
  PlaytestUpdateParams,
  PlaytestSlot,
  PaginationParams,
} from '../types.js';
import { makePaginated, type Paginated } from '../pagination.js';

export class PlaytestsResource {
  constructor(private http: HttpClient) {}

  /** List playtest requests for a game (paginated) */
  list(gameId: string, params?: PaginationParams): Paginated<PlaytestRequest> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ playtests: PlaytestRequest[]; eligibleForFreeTrial: boolean }>(
          `/games/${gameId}/playtests`,
          { limit: p.limit, cursor: p.cursor },
        );
        return { data: res.data.playtests, meta: res.meta };
      },
      params ?? {},
    );
  }

  /** Create a playtest request for a game */
  async create(gameId: string, params?: PlaytestCreateParams): Promise<PlaytestCreateResponse> {
    return this.http.post<PlaytestCreateResponse>(`/games/${gameId}/playtests`, params);
  }

  /** Get playtest request details */
  async get(playtestId: string): Promise<PlaytestDetail> {
    const data = await this.http.get<{ playtest: PlaytestDetail }>(`/playtests/${playtestId}`);
    return data.playtest;
  }

  /** Update a playtest request */
  async update(playtestId: string, params: PlaytestUpdateParams): Promise<PlaytestRequest> {
    const data = await this.http.patch<{ playtest: PlaytestRequest }>(`/playtests/${playtestId}`, params);
    return data.playtest;
  }

  /** List slots for a playtest (paginated) */
  slots(playtestId: string, params?: PaginationParams): Paginated<PlaytestSlot> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ slots: PlaytestSlot[] }>(
          `/playtests/${playtestId}/slots`,
          { limit: p.limit, cursor: p.cursor },
        );
        return { data: res.data.slots, meta: res.meta };
      },
      params ?? {},
    );
  }
}
